export class UnauthorizedError extends Error {
    readonly statusCode = 401;
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export class BadRequestError extends Error {
    readonly statusCode = 400;
    constructor(message = "Bad request") {
        super(message);
        this.name = "BadRequestError";
    }
}

export class NotFoundError extends Error {
    readonly statusCode = 404;
    constructor(message = "Not found") {
        super(message);
        this.name = "NotFoundError";
    }
}

export class ServiceUnavailableError extends Error {
    readonly statusCode = 503;
    constructor(message = "Service unavailable") {
        super(message);
        this.name = "ServiceUnavailableError";
    }
}

export class InternalServerError extends Error {
    readonly statusCode = 500;
    constructor(message = "Internal server error") {
        super(message);
        this.name = "InternalServerError";
    }
}
