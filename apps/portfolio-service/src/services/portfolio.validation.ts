import {
    PORTFOLIO_BLOCK_TYPES,
    PORTFOLIO_TEMPLATE_IDS,
    type PortfolioBlock,
    type PortfolioBlockGrid,
    type PortfolioIdentity,
    type PortfolioStyle,
    type PortfolioTab,
    type SavePortfolioRequest,
} from "@glybette/contracts";
import { BadRequestError } from "@glybette/utils";

const RESERVED_SLUGS = new Set([
    "admin",
    "api",
    "app",
    "assets",
    "auth",
    "blog",
    "cv-builder",
    "dashboard",
    "docs",
    "glybette",
    "help",
    "login",
    "onboarding",
    "opportunities",
    "portfolio",
    "projects",
    "settings",
    "static",
    "support",
    "user",
    "users",
    "verify-email",
    "www",
]);

export function normalizePortfolioSlug(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function validatePortfolioSlug(value: string): string {
    const slug = normalizePortfolioSlug(value);
    if (slug.length < 3 || slug.length > 40) {
        throw new BadRequestError("Portfolio URL name must be between 3 and 40 characters.");
    }
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
        throw new BadRequestError("Portfolio URL name can only use letters, numbers, and hyphens.");
    }
    if (RESERVED_SLUGS.has(slug)) {
        throw new BadRequestError("This portfolio URL name is reserved.");
    }
    return slug;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function assertString(value: unknown, message: string): asserts value is string {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new BadRequestError(message);
    }
}

function validateGrid(value: unknown): PortfolioBlockGrid {
    if (!isRecord(value)) {
        throw new BadRequestError("Block grid must be an object.");
    }

    const grid = {
        column: Number(value.column),
        row: Number(value.row),
        columnSpan: Number(value.columnSpan),
        rowSpan: Number(value.rowSpan),
    };

    if (
        !Number.isInteger(grid.column) ||
        !Number.isInteger(grid.row) ||
        !Number.isInteger(grid.columnSpan) ||
        !Number.isInteger(grid.rowSpan) ||
        grid.column < 1 ||
        grid.column > 2 ||
        grid.row < 1 ||
        grid.columnSpan < 1 ||
        grid.columnSpan > 2 ||
        grid.rowSpan < 1 ||
        grid.rowSpan > 12
    ) {
        throw new BadRequestError("Block grid values are invalid.");
    }

    return grid;
}

function validateStyle(value: unknown): PortfolioStyle {
    if (!isRecord(value)) {
        throw new BadRequestError("Portfolio style must be an object.");
    }

    const theme = value.theme;
    const radius = value.radius;
    assertString(value.accentColor, "Accent color is required.");
    assertString(value.fontFamily, "Font family is required.");

    if (theme !== "light" && theme !== "dark") {
        throw new BadRequestError("Portfolio theme must be light or dark.");
    }
    if (radius !== "sharp" && radius !== "soft" && radius !== "round") {
        throw new BadRequestError("Portfolio radius is invalid.");
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(value.accentColor)) {
        throw new BadRequestError("Accent color must be a hex color.");
    }

    return {
        theme,
        accentColor: value.accentColor,
        fontFamily: value.fontFamily,
        radius,
    };
}

function createIdentityFromSlug(slug: string): PortfolioIdentity {
    return {
        displayName:
            slug
                .split("-")
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") || "Your Name",
        eyebrowText: "Independent portfolio",
        eyebrowPlacement: "above",
    };
}

function validateIdentity(value: unknown, slug: string): PortfolioIdentity {
    if (!isRecord(value)) {
        return createIdentityFromSlug(slug);
    }

    const fallback = createIdentityFromSlug(slug);
    const displayName =
        typeof value.displayName === "string" && value.displayName.trim()
            ? value.displayName.trim()
            : fallback.displayName;
    const eyebrowText =
        typeof value.eyebrowText === "string" && value.eyebrowText.trim()
            ? value.eyebrowText.trim()
            : fallback.eyebrowText;
    const eyebrowPlacement = value.eyebrowPlacement === "below" ? "below" : "above";

    if (displayName.length > 80 || eyebrowText.length > 80) {
        throw new BadRequestError("Portfolio identity text must be 80 characters or fewer.");
    }

    return {
        displayName,
        eyebrowText,
        eyebrowPlacement,
    };
}

function validateBlock(value: unknown): PortfolioBlock {
    if (!isRecord(value)) {
        throw new BadRequestError("Portfolio block must be an object.");
    }

    assertString(value.id, "Block id is required.");
    assertString(value.type, "Block type is required.");
    if (!PORTFOLIO_BLOCK_TYPES.includes(value.type as PortfolioBlock["type"])) {
        throw new BadRequestError("Block type is not supported.");
    }
    if (!isRecord(value.data)) {
        throw new BadRequestError("Block data must be an object.");
    }

    return {
        id: value.id,
        type: value.type as PortfolioBlock["type"],
        title: typeof value.title === "string" ? value.title : undefined,
        grid: validateGrid(value.grid),
        data: value.data,
        source: isRecord(value.source)
            ? {
                  kind: value.source.kind === "project" || value.source.kind === "cv" ? value.source.kind : "manual",
                  refId: typeof value.source.refId === "string" ? value.source.refId : undefined,
              }
            : { kind: "manual" },
    };
}

function validateTab(value: unknown): PortfolioTab {
    if (!isRecord(value)) {
        throw new BadRequestError("Portfolio tab must be an object.");
    }

    assertString(value.id, "Tab id is required.");
    assertString(value.label, "Tab label is required.");
    assertString(value.slug, "Tab slug is required.");
    if (!Array.isArray(value.blocks)) {
        throw new BadRequestError("Tab blocks must be an array.");
    }

    return {
        id: value.id,
        label: value.label,
        slug: normalizePortfolioSlug(value.slug),
        blocks: value.blocks.map(validateBlock),
    };
}

export function validateSavePortfolioRequest(value: unknown): SavePortfolioRequest {
    if (!isRecord(value)) {
        throw new BadRequestError("Portfolio payload must be an object.");
    }

    assertString(value.templateId, "Template is required.");
    if (!PORTFOLIO_TEMPLATE_IDS.includes(value.templateId as SavePortfolioRequest["templateId"])) {
        throw new BadRequestError("Template is not supported.");
    }
    if (!Array.isArray(value.tabs) || value.tabs.length === 0) {
        throw new BadRequestError("At least one portfolio tab is required.");
    }

    const slug = validatePortfolioSlug(String(value.slug ?? ""));

    return {
        slug,
        identity: validateIdentity(value.identity, slug),
        templateId: value.templateId as SavePortfolioRequest["templateId"],
        style: validateStyle(value.style),
        tabs: value.tabs.map(validateTab),
    };
}

export function extractSlugFromHost(host: string | undefined, rootDomain: string): string | null {
    if (!host) {
        return null;
    }

    const hostname = host.split(":")[0]?.toLowerCase();
    const normalizedRoot = rootDomain.toLowerCase().replace(/^\*\./, "");
    if (!hostname || hostname === normalizedRoot || hostname === `www.${normalizedRoot}`) {
        return null;
    }
    if (!hostname.endsWith(`.${normalizedRoot}`)) {
        return null;
    }

    const candidate = hostname.slice(0, -normalizedRoot.length - 1);
    return candidate.includes(".") ? null : normalizePortfolioSlug(candidate);
}
