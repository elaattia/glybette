import { memo } from "react";
import type { PortfolioBlock } from "@glybette/contracts";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { socialIconOptions } from "@/components/portfolio/social-icons";
import { getObjectList, getSkillGroups, getText, type PortfolioSkillGroup } from "@/lib/portfolio-block-data";
import { InspectorField } from "@/pages/app/portfolio/components/InspectorField";

type BlockDataFieldsProps = {
    block: PortfolioBlock;
    onChange: (data: Record<string, unknown>) => void;
};

type BlockDataFieldProps = BlockDataFieldsProps & {
    updateField: (key: string, value: unknown) => void;
};

function MarkdownFields({ block, updateField }: BlockDataFieldProps) {
    return (
        <InspectorField label="Markdown text">
            <Textarea
                value={getText(block.data, "markdown")}
                onChange={(event) => updateField("markdown", event.target.value)}
                className="min-h-44"
            />
        </InspectorField>
    );
}

function SkillsFields({ block, onChange }: BlockDataFieldProps) {
    const groups = getSkillGroups(block.data);
    const updateGroups = (nextGroups: PortfolioSkillGroup[]) => {
        const skillGroups = nextGroups.map((group) => ({
            label: group.label,
            skills: group.skills.map((skill) => skill.trim()).filter(Boolean),
        }));
        onChange({
            ...block.data,
            skillGroups,
            skills: skillGroups.flatMap((group) => group.skills),
        });
    };
    const updateGroup = (index: number, group: PortfolioSkillGroup) => {
        updateGroups(groups.map((item, groupIndex) => (groupIndex === index ? group : item)));
    };

    return (
        <div className="space-y-3">
            {groups.map((group, index) => (
                <div key={`${group.label}-${index}`} className="space-y-2 rounded-xl border border-[var(--gb-border)] p-3">
                    <div className="flex items-center gap-2">
                        <Input
                            value={group.label}
                            onChange={(event) => updateGroup(index, { ...group, label: event.target.value })}
                            placeholder="Group name"
                            aria-label="Skill group name"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => updateGroups(groups.filter((_, groupIndex) => groupIndex !== index))}
                            aria-label={`Delete ${group.label || "skill"} group`}
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                    <Textarea
                        value={group.skills.join(", ")}
                        onChange={(event) =>
                            updateGroup(index, {
                                ...group,
                                skills: event.target.value
                                    .split(",")
                                    .map((skill) => skill.trim())
                                    .filter(Boolean),
                            })
                        }
                        placeholder="React, TypeScript, APIs"
                    />
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => updateGroups([...groups, { label: "New group", skills: ["New skill"] }])}
            >
                Add skill group
            </Button>
        </div>
    );
}

function ContactCtaFields({ block, updateField }: BlockDataFieldProps) {
    return (
        <>
            <InspectorField label="Heading">
                <Input value={getText(block.data, "heading")} onChange={(event) => updateField("heading", event.target.value)} />
            </InspectorField>
            <InspectorField label="Body">
                <Textarea value={getText(block.data, "body")} onChange={(event) => updateField("body", event.target.value)} />
            </InspectorField>
            <InspectorField label="Button label">
                <Input value={getText(block.data, "label")} onChange={(event) => updateField("label", event.target.value)} />
            </InspectorField>
            <InspectorField label="Button URL">
                <Input value={getText(block.data, "url")} onChange={(event) => updateField("url", event.target.value)} />
            </InspectorField>
        </>
    );
}

function MediaFields({ block, updateField }: BlockDataFieldProps) {
    return (
        <>
            <InspectorField label="Image URL">
                <Input value={getText(block.data, "imageUrl")} onChange={(event) => updateField("imageUrl", event.target.value)} />
            </InspectorField>
            <InspectorField label="Caption">
                <Input value={getText(block.data, "caption")} onChange={(event) => updateField("caption", event.target.value)} />
            </InspectorField>
        </>
    );
}

function CustomLinkFields({ block, updateField }: BlockDataFieldProps) {
    return (
        <>
            <InspectorField label="Link label">
                <Input value={getText(block.data, "label")} onChange={(event) => updateField("label", event.target.value)} />
            </InspectorField>
            <InspectorField label="URL">
                <Input value={getText(block.data, "url")} onChange={(event) => updateField("url", event.target.value)} />
            </InspectorField>
        </>
    );
}

function SocialLinksFields({ block, updateField }: BlockDataFieldProps) {
    const links = getObjectList<{ label?: string; url?: string; icon?: string }>(block.data, "links");
    const updateLink = (index: number, field: "label" | "url" | "icon", value: string) => {
        updateField(
            "links",
            links.map((link, linkIndex) => (linkIndex === index ? { ...link, [field]: value } : link)),
        );
    };

    return (
        <div className="space-y-3">
            {links.map((link, index) => (
                <div key={`${link.label}-${index}`} className="space-y-2 rounded-xl border border-[var(--gb-border)] p-3">
                    <Input
                        value={link.label ?? ""}
                        onChange={(event) => updateLink(index, "label", event.target.value)}
                        placeholder="Label"
                    />
                    <Input
                        value={link.url ?? ""}
                        onChange={(event) => updateLink(index, "url", event.target.value)}
                        placeholder="https://"
                    />
                    <Select value={link.icon ?? "globe"} onValueChange={(value) => updateLink(index, "icon", value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {socialIconOptions.map(({ value, label, Icon }) => (
                                <SelectItem key={value} value={value}>
                                    <span className="flex items-center gap-2">
                                        <Icon className="size-3.5" />
                                        {label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => updateField("links", [...links, { label: "New link", url: "https://", icon: "globe" }])}
            >
                Add link
            </Button>
        </div>
    );
}

function ProjectListFields({ block, updateField }: BlockDataFieldProps) {
    const projects = getObjectList<{
        title?: string;
        summary?: string;
        detail?: string;
        url?: string;
    }>(block.data, "projects");
    const updateProject = (index: number, field: "title" | "summary" | "detail" | "url", value: string) => {
        updateField(
            "projects",
            projects.map((project, projectIndex) => (projectIndex === index ? { ...project, [field]: value } : project)),
        );
    };

    return (
        <div className="space-y-3">
            {projects.map((project, index) => (
                <div key={`${project.title}-${index}`} className="space-y-2 rounded-xl border border-[var(--gb-border)] p-3">
                    <Input value={project.title ?? ""} onChange={(event) => updateProject(index, "title", event.target.value)} placeholder="Project title" />
                    <Input value={project.summary ?? ""} onChange={(event) => updateProject(index, "summary", event.target.value)} placeholder="Short summary" />
                    <Textarea value={project.detail ?? ""} onChange={(event) => updateProject(index, "detail", event.target.value)} placeholder="Modal detail" />
                    <Input value={project.url ?? ""} onChange={(event) => updateProject(index, "url", event.target.value)} placeholder="Project URL" />
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                    updateField("projects", [
                        ...projects,
                        { title: "New project", summary: "Short outcome", detail: "What changed?", url: "" },
                    ])
                }
            >
                Add project
            </Button>
        </div>
    );
}

function ExperienceTimelineFields({ block, updateField }: BlockDataFieldProps) {
    const items = getObjectList<{
        role?: string;
        company?: string;
        period?: string;
        description?: string;
    }>(block.data, "items");
    const updateItem = (index: number, field: "role" | "company" | "period" | "description", value: string) => {
        updateField(
            "items",
            items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
        );
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={`${item.role}-${index}`} className="space-y-2 rounded-xl border border-[var(--gb-border)] p-3">
                    <Input value={item.role ?? ""} onChange={(event) => updateItem(index, "role", event.target.value)} placeholder="Role" />
                    <Input value={item.company ?? ""} onChange={(event) => updateItem(index, "company", event.target.value)} placeholder="Company" />
                    <Input value={item.period ?? ""} onChange={(event) => updateItem(index, "period", event.target.value)} placeholder="2024 - Present" />
                    <Textarea value={item.description ?? ""} onChange={(event) => updateItem(index, "description", event.target.value)} placeholder="What you did" />
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                    updateField("items", [
                        ...items,
                        { role: "New role", company: "Company", period: "Year", description: "Impact" },
                    ])
                }
            >
                Add experience
            </Button>
        </div>
    );
}

export const BlockDataFields = memo(function BlockDataFields({ block, onChange }: BlockDataFieldsProps) {
    const updateField = (key: string, value: unknown) => {
        onChange({ ...block.data, [key]: value });
    };
    const fieldProps = { block, onChange, updateField };

    switch (block.type) {
        case "markdown":
            return <MarkdownFields {...fieldProps} />;
        case "skills":
            return <SkillsFields {...fieldProps} />;
        case "contactCta":
            return <ContactCtaFields {...fieldProps} />;
        case "media":
            return <MediaFields {...fieldProps} />;
        case "customLink":
            return <CustomLinkFields {...fieldProps} />;
        case "socialLinks":
            return <SocialLinksFields {...fieldProps} />;
        case "projectList":
            return <ProjectListFields {...fieldProps} />;
        case "experienceTimeline":
            return <ExperienceTimelineFields {...fieldProps} />;
    }
});
