import { useState } from "react";
import { apiRequest } from "@/lib/api";
import type {
    OnboardingStep,
    PersonalInfoPayload,
    AcademicBackgroundPayload,
    JourneyPayload,
    LookingForPayload,
    BackgroundPayload,
    OnboardingData,
} from "@glybette/types";

const STEPS: OnboardingStep[] = [
    "personal-info",
    "academic-background",
    "journey",
    "looking-for",
    "background",
    "complete",
];

const STORAGE_KEY = "gb-onboarding-profile";
export const ONBOARDING_DONE_KEY = "gb-onboarding-done";

function persistProfile(data: OnboardingData) {
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
        lookingFor: data.lookingFor?.opportunities ?? [],
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flat));
    } catch {}
}

async function syncToServer(data: OnboardingData) {
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
    } catch {
    }
}

export function useOnboarding() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("personal-info");
    const [data, setData] = useState<OnboardingData>({});

    const currentIndex = STEPS.indexOf(currentStep);
    const totalSteps = STEPS.length - 1;
    const progress = Math.round((currentIndex / totalSteps) * 100);

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
        syncToServer(newData);
        return newData;
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

    
    function markOnboardingDone() {
        try {
            localStorage.setItem(ONBOARDING_DONE_KEY, "true");
        } catch {}
    }

    return {
        currentStep,
        currentIndex,
        totalSteps,
        progress,
        data,
        goBack,
        skip,
        savePersonalInfo,
        saveAcademicBackground,
        saveJourney,
        saveLookingFor,
        saveBackground,
        markOnboardingDone,
    };
}