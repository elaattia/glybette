export const AUTH_EXCHANGE = "glybette.auth.events";
export const AUTH_EXCHANGE_TYPE = "topic";
export const NOTIFICATIONS_AUTH_OTP_QUEUE = "glybette.notifications.auth_otp";
export const NOTIFICATIONS_AUTH_OTP_QUEUE_DLQ = "glybette.notifications.auth_otp.dlq";
export const NOTIFICATIONS_AUTH_OTP_QUEUE_DLX = "glybette.notifications.auth_otp.dlx";
export const ROUTING_KEY_AUTH_OTP_SEND = "auth.otp.send";

export const PROJECTS_EXCHANGE = "glybette.projects.events";
export const PROJECTS_EXCHANGE_TYPE = "topic";
export const ROUTING_KEY_PROJECT_JOIN_REQUEST_CREATED = "projects.join_request.created";
export const ROUTING_KEY_PROJECT_JOIN_REQUEST_APPROVED = "projects.join_request.approved";
export const ROUTING_KEY_PROJECT_JOIN_REQUEST_REJECTED = "projects.join_request.rejected";
export const ROUTING_KEY_PROJECT_COMMENT_CREATED = "projects.comment.created";

export const NOTIFICATIONS_PROJECTS_QUEUE = "glybette.notifications.projects";
export const NOTIFICATIONS_PROJECTS_QUEUE_DLQ = "glybette.notifications.projects.dlq";
export const NOTIFICATIONS_PROJECTS_QUEUE_DLX = "glybette.notifications.projects.dlx";

export const USERS_EXCHANGE = "glybette.users.events";
export const USERS_EXCHANGE_TYPE = "topic";
export const ROUTING_KEY_USERS_PROFILE_UPSERTED = "users.profile.upserted";

export const PROJECTS_USER_PROJECTION_QUEUE = "glybette.projects.user_projection";
export const PROJECTS_USER_PROJECTION_QUEUE_DLX = "glybette.projects.user_projection.dlx";
export const PROJECTS_USER_PROJECTION_QUEUE_DLQ = "glybette.projects.user_projection.dlq";

export const PORTFOLIO_USER_PROJECTION_QUEUE = "glybette.portfolio.user_projection";
export const PORTFOLIO_USER_PROJECTION_QUEUE_DLX = "glybette.portfolio.user_projection.dlx";
export const PORTFOLIO_USER_PROJECTION_QUEUE_DLQ = "glybette.portfolio.user_projection.dlq";

export const CV_USER_PROJECTION_QUEUE = "glybette.cv.user_projection";
export const CV_USER_PROJECTION_QUEUE_DLX = "glybette.cv.user_projection.dlx";
export const CV_USER_PROJECTION_QUEUE_DLQ = "glybette.cv.user_projection.dlq";
