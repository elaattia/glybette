import { useTranslation } from "react-i18next";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { StepRoleSelect } from "@/components/onboarding/StepRoleSelect";
import { StepEnterpriseInfo } from "@/components/onboarding/StepEnterpriseInfo";
import { StepPersonalInfo } from "@/components/onboarding/StepPersonalInfo";
import { StepAcademicBackground } from "@/components/onboarding/StepAcademicBackground";
import { StepJourney } from "@/components/onboarding/StepJourney";
import { StepLookingFor } from "@/components/onboarding/StepLookingFor";
import { StepBackground } from "@/components/onboarding/StepBackground";
import { StepComplete } from "@/components/onboarding/StepComplete";

export function OnboardingPage() {
    const { t: tCommon } = useTranslation("common");
    const {
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
    } = useOnboarding();

    const fallbackName = tCommon("user.fallbackName");

    function handleFinish() {
        markOnboardingDone();
    }

    if (currentStep === "complete") {
        return (
            <OnboardingLayout currentStep={totalSteps} totalSteps={totalSteps} progress={100}>
                <StepComplete
                    name={data.role === "enterprise" ? data.companyName ?? fallbackName : data.personalInfo?.firstName ?? fallbackName}
                    domain={data.background?.domain}
                    lookingFor={data.lookingFor?.opportunities}
                    onFinish={handleFinish}
                />
            </OnboardingLayout>
        );
    }

    return (
        <OnboardingLayout
            currentStep={currentIndex + 1}
            totalSteps={totalSteps}
            progress={progress}
            showBack={currentIndex > 0}
            onBack={goBack}>
            {currentStep === "role-select" && (
                <StepRoleSelect onNext={saveRole} />
            )}
            {currentStep === "enterprise-info" && (
                <StepEnterpriseInfo onNext={saveEnterpriseInfo} />
            )}
            {currentStep === "personal-info" && (
                <StepPersonalInfo onNext={savePersonalInfo} onSkip={skip} />
            )}
            {currentStep === "academic-background" && (
                <StepAcademicBackground onNext={saveAcademicBackground} onSkip={skip} />
            )}
            {currentStep === "journey" && (
                <StepJourney onNext={saveJourney} onSkip={skip} />
            )}
            {currentStep === "looking-for" && (
                <StepLookingFor onNext={saveLookingFor} onSkip={skip} />
            )}
            {currentStep === "background" && (
                <StepBackground onNext={saveBackground} onSkip={skip} />
            )}
        </OnboardingLayout>
    );
}
