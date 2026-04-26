export * from "./scraping.js";
export * from "./cv.js";

export type OnboardingStep =
  | 'personal-info'
  | 'academic-background'
  | 'journey'
  | 'looking-for'
  | 'background'
  | 'complete'

export interface PersonalInfoPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
}

export interface AcademicBackgroundPayload {
  university: string
  degree: string
  specialization: string
  graduationYear: string
}

export type JourneyType = 'Student' | 'Graduate' | 'Job Seeker'

export interface JourneyPayload {
  journey: JourneyType
}

export type OpportunityType =
  | 'Internship'
  | 'PFE'
  | 'Job'
  | 'Remote'
  | 'Freelance'
  | 'Other'

export interface LookingForPayload {
  opportunities: OpportunityType[]
}

export type Domain =
  | 'IT'
  | 'Architecture'
  | 'Medicine'
  | 'Business'
  | 'Design'
  | 'Other'

export interface BackgroundPayload {
  domain: Domain
}

export interface OnboardingStatus {
  currentStep: OnboardingStep
  completed: boolean
}

export interface OnboardingData {
  personalInfo?: PersonalInfoPayload
  academicBackground?: AcademicBackgroundPayload
  journey?: JourneyPayload
  lookingFor?: LookingForPayload
  background?: BackgroundPayload
}