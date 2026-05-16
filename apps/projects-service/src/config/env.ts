import { baseEnvSchema, z } from "@glybette/env";
import type { UploadProviderConfig } from "@glybette/uploads";

const projectsServiceEnvSchema = baseEnvSchema.extend({
    MONGODB_URI: z
        .string()
        .min(1)
        .refine(
            (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
            "MONGODB_URI must be a valid MongoDB connection string",
        ),
    PORT_PROJECTS_SERVICE: z.coerce.number().default(3007),
    PROJECTS_SERVICE_MONGODB_DB_NAME: z.string().min(1).default("glybette_projects"),
    UPLOAD_PROVIDER: z.enum(["disk", "s3"]).default("disk"),
    PROJECTS_UPLOAD_DISK_DIR: z.string().min(1).default("./uploads/projects"),
    PROJECTS_UPLOAD_PUBLIC_BASE_URL: z.string().min(1).default("/api/projects/media"),
    PROJECTS_UPLOAD_MAX_MB: z.coerce.number().min(1).max(25).default(5),
    PROJECTS_UPLOAD_S3_BUCKET: z.string().optional(),
    PROJECTS_UPLOAD_S3_REGION: z.string().optional(),
    PROJECTS_UPLOAD_S3_PREFIX: z.string().default("projects/covers"),
    PROJECTS_UPLOAD_S3_ENDPOINT: z.string().url().optional(),
    PROJECTS_UPLOAD_S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false),
    PROJECTS_UPLOAD_S3_ACCESS_KEY_ID: z.string().optional(),
    PROJECTS_UPLOAD_S3_SECRET_ACCESS_KEY: z.string().optional(),
    PROJECTS_UPLOAD_S3_PUBLIC_BASE_URL: z.string().url().optional(),
    RABBITMQ_URL: z.string().optional(),
});

export type ProjectsServiceEnv = z.infer<typeof projectsServiceEnvSchema>;

export function loadProjectsServiceEnv(env: Record<string, string | undefined> = process.env): ProjectsServiceEnv {
    return projectsServiceEnvSchema.parse(env);
}

export function resolveUploadProviderConfig(env: ProjectsServiceEnv): UploadProviderConfig {
    if (env.UPLOAD_PROVIDER === "disk") {
        return {
            provider: "disk",
            disk: {
                rootDir: env.PROJECTS_UPLOAD_DISK_DIR,
                publicBaseUrl: env.PROJECTS_UPLOAD_PUBLIC_BASE_URL,
            },
        };
    }

    if (!env.PROJECTS_UPLOAD_S3_BUCKET || !env.PROJECTS_UPLOAD_S3_REGION) {
        throw new Error("S3 upload provider selected but PROJECTS_UPLOAD_S3_BUCKET or PROJECTS_UPLOAD_S3_REGION is missing.");
    }

    return {
        provider: "s3",
        s3: {
            bucket: env.PROJECTS_UPLOAD_S3_BUCKET,
            region: env.PROJECTS_UPLOAD_S3_REGION,
            prefix: env.PROJECTS_UPLOAD_S3_PREFIX,
            endpoint: env.PROJECTS_UPLOAD_S3_ENDPOINT,
            forcePathStyle: env.PROJECTS_UPLOAD_S3_FORCE_PATH_STYLE,
            accessKeyId: env.PROJECTS_UPLOAD_S3_ACCESS_KEY_ID,
            secretAccessKey: env.PROJECTS_UPLOAD_S3_SECRET_ACCESS_KEY,
            publicBaseUrl: env.PROJECTS_UPLOAD_S3_PUBLIC_BASE_URL,
        },
    };
}
