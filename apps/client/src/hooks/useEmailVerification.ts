import type {
    OtpRequestResponse,
    OtpVerifyResponse,
    VerificationStatusResponse,
} from "@glybette/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { setUnauthenticatedSessionAtom } from "@/state/auth/auth.atoms";

export const verificationQueryKeys = {
    status: ["auth", "verification-status"] as const,
};

async function getVerificationStatus() {
    return apiRequest<VerificationStatusResponse>("/api/auth/verification-status");
}

async function requestOtp() {
    return apiRequest<OtpRequestResponse>("/api/auth/otp/request", {
        method: "POST",
    });
}

async function verifyOtp(code: string) {
    return apiRequest<OtpVerifyResponse>("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
    });
}

export function useEmailVerification() {
    const auth = useAuth();
    const clearSession = useSetAtom(setUnauthenticatedSessionAtom);
    const queryClient = useQueryClient();

    const statusQuery = useQuery({
        queryKey: verificationQueryKeys.status,
        queryFn: getVerificationStatus,
        enabled: auth.isAuthenticated,
        staleTime: 10_000,
    });

    useEffect(() => {
        if (statusQuery.error instanceof ApiError && statusQuery.error.status === 401) {
            clearSession();
        }
    }, [clearSession, statusQuery.error]);

    const requestOtpMutation = useMutation({
        mutationFn: requestOtp,
    });

    const verifyOtpMutation = useMutation({
        mutationFn: verifyOtp,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: verificationQueryKeys.status });
            await queryClient.invalidateQueries({ queryKey: ["user", "me"] });
        },
    });

    return {
        ...statusQuery,
        requiresEmailVerification: Boolean(statusQuery.data?.requiresEmailVerification),
        email: statusQuery.data?.email,
        requestOtp: requestOtpMutation.mutateAsync,
        verifyOtp: verifyOtpMutation.mutateAsync,
        requestOtpMutation,
        verifyOtpMutation,
    };
}
