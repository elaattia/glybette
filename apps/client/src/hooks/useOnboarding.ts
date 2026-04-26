import { useState } from "react";
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

    function savePersonalInfo(payload: PersonalInfoPayload) {
        setData((d) => ({ ...d, personalInfo: payload }));
        goNext();
    }

    function saveAcademicBackground(payload: AcademicBackgroundPayload) {
        setData((d) => ({ ...d, academicBackground: payload }));
        goNext();
    }

    function saveJourney(payload: JourneyPayload) {
        setData((d) => ({ ...d, journey: payload }));
        goNext();
    }

    function saveLookingFor(payload: LookingForPayload) {
        setData((d) => ({ ...d, lookingFor: payload }));
        goNext();
    }

    function saveBackground(payload: BackgroundPayload) {
        setData((d) => ({ ...d, background: payload }));
        goNext();
    }

    function skip() {
        goNext();
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
    };
}
