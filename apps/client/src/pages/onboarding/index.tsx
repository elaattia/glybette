import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { StepPersonalInfo } from "@/components/onboarding/StepPersonalInfo";
import { StepAcademicBackground } from "@/components/onboarding/StepAcademicBackground";
import { StepJourney } from "@/components/onboarding/StepJourney";
import { StepLookingFor } from "@/components/onboarding/StepLookingFor";
import { StepBackground } from "@/components/onboarding/StepBackground";
import { StepComplete } from "@/components/onboarding/StepComplete";

export function OnboardingPage() {
    const {
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
    } = useOnboarding();

    function handleFinish() {
        console.log("Onboarding terminé !", data);
    }

    if (currentStep === "complete") {
        return (
            <OnboardingLayout currentStep={totalSteps} totalSteps={totalSteps} progress={100}>
                <StepComplete
                    name={data.personalInfo?.firstName ?? "there"}
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
            {currentStep === "personal-info" && <StepPersonalInfo onNext={savePersonalInfo} onSkip={skip} />}
            {currentStep === "academic-background" && (
                <StepAcademicBackground onNext={saveAcademicBackground} onSkip={skip} />
            )}
            {currentStep === "journey" && <StepJourney onNext={saveJourney} onSkip={skip} />}
            {currentStep === "looking-for" && <StepLookingFor onNext={saveLookingFor} onSkip={skip} />}
            {currentStep === "background" && <StepBackground onNext={saveBackground} onSkip={skip} />}
        </OnboardingLayout>
    );
}
