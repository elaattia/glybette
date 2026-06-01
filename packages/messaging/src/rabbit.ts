import amqp from "amqplib";
import type { Channel, ConsumeMessage } from "amqplib";
import {
    AUTH_EMAIL_QUEUE,
    AUTH_EMAIL_QUEUE_DLX,
    AUTH_EMAIL_QUEUE_DLQ,
    AUTH_EXCHANGE,
    AUTH_EXCHANGE_TYPE,
    CV_USER_PROJECTION_QUEUE,
    CV_USER_PROJECTION_QUEUE_DLQ,
    CV_USER_PROJECTION_QUEUE_DLX,
    PORTFOLIO_USER_PROJECTION_QUEUE,
    PORTFOLIO_USER_PROJECTION_QUEUE_DLQ,
    PORTFOLIO_USER_PROJECTION_QUEUE_DLX,
    PROJECTS_EXCHANGE,
    PROJECTS_EXCHANGE_TYPE,
    PROJECTS_USER_PROJECTION_QUEUE,
    PROJECTS_USER_PROJECTION_QUEUE_DLX,
    PROJECTS_USER_PROJECTION_QUEUE_DLQ,
    ROUTING_KEY_AUTH_OTP_SEND,
    ROUTING_KEY_USERS_PROFILE_UPSERTED,
    USERS_EXCHANGE,
    USERS_EXCHANGE_TYPE,
} from "./topology.js";

export interface RabbitMqClient {
    readonly channel: Channel;
    publishJson: <T>(routingKey: string, payload: T, headers?: Record<string, unknown>) => void;
    publishJsonTo: <T>(exchange: string, routingKey: string, payload: T, headers?: Record<string, unknown>) => void;
    consumeJson: <T>(queue: string, onMessage: (payload: T, raw: ConsumeMessage) => Promise<void>) => Promise<void>;
    close: () => Promise<void>;
}

export async function connectRabbitMq(url: string): Promise<RabbitMqClient> {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    const publishJsonTo = <T>(
        exchange: string,
        routingKey: string,
        payload: T,
        headers: Record<string, unknown> = {},
    ) => {
        const buffer = Buffer.from(JSON.stringify(payload));
        channel.publish(exchange, routingKey, buffer, {
            contentType: "application/json",
            persistent: true,
            headers,
        });
    };
    const publishJson = <T>(routingKey: string, payload: T, headers: Record<string, unknown> = {}) =>
        publishJsonTo(AUTH_EXCHANGE, routingKey, payload, headers);

    const consumeJson = async <T>(queue: string, onMessage: (payload: T, raw: ConsumeMessage) => Promise<void>) => {
        await channel.consume(queue, async (message) => {
            if (!message) {
                return;
            }

            try {
                const payload = JSON.parse(message.content.toString("utf8")) as T;
                await onMessage(payload, message);
                channel.ack(message);
            } catch (error) {
                console.error("RabbitMQ consumer failed, sending message to DLQ", error);
                channel.nack(message, false, false);
            }
        });
    };

    const close = async () => {
        await channel.close();
        await connection.close();
    };

    return {
        channel,
        publishJson,
        publishJsonTo,
        consumeJson,
        close,
    };
}

export async function ensureAuthEmailTopology(channel: Channel): Promise<void> {
    await channel.assertExchange(AUTH_EXCHANGE, AUTH_EXCHANGE_TYPE, { durable: true });
    await channel.assertExchange(AUTH_EMAIL_QUEUE_DLX, AUTH_EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(AUTH_EMAIL_QUEUE_DLQ, { durable: true });
    await channel.bindQueue(AUTH_EMAIL_QUEUE_DLQ, AUTH_EMAIL_QUEUE_DLX, ROUTING_KEY_AUTH_OTP_SEND);

    await channel.assertQueue(AUTH_EMAIL_QUEUE, {
        durable: true,
        deadLetterExchange: AUTH_EMAIL_QUEUE_DLX,
    });
    await channel.bindQueue(AUTH_EMAIL_QUEUE, AUTH_EXCHANGE, ROUTING_KEY_AUTH_OTP_SEND);
}

export async function ensureProjectsTopology(channel: Channel): Promise<void> {
    await channel.assertExchange(PROJECTS_EXCHANGE, PROJECTS_EXCHANGE_TYPE, { durable: true });
}

export async function ensureUsersTopology(channel: Channel): Promise<void> {
    await channel.assertExchange(USERS_EXCHANGE, USERS_EXCHANGE_TYPE, { durable: true });
}

export async function ensureProjectsUserProjectionTopology(channel: Channel): Promise<void> {
    await ensureUsersTopology(channel);

    await channel.assertExchange(PROJECTS_USER_PROJECTION_QUEUE_DLX, USERS_EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(PROJECTS_USER_PROJECTION_QUEUE_DLQ, { durable: true });
    await channel.bindQueue(
        PROJECTS_USER_PROJECTION_QUEUE_DLQ,
        PROJECTS_USER_PROJECTION_QUEUE_DLX,
        ROUTING_KEY_USERS_PROFILE_UPSERTED,
    );

    await channel.assertQueue(PROJECTS_USER_PROJECTION_QUEUE, {
        durable: true,
        deadLetterExchange: PROJECTS_USER_PROJECTION_QUEUE_DLX,
    });
    await channel.bindQueue(PROJECTS_USER_PROJECTION_QUEUE, USERS_EXCHANGE, ROUTING_KEY_USERS_PROFILE_UPSERTED);
}

export async function ensurePortfolioUserProjectionTopology(channel: Channel): Promise<void> {
    await ensureUsersTopology(channel);

    await channel.assertExchange(PORTFOLIO_USER_PROJECTION_QUEUE_DLX, USERS_EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(PORTFOLIO_USER_PROJECTION_QUEUE_DLQ, { durable: true });
    await channel.bindQueue(
        PORTFOLIO_USER_PROJECTION_QUEUE_DLQ,
        PORTFOLIO_USER_PROJECTION_QUEUE_DLX,
        ROUTING_KEY_USERS_PROFILE_UPSERTED,
    );

    await channel.assertQueue(PORTFOLIO_USER_PROJECTION_QUEUE, {
        durable: true,
        deadLetterExchange: PORTFOLIO_USER_PROJECTION_QUEUE_DLX,
    });
    await channel.bindQueue(PORTFOLIO_USER_PROJECTION_QUEUE, USERS_EXCHANGE, ROUTING_KEY_USERS_PROFILE_UPSERTED);
}

export async function ensureCvUserProjectionTopology(channel: Channel): Promise<void> {
    await ensureUsersTopology(channel);

    await channel.assertExchange(CV_USER_PROJECTION_QUEUE_DLX, USERS_EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(CV_USER_PROJECTION_QUEUE_DLQ, { durable: true });
    await channel.bindQueue(CV_USER_PROJECTION_QUEUE_DLQ, CV_USER_PROJECTION_QUEUE_DLX, ROUTING_KEY_USERS_PROFILE_UPSERTED);

    await channel.assertQueue(CV_USER_PROJECTION_QUEUE, {
        durable: true,
        deadLetterExchange: CV_USER_PROJECTION_QUEUE_DLX,
    });
    await channel.bindQueue(CV_USER_PROJECTION_QUEUE, USERS_EXCHANGE, ROUTING_KEY_USERS_PROFILE_UPSERTED);
}
