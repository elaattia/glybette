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
    USERS_EXCHANGE,
    USERS_EXCHANGE_TYPE,
    ROUTING_KEY_USERS_PROFILE_UPSERTED,
    PROJECTS_USER_PROJECTION_QUEUE,
    PROJECTS_USER_PROJECTION_QUEUE_DLX,
    PROJECTS_USER_PROJECTION_QUEUE_DLQ,
    PORTFOLIO_USER_PROJECTION_QUEUE,
    PORTFOLIO_USER_PROJECTION_QUEUE_DLX,
    PORTFOLIO_USER_PROJECTION_QUEUE_DLQ,
    CV_USER_PROJECTION_QUEUE,
    CV_USER_PROJECTION_QUEUE_DLX,
    CV_USER_PROJECTION_QUEUE_DLQ,
} from "./topology.js";
export {
    connectRabbitMq,
    ensureAuthEmailTopology,
    ensureProjectsTopology,
    ensureUsersTopology,
    ensureProjectsUserProjectionTopology,
    ensurePortfolioUserProjectionTopology,
    ensureCvUserProjectionTopology,
    type RabbitMqClient,
} from "./rabbit.js";
export { PROJECT_EVENT_NAMES, type ProjectEventName, type ProjectDomainEvent, isProjectDomainEvent } from "./projects-contracts.js";
export {
    USER_EVENT_NAMES,
    type UserEventName,
    type UserPublicProfileSnapshot,
    type UserProfileUpsertedEvent,
    isUserProfileUpsertedEvent,
} from "./users-contracts.js";
