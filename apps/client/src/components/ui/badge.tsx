import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
                secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
                destructive:
                    "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
                outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
                ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
                link: "text-primary underline-offset-4 hover:underline",
            },
            appearance: {
                default: "",
                metadata:
                    "border-[var(--gb-border)] font-mono text-[10px] text-[var(--gb-muted)]",
            },
        },
        defaultVariants: {
            variant: "default",
            appearance: "default",
        },
    },
);

const LOW_CONTRAST_SHADE_RE = /^text-([a-z]+)-(50|100|200|300|400)$/;
const ACCENT_TOKEN_RE = /^(?:bg|border|ring)-([a-z]+)-\d{2,3}(?:\/\d+)?$/;
const CHROMATIC_TEXT_RE = /^(?:dark:)?text-[a-z]+-\d{2,3}$/;
const ARBITRARY_TEXT_RE = /^(?:dark:)?text-\[[^\]]+\]$/;
const DYNAMIC_BADGE_TEXT_CLASS = "text-[var(--gb-badge-light-fg)] dark:text-[var(--gb-badge-dark-fg)]";
const EXTRA_DARK_ON_LIGHT = new Set(["amber", "yellow", "lime"]);

type BadgeTone = "neutral" | "info" | "success" | "warning" | "error";

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
    neutral:
        "!border-[var(--gb-badge-neutral-border)] !bg-[var(--gb-badge-neutral-bg)] !text-[var(--gb-badge-neutral-fg)]",
    info: "!border-[var(--gb-badge-info-border)] !bg-[var(--gb-badge-info-bg)] !text-[var(--gb-badge-info-fg)]",
    success:
        "!border-[var(--gb-badge-success-border)] !bg-[var(--gb-badge-success-bg)] !text-[var(--gb-badge-success-fg)]",
    warning:
        "!border-[var(--gb-badge-warning-border)] !bg-[var(--gb-badge-warning-bg)] !text-[var(--gb-badge-warning-fg)]",
    error: "!border-[var(--gb-badge-error-border)] !bg-[var(--gb-badge-error-bg)] !text-[var(--gb-badge-error-fg)]",
};

function getReadableLightShade(color: string): number {
    return EXTRA_DARK_ON_LIGHT.has(color) ? 900 : 800;
}

type BadgeNormalizationResult = {
    className: string;
    style?: React.CSSProperties;
};

function normalizeBadgeClassName(className?: string): BadgeNormalizationResult {
    if (!className) return { className: "" };

    const tokens = className.split(/\s+/).filter(Boolean);
    let lightTextVar: string | undefined;
    let darkTextVar: string | undefined;

    const accentColor = tokens
        .map((token) => {
            const match = ACCENT_TOKEN_RE.exec(token);
            return match ? match[1] : null;
        })
        .find((color): color is string => Boolean(color));

    const normalizedTokens = tokens.map((token) => {
        const match = LOW_CONTRAST_SHADE_RE.exec(token);
        if (!match) return token;

        const color = match[1];
        const originalShade = match[2];
        lightTextVar = `var(--color-${color}-${getReadableLightShade(color)})`;
        darkTextVar = `var(--color-${color}-${originalShade})`;
        return DYNAMIC_BADGE_TEXT_CLASS;
    });

    const hasChromaticTextClass = normalizedTokens.some(
        (token) => CHROMATIC_TEXT_RE.test(token) || ARBITRARY_TEXT_RE.test(token),
    );
    if (!lightTextVar && !darkTextVar && !hasChromaticTextClass && accentColor) {
        lightTextVar = `var(--color-${accentColor}-${getReadableLightShade(accentColor)})`;
        darkTextVar = `var(--color-${accentColor}-200)`;
        normalizedTokens.push(DYNAMIC_BADGE_TEXT_CLASS);
    }

    const dedupedTokens = Array.from(new Set(normalizedTokens));
    const style =
        lightTextVar && darkTextVar
            ? ({
                  "--gb-badge-light-fg": lightTextVar,
                  "--gb-badge-dark-fg": darkTextVar,
              } as React.CSSProperties)
            : undefined;

    return {
        className: dedupedTokens.join(" "),
        style,
    };
}

function Badge({
    className,
    style,
    variant = "default",
    appearance = "default",
    tone,
    asChild = false,
    ...props
}: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & {
        asChild?: boolean;
        tone?: BadgeTone;
    }) {
    const Comp = asChild ? Slot.Root : "span";
    const normalized = normalizeBadgeClassName(className);
    const mergedStyle = {
        ...(normalized.style ?? {}),
        ...(style ?? {}),
    } as React.CSSProperties;

    return (
        <Comp
            data-slot="badge"
            data-variant={variant}
            className={cn(
                badgeVariants({ variant, appearance }),
                normalized.className,
                tone ? BADGE_TONE_CLASS[tone] : undefined,
            )}
            style={mergedStyle}
            {...props}
        />
    );
}

// CVA variants are consumed by other modules; not a second component.
// eslint-disable-next-line react-refresh/only-export-components -- variant helper export
export { Badge, badgeVariants, type BadgeTone };
