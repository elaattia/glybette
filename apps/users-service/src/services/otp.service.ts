import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import mongoose from "mongoose";
import type { UsersServiceEnv } from "../config/env.js";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "@glybette/utils";
import {
    OTP_PURPOSE_EMAIL_VERIFICATION,
    ROUTING_KEY_AUTH_OTP_SEND,
    buildEmailVerificationOtpContent,
    type OtpEmailRequestedEvent,
    type RabbitMqClient,
} from "@glybette/messaging";
import { generateOtpCode, hashOtpCode } from "./otp-utils.js";

type BetterAuthUserDocument = {
    _id: mongoose.Types.ObjectId;
    email?: string;
    emailVerifiedAt?: Date | null;
};

type EmailOtpDocument = {
    _id: mongoose.Types.ObjectId;
    userId: string;
    email: string;
    purpose: string;
    codeHash: string;
    expiresAt: Date;
    lastSentAt: Date;
    attempts: number;
    maxAttempts: number;
    usedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

const OTP_COLLECTION = "auth_email_otps";

export class OtpService {
    constructor(
        private readonly env: UsersServiceEnv,
        private rabbit: RabbitMqClient | null = null,
    ) {}

    setRabbitClient(client: RabbitMqClient): void {
        this.rabbit = client;
    }

    async ensureIndexes(): Promise<void> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        await db.collection<EmailOtpDocument>(OTP_COLLECTION).createIndexes([
            { key: { userId: 1, purpose: 1, expiresAt: 1 } },
            { key: { createdAt: 1 } },
        ]);
    }

    async requestVerificationOtp(userId: string): Promise<{ expiresInSeconds: number; cooldownSeconds: number }> {
        if (this.env.EMAIL_DELIVERY_MODE === "service" && !this.rabbit) {
            console.warn(
                "[users-service] OTP request rejected because RabbitMQ is unavailable.",
            );
            throw new ServiceUnavailableError(
                "OTP delivery service is temporarily unavailable. Please try again shortly.",
            );
        }

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        const user = await db.collection<BetterAuthUserDocument>("users").findOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { projection: { email: 1, emailVerifiedAt: 1 } },
        );
        if (!user) {
            throw new NotFoundError("User not found");
        }

        if (!user.email) {
            throw new BadRequestError("Email is required to verify this account");
        }

        if (user.emailVerifiedAt) {
            throw new BadRequestError("Email is already verified");
        }

        const existingOtp = await db.collection<EmailOtpDocument>(OTP_COLLECTION).findOne(
            {
                userId,
                purpose: OTP_PURPOSE_EMAIL_VERIFICATION,
                usedAt: null,
                expiresAt: { $gt: new Date() },
            },
            { sort: { createdAt: -1 } },
        );

        const now = new Date();
        if (existingOtp) {
            const secondsSinceLastSend = Math.floor(
                (now.getTime() - existingOtp.lastSentAt.getTime()) / 1000,
            );
            if (secondsSinceLastSend < this.env.OTP_COOLDOWN_SECONDS) {
                throw new BadRequestError("Please wait before requesting another OTP");
            }
        }

        const otpCode = generateOtpCode();
        const codeHash = this.hashCode(otpCode);
        const expiresAt = new Date(now.getTime() + this.env.OTP_TTL_SECONDS * 1000);
        const otpId = new mongoose.Types.ObjectId();

        await db.collection<EmailOtpDocument>(OTP_COLLECTION).insertOne({
            _id: otpId,
            userId,
            email: user.email,
            purpose: OTP_PURPOSE_EMAIL_VERIFICATION,
            codeHash,
            expiresAt,
            lastSentAt: now,
            attempts: 0,
            maxAttempts: this.env.OTP_MAX_ATTEMPTS,
            usedAt: null,
            createdAt: now,
            updatedAt: now,
        });

        const event: OtpEmailRequestedEvent = {
            eventId: otpId.toString(),
            correlationId: randomUUID(),
            userId,
            email: user.email,
            otpCode,
            purpose: OTP_PURPOSE_EMAIL_VERIFICATION,
            expiresAtIso: expiresAt.toISOString(),
            requestedAtIso: now.toISOString(),
        };
        try {
            await this.deliverOtp(event);
        } catch (error) {
            const message = error instanceof Error ? error.message : "unknown delivery error";
            console.warn(`[users-service] Failed to deliver OTP event. Reason: ${message}`);
            await db.collection<EmailOtpDocument>(OTP_COLLECTION).deleteOne({ _id: otpId });
            throw new ServiceUnavailableError(
                "OTP delivery service is temporarily unavailable. Please try again shortly.",
            );
        }

        return {
            expiresInSeconds: this.env.OTP_TTL_SECONDS,
            cooldownSeconds: this.env.OTP_COOLDOWN_SECONDS,
        };
    }

    async verifyEmailOtp(userId: string, code: string): Promise<void> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        const now = new Date();
        const otp = await db.collection<EmailOtpDocument>(OTP_COLLECTION).findOne(
            {
                userId,
                purpose: OTP_PURPOSE_EMAIL_VERIFICATION,
                usedAt: null,
                expiresAt: { $gt: now },
            },
            { sort: { createdAt: -1 } },
        );

        if (!otp) {
            throw new BadRequestError("OTP is missing or expired");
        }

        if (otp.attempts >= otp.maxAttempts) {
            throw new BadRequestError("OTP has reached the maximum number of attempts");
        }

        const incomingHash = this.hashCode(code);
        if (incomingHash !== otp.codeHash) {
            await db.collection<EmailOtpDocument>(OTP_COLLECTION).updateOne(
                { _id: otp._id },
                { $set: { updatedAt: now }, $inc: { attempts: 1 } },
            );
            throw new BadRequestError("Invalid OTP");
        }

        await db.collection<EmailOtpDocument>(OTP_COLLECTION).updateOne(
            { _id: otp._id },
            { $set: { usedAt: now, updatedAt: now } },
        );
        await db.collection<BetterAuthUserDocument>("users").updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { emailVerifiedAt: now } },
        );
    }

    private hashCode(code: string): string {
        return hashOtpCode(this.env.OTP_SECRET, code);
    }

    private async deliverOtp(event: OtpEmailRequestedEvent): Promise<void> {
        if (this.env.EMAIL_DELIVERY_MODE === "file") {
            await this.writeOtpToLocalLog(event);
            return;
        }

        if (!this.rabbit) {
            throw new Error("RabbitMQ client is unavailable");
        }

        this.rabbit.publishJson(ROUTING_KEY_AUTH_OTP_SEND, event, {
            idempotencyKey: event.eventId,
        });
    }

    private async writeOtpToLocalLog(event: OtpEmailRequestedEvent): Promise<void> {
        const outputDir = resolve(process.cwd(), this.env.EMAIL_LOG_DIR);
        const timestamp = Date.now();
        const outputPath = resolve(outputDir, `email${timestamp}.log`);
        const content = buildEmailVerificationOtpContent({
            otpCode: event.otpCode,
            expiresAtIso: event.expiresAtIso,
        });
        const body = [
            "From: no-reply@glybette.dev",
            `To: ${event.email}`,
            `Subject: ${content.subject}`,
            "Content-Type: text/html; charset=utf-8",
            "",
            content.html.trim(),
            "",
        ].join("\n");

        await mkdir(outputDir, { recursive: true });
        await writeFile(outputPath, body, "utf8");
        console.warn(`[users-service] OTP email written to local log: ${outputPath}`);
    }
}
