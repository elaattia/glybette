import { memo } from "react";
import type { PortfolioBlock } from "@glybette/contracts";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSocialIcon } from "@/components/portfolio/social-icons";
import type { ProjectItem } from "@/components/portfolio/renderer-types";
import { useLocale } from "@/hooks/useLocale";
import { getObjectList, getSkillGroups, getText } from "@/lib/portfolio-block-data";

function renderMarkdownText(markdown: string) {
    return markdown.split("\n").map((line, index) => (
        <p key={`${line}-${index}`} className="mb-3 last:mb-0">
            {line || "\u00A0"}
        </p>
    ));
}

type PortfolioBlockContentProps = {
    block: PortfolioBlock;
    onProjectClick: (project: ProjectItem) => void;
};

export const PortfolioBlockContent = memo(function PortfolioBlockContent({
    block,
    onProjectClick,
}: PortfolioBlockContentProps) {
    const { t } = useLocale("portfolio");

    switch (block.type) {
        case "markdown":
            return (
                <div>
                    <h2 className="mb-4 text-3xl font-semibold tracking-[-0.04em]">{block.title}</h2>
                    <div className="text-sm leading-7 opacity-80">
                        {renderMarkdownText(getText(block.data, "markdown"))}
                    </div>
                </div>
            );
        case "socialLinks": {
            const links = getObjectList<{ label?: string; url?: string; icon?: string }>(block.data, "links");
            return (
                <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] opacity-60">{block.title}</p>
                    <div className="flex flex-wrap gap-2">
                        {links.map((link) => {
                            const Icon = getSocialIcon(link.icon);

                            return (
                                <a
                                    key={`${link.label}-${link.url}`}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-[var(--portfolio-radius)] border border-[color:color-mix(in_srgb,var(--portfolio-accent)_35%,transparent)] px-3 py-1 text-xs transition hover:border-[var(--portfolio-accent)] hover:text-[var(--portfolio-accent)]">
                                    <Icon className="size-3.5" />
                                    {link.label}
                                </a>
                            );
                        })}
                    </div>
                </div>
            );
        }
        case "projectList": {
            const projects = getObjectList<ProjectItem>(block.data, "projects");
            return (
                <div>
                    <h2 className="mb-5 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {projects.map((project) => (
                            <button
                                key={`${project.title}-${project.summary}`}
                                type="button"
                                onClick={() => onProjectClick(project)}
                                className="rounded-[var(--portfolio-radius)] border border-[color:color-mix(in_srgb,var(--portfolio-accent)_26%,transparent)] bg-[color-mix(in_srgb,var(--portfolio-accent)_8%,transparent)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--portfolio-accent)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_16%,transparent)]">
                                <span className="block text-base font-semibold">{project.title}</span>
                                <span className="mt-2 block text-sm leading-6 opacity-70">{project.summary}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        case "experienceTimeline": {
            const items = getObjectList<{
                role?: string;
                company?: string;
                period?: string;
                description?: string;
            }>(block.data, "items");
            return (
                <div>
                    <h2 className="mb-5 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h2>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={`${item.role}-${item.company}`}
                                className="border-l border-[var(--portfolio-accent)] pl-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-[var(--portfolio-accent)] opacity-80">
                                    {item.period}
                                </p>
                                <p className="mt-1 font-semibold">
                                    {item.role} <span className="opacity-50">@</span> {item.company}
                                </p>
                                <p className="mt-2 text-sm leading-6 opacity-70">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        case "skills": {
            const skillGroups = getSkillGroups(block.data);
            return (
                <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] opacity-60">{block.title}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                        {skillGroups.map((group) => (
                            <section
                                key={group.label}
                                className="rounded-[var(--portfolio-radius)] border border-[color:color-mix(in_srgb,var(--portfolio-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--portfolio-accent)_7%,transparent)] p-3">
                                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--portfolio-accent)]">
                                    {group.label}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {group.skills.map((skill) => (
                                        <span
                                            key={`${group.label}-${skill}`}
                                            className="rounded-[var(--portfolio-radius)] bg-[color-mix(in_srgb,var(--portfolio-accent)_18%,transparent)] px-3 py-1 text-xs text-[var(--portfolio-accent)]">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            );
        }
        case "contactCta":
            return (
                <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.035em]">{getText(block.data, "heading")}</h2>
                    <p className="mt-3 text-sm leading-6 opacity-70">{getText(block.data, "body")}</p>
                    <Button
                        className="mt-5 rounded-[var(--portfolio-radius)] bg-[var(--portfolio-accent)] text-[var(--portfolio-accent-contrast)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_84%,black)]"
                        asChild>
                        <a href={getText(block.data, "url")}>{getText(block.data, "label", t("renderer.contactFallback"))}</a>
                    </Button>
                </div>
            );
        case "media":
            return (
                <figure>
                    <img
                        src={getText(block.data, "imageUrl")}
                        alt={getText(block.data, "caption", block.title ?? t("renderer.mediaAltFallback"))}
                        className="aspect-[4/3] w-full rounded-[inherit] object-cover"
                    />
                    <figcaption className="mt-3 text-xs opacity-60">{getText(block.data, "caption")}</figcaption>
                </figure>
            );
        case "customLink":
            return (
                <a
                    href={getText(block.data, "url")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 text-lg font-semibold text-[var(--portfolio-accent)]">
                    {getText(block.data, "label", block.title ?? t("renderer.openLinkFallback"))}
                    <ExternalLink className="size-4" />
                </a>
            );
    }
});
