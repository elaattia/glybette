import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import type {
    OnboardingStep,
    PersonalInfoPayload,
    AcademicBackgroundPayload,
    JourneyPayload,
    LookingForPayload,
    BackgroundPayload,
    OnboardingData,
} from "@glybette/types";
import { useAuth } from "@/hooks/useAuth";
import { resolveAuthenticatedDestination } from "@/lib/auth-return-path";
import { useUser } from "@/hooks/useUser";

export const ONBOARDING_DONE_KEY = "gb-onboarding-done";

function persistProfile(data: OnboardingData) {
    try {
        localStorage.setItem("gb-onboarding-profile", JSON.stringify(data));
    } catch { }
}

async function syncProfileToServer(data: OnboardingData, isAuthenticated: boolean) {
    if (!isAuthenticated || data.role === "enterprise") return;
    try {
        const flat = {
            firstName: data.personalInfo?.firstName,
            lastName: data.personalInfo?.lastName,
            email: data.personalInfo?.email,
            phone: data.personalInfo?.phone,
            country: data.personalInfo?.country,
            university: data.academicBackground?.university,
            degree: data.academicBackground?.degree,
            specialization: data.academicBackground?.specialization,
            graduationYear: data.academicBackground?.graduationYear,
            journey: data.journey?.journey,
            opportunities: data.lookingFor?.opportunities ?? [],
            domain: data.background?.domain,
        };
        await apiRequest("/api/users/me/profile", {
            method: "PUT",
            body: JSON.stringify({ profile: flat }),
        });
    } catch { }
}

export function useOnboarding() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { refetch } = useUser();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("role-select");
    const [data, setData] = useState<OnboardingData>({});

    const STEPS: OnboardingStep[] = data.role === "enterprise"
        ? ["role-select", "enterprise-info", "complete"]
        : ["role-select", "personal-info", "academic-background", "journey", "looking-for", "background", "complete"];

    const currentIndex = STEPS.indexOf(currentStep) === -1 ? 0 : STEPS.indexOf(currentStep);
    const totalSteps = Math.max(1, STEPS.length - 1);
    const progress = Math.min(100, Math.round(((currentIndex + 1) / totalSteps) * 100));

    function goNext() {
        const next = currentIndex + 1;
        if (next < STEPS.length) setCurrentStep(STEPS[next]);
    }

    function goBack() {
        const prev = currentIndex - 1;
        if (prev >= 0) setCurrentStep(STEPS[prev]);
    }

    function updateAndPersist(newData: OnboardingData) {
        persistProfile(newData);
        syncProfileToServer(newData, isAuthenticated);
        return newData;
    }

    function saveRole(role: "student" | "enterprise") {
        const newData = { ...data, role };
        setData(updateAndPersist(newData));
        if (role === "enterprise") {
            setCurrentStep("enterprise-info");
        } else {
            setCurrentStep("personal-info");
        }
    }

    function saveEnterpriseInfo(companyName: string) {
        const newData = { ...data, companyName };
        setData(updateAndPersist(newData));
        goNext();
    }

    function savePersonalInfo(payload: PersonalInfoPayload) {
        const newData = { ...data, personalInfo: payload };
        setData(updateAndPersist(newData));
        goNext();
    }

    function saveAcademicBackground(payload: AcademicBackgroundPayload) {
        const newData = { ...data, academicBackground: payload };
        setData(updateAndPersist(newData));
        goNext();
    }

    function saveJourney(payload: JourneyPayload) {
        const newData = { ...data, journey: payload };
        setData(updateAndPersist(newData));
        goNext();
    }

    function saveLookingFor(payload: LookingForPayload) {
        const newData = { ...data, lookingFor: payload };
        setData(updateAndPersist(newData));
        goNext();
    }

    function saveBackground(payload: BackgroundPayload) {
        const newData = { ...data, background: payload };
        setData(updateAndPersist(newData));
        goNext();
    }

    function skip() {
        goNext();
    }

    async function markOnboardingDone() {
        try {
            if (isAuthenticated && data.role) {
                await apiRequest("/api/users/me/onboarding", {
                    method: "PUT",
                    body: JSON.stringify({
                        role: data.role,
                        companyName: data.companyName,
                    }),
                });
                await refetch();
            }
            localStorage.setItem(ONBOARDING_DONE_KEY, "true");
            navigate(resolveAuthenticatedDestination(null, { baseRole: data.role }, true), { replace: true });
        } catch (error) {
            console.error(error);
        }
    }

    return {
        currentStep,
        currentIndex,
        totalSteps,
        progress,
        data,
        goBack,
        skip,
        saveRole,
        saveEnterpriseInfo,
        savePersonalInfo,
        saveAcademicBackground,
        saveJourney,
        saveLookingFor,
        saveBackground,
        markOnboardingDone,
    };
}