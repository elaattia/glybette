import amqp from "amqplib";
import type { Channel, ConsumeMessage } from "amqplib";
import {
    AUTH_EMAIL_QUEUE,
    AUTH_EMAIL_QUEUE_DLX,
    AUTH_EMAIL_QUEUE_DLQ,
    AUTH_EXCHANGE,
    AUTH_EXCHANGE_TYPE,
    PROJECTS_EXCHANGE,
    PROJECTS_EXCHANGE_TYPE,
    ROUTING_KEY_AUTH_OTP_SEND,
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
