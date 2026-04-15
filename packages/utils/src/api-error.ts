/**
 * Standard JSON error body shape for API responses across gateway and services.
 */
export interface ApiErrorBody {
    error: {
        code: string;
        message: string;
    };
}

export function apiErrorJson(code: string, message: string): ApiErrorBody {
    return { error: { code, message } };
}
