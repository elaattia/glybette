export {
    OTP_PURPOSE_EMAIL_VERIFICATION,
    type OtpPurpose,
    type OtpEmailRequestedEvent,
    isOtpEmailRequestedEvent,
} from "./contracts.js";
export { buildEmailVerificationOtpContent, type OtpEmailContent, type OtpEmailContentInput } from "./email-content.js";
export {
    AUTH_EXCHANGE,
    AUTH_EXCHANGE_TYPE,
    AUTH_EMAIL_QUEUE,
    AUTH_EMAIL_QUEUE_DLQ,
    AUTH_EMAIL_QUEUE_DLX,
    ROUTING_KEY_AUTH_OTP_SEND,
    PROJECTS_EXCHANGE,
    PROJECTS_EXCHANGE_TYPE,
    ROUTING_KEY_PROJECT_JOIN_REQUEST_CREATED,
    ROUTING_KEY_PROJECT_JOIN_REQUEST_APPROVED,
    ROUTING_KEY_PROJECT_JOIN_REQUEST_REJECTED,
    ROUTING_KEY_PROJECT_COMMENT_CREATED,
} from "./topology.js";
export { connectRabbitMq, ensureAuthEmailTopology, ensureProjectsTopology, type RabbitMqClient } from "./rabbit.js";
export { PROJECT_EVENT_NAMES, type ProjectEventName, type ProjectDomainEvent, isProjectDomainEvent } from "./projects-contracts.js";
