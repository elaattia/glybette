export {
    OTP_PURPOSE_EMAIL_VERIFICATION,
    type OtpPurpose,
    type OtpEmailRequestedEvent,
    isOtpEmailRequestedEvent,
} from "./contracts.js";
export {
    buildEmailVerificationOtpContent,
    type OtpEmailContent,
    type OtpEmailContentInput,
} from "./email-content.js";
export {
    AUTH_EXCHANGE,
    AUTH_EXCHANGE_TYPE,
    AUTH_EMAIL_QUEUE,
    AUTH_EMAIL_QUEUE_DLQ,
    AUTH_EMAIL_QUEUE_DLX,
    ROUTING_KEY_AUTH_OTP_SEND,
} from "./topology.js";
export { connectRabbitMq, ensureAuthEmailTopology, type RabbitMqClient } from "./rabbit.js";
