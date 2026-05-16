export const AUTH_EXCHANGE = "glybette.auth.events";
export const AUTH_EXCHANGE_TYPE = "topic";
export const AUTH_EMAIL_QUEUE = "glybette.email.otp";
export const AUTH_EMAIL_QUEUE_DLQ = "glybette.email.otp.dlq";
export const AUTH_EMAIL_QUEUE_DLX = "glybette.email.otp.dlx";
export const ROUTING_KEY_AUTH_OTP_SEND = "auth.otp.send";

export const PROJECTS_EXCHANGE = "glybette.projects.events";
export const PROJECTS_EXCHANGE_TYPE = "topic";
export const ROUTING_KEY_PROJECT_JOIN_REQUEST_CREATED = "projects.join_request.created";
export const ROUTING_KEY_PROJECT_JOIN_REQUEST_APPROVED = "projects.join_request.approved";
export const ROUTING_KEY_PROJECT_JOIN_REQUEST_REJECTED = "projects.join_request.rejected";
export const ROUTING_KEY_PROJECT_COMMENT_CREATED = "projects.comment.created";
