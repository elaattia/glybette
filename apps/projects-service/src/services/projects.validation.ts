import {
    PROJECT_DIFFICULTIES,
    PROJECT_WORK_MODES,
    type CreateJoinRequestRequest,
    type CreateProjectCommentRequest,
    type CreateProjectRequest,
    type DecideJoinRequestRequest,
    type UpdateProjectRequest,
} from "@glybette/contracts";
import { z } from "@glybette/env";
import { BadRequestError } from "@glybette/utils";

const roleRequirementSchema = z.object({
    id: z.string().min(1).max(80).optional(),
    title: z.string().trim().min(2).max(80),
    quantity: z.coerce.number().int().min(1).max(20),
    skills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});

const milestoneSchema = z.object({
    id: z.string().min(1).max(80).optional(),
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().min(2).max(800),
    status: z.enum(["todo", "in_progress", "done"]).default("todo"),
});

const engagementSchema = z.object({
    hoursPerWeek: z.coerce.number().int().min(1).max(80),
    workMode: z.enum(PROJECT_WORK_MODES),
});

const upsertProjectSchema = z.object({
    title: z.string().trim().min(3).max(120),
    shortDescription: z.string().trim().min(10).max(240),
    description: z.string().trim().min(20).max(6000),
    domain: z.string().trim().min(2).max(80),
    difficulty: z.enum(PROJECT_DIFFICULTIES),
    technologies: z.array(z.string().trim().min(1).max(40)).max(20),
    teamSizeTarget: z.coerce.number().int().min(1).max(50),
    engagement: engagementSchema,
    openRoles: z.array(roleRequirementSchema).min(1).max(12),
    milestones: z.array(milestoneSchema).max(20),
});

const createProjectSchema = upsertProjectSchema.extend({
    publish: z.boolean().optional(),
});

const updateProjectSchema = upsertProjectSchema.partial().extend({
    publish: z.boolean().optional(),
});

const joinRequestSchema = z.object({
    message: z.string().trim().max(1000).optional(),
});

const decideJoinRequestSchema = z.object({
    reason: z.string().trim().max(400).optional(),
});

const commentSchema = z.object({
    content: z.string().trim().min(1).max(4000),
    parentId: z.string().trim().min(1).optional(),
});

const listProjectsQuerySchema = z.object({
    q: z.string().trim().max(80).optional(),
    domain: z.string().trim().max(80).optional(),
    difficulty: z.enum(PROJECT_DIFFICULTIES).optional(),
    technology: z.string().trim().max(40).optional(),
    mine: z
        .enum(["true", "false"])
        .optional()
        .transform((v) => v === "true"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

function parseOrThrow<T>(result: z.SafeParseReturnType<unknown, T>, fallbackMessage: string): T {
    if (!result.success) {
        const issue = result.error.issues[0];
        throw new BadRequestError(issue?.message ?? fallbackMessage);
    }
    return result.data;
}

export function validateListProjectsQuery(value: unknown): ListProjectsQuery {
    return parseOrThrow(listProjectsQuerySchema.safeParse(value), "Invalid list query.");
}

export function validateCreateProjectPayload(value: unknown): CreateProjectRequest {
    return parseOrThrow(createProjectSchema.safeParse(value), "Invalid project payload.");
}

export function validateUpdateProjectPayload(value: unknown): UpdateProjectRequest {
    return parseOrThrow(updateProjectSchema.safeParse(value), "Invalid project update payload.");
}

export function validateCreateJoinRequestPayload(value: unknown): CreateJoinRequestRequest {
    return parseOrThrow(joinRequestSchema.safeParse(value ?? {}), "Invalid join request payload.");
}

export function validateDecideJoinRequestPayload(value: unknown): DecideJoinRequestRequest {
    return parseOrThrow(decideJoinRequestSchema.safeParse(value ?? {}), "Invalid join decision payload.");
}

export function validateCreateCommentPayload(value: unknown): CreateProjectCommentRequest {
    return parseOrThrow(commentSchema.safeParse(value), "Invalid comment payload.");
}

export function validateObjectIdParam(value: string | undefined, name = "id"): string {
    const candidate = (value ?? "").trim();
    if (!/^[0-9a-fA-F]{24}$/.test(candidate)) {
        throw new BadRequestError(`Invalid ${name}.`);
    }
    return candidate;
}
