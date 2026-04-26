import { z } from 'zod'

export const TemplateIdSchema = z.enum([
  'modern-strategy', 'academic-structured', 'creative-bold',
  'minimalist', 'tech', 'international', 'clean-design',
  'classic-reinvented', 'skills-focus', 'startup'
])

export const TemplateCategorySchema = z.enum(['ats', 'fancy'])

export const CreateCvSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: TemplateIdSchema,
  templateCategory: TemplateCategorySchema,
  sections: z.array(z.any()).optional(),
  fromUpload: z.boolean().optional(),
})

export const UpdateCvSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  templateId: TemplateIdSchema.optional(),
  sections: z.array(z.any()).optional(),
  isPublic: z.boolean().optional(),
})

export const AiEnhanceSchema = z.object({
  sectionType: z.string(),
  content: z.string().min(1),
  jobTitle: z.string().optional(),
  targetRole: z.string().optional(),
})

export const AiSuggestionsSchema = z.object({
  cvId: z.string(),
  targetRole: z.string().optional(),
  jobDescription: z.string().optional(),
})

export const AtsScoreSchema = z.object({
  targetRole: z.string().optional(),
})