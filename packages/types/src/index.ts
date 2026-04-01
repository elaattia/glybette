// Shared types for the monorepo

export type OnboardingStep =
  | 'personal-info'
  | 'academic-background'
  | 'journey'
  | 'looking-for'
  | 'background'
  | 'complete'

// Étape 1 — Personal Info
export interface PersonalInfoPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
}

// Étape 2 — Academic Background
export interface AcademicBackgroundPayload {
  university: string
  degree: string
  specialization: string
  graduationYear: string
}

// Étape 3 — Journey
export type JourneyType = 'Student' | 'Graduate' | 'Job Seeker'

export interface JourneyPayload {
  journey: JourneyType
}

// Étape 4 — Looking For
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

// Étape 5 — Background/Domain
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

// Status global
export interface OnboardingStatus {
  currentStep: OnboardingStep
  completed: boolean
}

// Payload complet
export interface OnboardingData {
  personalInfo?: PersonalInfoPayload
  academicBackground?: AcademicBackgroundPayload
  journey?: JourneyPayload
  lookingFor?: LookingForPayload
  background?: BackgroundPayload
}