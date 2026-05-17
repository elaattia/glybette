import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
    PROJECT_DOMAINS,
    type CreateProjectRequest,
    type ProjectMilestoneInput,
    type ProjectRoleRequirementInput,
} from "@glybette/contracts";
import { ArrowLeft, ArrowRight, CheckCircle2, ImageUp, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProjectsMutations } from "@/features/projects";
import { ApiError } from "@/lib/api";

type Step = 1 | 2;

function parseCommaSeparated(value: string): string[] {
    return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

const difficultyOptions: Array<{ value: "beginner" | "intermediate" | "advanced"; label: string }> = [
    { value: "beginner", label: "Beginner-friendly" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
];

const workModeOptions: Array<{ value: "async" | "hybrid" | "live"; label: string }> = [
    { value: "async", label: "Async-first" },
    { value: "hybrid", label: "Hybrid" },
    { value: "live", label: "Live weekly sessions" },
];

export default function ProjectCreatePage() {
    const navigate = useNavigate();
    const mutations = useProjectsMutations();
    const [step, setStep] = useState<Step>(1);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [description, setDescription] = useState("");
    const [domain, setDomain] = useState<(typeof PROJECT_DOMAINS)[number]>("Software / IT");
    const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
    const [technologyInput, setTechnologyInput] = useState("");
    const [technologies, setTechnologies] = useState<string[]>(["React", "Tailwind CSS"]);

    const [teamSizeTarget, setTeamSizeTarget] = useState(3);
    const [hoursPerWeek, setHoursPerWeek] = useState(10);
    const [workMode, setWorkMode] = useState<"async" | "hybrid" | "live">("async");
    const [roles, setRoles] = useState<ProjectRoleRequirementInput[]>([
        { title: "Frontend Developer", quantity: 1, skills: ["React", "Tailwind CSS"] },
        { title: "UI/UX Designer", quantity: 1, skills: ["Figma", "Prototyping"] },
    ]);
    const [milestones, setMilestones] = useState<ProjectMilestoneInput[]>([
        { title: "MVP layout", description: "Build first clickable flow for profile optimization.", status: "todo" },
    ]);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const canContinue = useMemo(
        () => title.trim().length >= 3 && shortDescription.trim().length >= 10 && description.trim().length >= 20,
        [title, shortDescription, description],
    );

    const isSubmitting =
        mutations.createProject.isPending || mutations.uploadCover.isPending || mutations.updateProject.isPending;

    const addRole = () => {
        setRoles((current) => [...current, { title: "", quantity: 1, skills: [] }]);
    };

    const addMilestone = () => {
        setMilestones((current) => [...current, { title: "", description: "", status: "todo" }]);
    };

    const buildPayload = (publish: boolean): CreateProjectRequest => ({
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        domain,
        difficulty,
        technologies,
        teamSizeTarget,
        engagement: {
            hoursPerWeek,
            workMode,
        },
        openRoles: roles
            .filter((role) => role.title.trim())
            .map((role) => ({
                id: role.id,
                title: role.title.trim(),
                quantity: role.quantity,
                skills: role.skills,
            })),
        milestones: milestones
            .filter((milestone) => milestone.title.trim() && milestone.description.trim())
            .map((milestone) => ({
                id: milestone.id,
                title: milestone.title.trim(),
                description: milestone.description.trim(),
                status: milestone.status,
            })),
        publish,
    });

    const submit = async (publish: boolean) => {
        const validationErrors = validateForm({
            title,
            shortDescription,
            description,
            technologies,
            roles,
            milestones,
        });
        setFieldErrors(validationErrors);
        setFormError(null);

        if (Object.keys(validationErrors).length > 0) {
            setFormError("Please correct the highlighted fields before submitting.");
            return;
        }

        try {
            const payload = buildPayload(publish);
            const response = await mutations.createProject.mutateAsync(payload);
            const projectId = response.project.id;
            if (coverFile) {
                await mutations.uploadCover.mutateAsync({ id: projectId, file: coverFile });
            }
            navigate(`/app/projects/${projectId}`);
        } catch (error) {
            if (error instanceof ApiError) {
                setFormError(error.message);
                return;
            }
            setFormError("Failed to save project. Please try again.");
        }
    };

    const addTechnology = () => {
        const candidate = technologyInput.trim();
        if (!candidate) return;
        setTechnologies((current) =>
            current.some((item) => item.toLowerCase() === candidate.toLowerCase()) ? current : [...current, candidate],
        );
        setTechnologyInput("");
    };

    return (
        <div className="mx-auto max-w-5xl space-y-5">
            <Card className="border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardContent className="space-y-4 px-5 py-5">
                    <h1 className="font-['Bricolage_Grotesque'] text-4xl font-extrabold text-[var(--gb-text)]">
                        Propose a new project idea
                    </h1>
                    <p className="text-sm text-[var(--gb-text-off)]">
                        Step through concept and team composition, then save a draft or publish instantly.
                    </p>
                    <div className="flex items-center gap-3">
                        <StepChip label="Concept" active={step === 1} completed={step > 1} />
                        <div className="h-px flex-1 bg-[var(--gb-border)]" />
                        <StepChip label="Team" active={step === 2} completed={false} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardContent className="space-y-6 px-5 py-5">
                    {step === 1 ? (
                        <>
                            <section className="space-y-3">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--gb-muted)]">
                                    Visual identity
                                </h2>
                                <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--gb-border)] bg-[var(--gb-surface)] px-4 py-8 text-center">
                                    {coverPreviewUrl ? (
                                        <img src={coverPreviewUrl} alt="Project cover preview" className="h-full w-full rounded-lg object-cover" />
                                    ) : (
                                        <>
                                            <ImageUp className="h-5 w-5 text-[var(--gb-muted)]" />
                                            <span className="text-sm text-[var(--gb-text)]">
                                                {coverFile ? coverFile.name : "Upload project cover (PNG/JPG/WEBP, max 5MB)"}
                                            </span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0] ?? null;
                                            setCoverFile(file);
                                            setCoverPreviewUrl((current) => {
                                                if (current) URL.revokeObjectURL(current);
                                                return file ? URL.createObjectURL(file) : null;
                                            });
                                        }}
                                    />
                                </label>
                            </section>

                            {formError ? <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">{formError}</p> : null}

                            <section className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-[var(--gb-text)]">Project title</label>
                                    <Input
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        placeholder="AI Portfolio Optimizer"
                                        className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                                    />
                                    {fieldErrors.title ? <p className="text-xs text-red-300">{fieldErrors.title}</p> : null}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-[var(--gb-text)]">Short description</label>
                                    <Input
                                        value={shortDescription}
                                        onChange={(event) => setShortDescription(event.target.value)}
                                        placeholder="One-line pitch for project card preview."
                                        className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                                    />
                                    {fieldErrors.shortDescription ? (
                                        <p className="text-xs text-red-300">{fieldErrors.shortDescription}</p>
                                    ) : null}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-[var(--gb-text)]">Detailed description</label>
                                    <Textarea
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        rows={5}
                                        placeholder="Describe vision, constraints, and expected impact."
                                        className="border-[var(--gb-border)] bg-[var(--gb-surface)]"
                                    />
                                    {fieldErrors.description ? <p className="text-xs text-red-300">{fieldErrors.description}</p> : null}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--gb-text)]">Domain</label>
                                    <select
                                        value={domain}
                                        onChange={(event) => setDomain(event.target.value as (typeof PROJECT_DOMAINS)[number])}
                                        className="h-10 w-full rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 text-sm text-[var(--gb-text)] outline-none focus:border-[var(--gb-app-ring)]">
                                        {PROJECT_DOMAINS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--gb-text)]">Difficulty</label>
                                    <select
                                        value={difficulty}
                                        onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}
                                        className="h-10 w-full rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 text-sm text-[var(--gb-text)] outline-none focus:border-[var(--gb-app-ring)]">
                                        {difficultyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-[var(--gb-text)]">Technologies</label>
                                    <Input
                                        value={technologyInput}
                                        onChange={(event) => setTechnologyInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                addTechnology();
                                            }
                                        }}
                                        onBlur={addTechnology}
                                        placeholder="Type a technology and press Enter"
                                        className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                                    />
                                    <div className="flex flex-wrap gap-1.5">
                                        {technologies.map((tech) => (
                                            <Badge
                                                key={tech}
                                                variant="outline"
                                                className="h-6 border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] text-[var(--gb-text)]">
                                                {tech}
                                                <button
                                                    type="button"
                                                    className="ml-1 rounded-full px-1 text-[var(--gb-muted)] hover:text-[var(--gb-text)]"
                                                    onClick={() =>
                                                        setTechnologies((current) => current.filter((item) => item !== tech))
                                                    }>
                                                    x
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    {fieldErrors.technologies ? <p className="text-xs text-red-300">{fieldErrors.technologies}</p> : null}
                                </div>
                            </section>
                        </>
                    ) : (
                        <>
                            <section className="grid gap-3 md:grid-cols-3">
                                <Field label="Target team size">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={teamSizeTarget}
                                        onChange={(event) => setTeamSizeTarget(Number(event.target.value) || 1)}
                                        className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                                    />
                                </Field>
                                <Field label="Hours per week">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={80}
                                        value={hoursPerWeek}
                                        onChange={(event) => setHoursPerWeek(Number(event.target.value) || 1)}
                                        className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                                    />
                                </Field>
                                <Field label="Work mode">
                                    <select
                                        value={workMode}
                                        onChange={(event) => setWorkMode(event.target.value as typeof workMode)}
                                        className="h-10 w-full rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 text-sm text-[var(--gb-text)] outline-none focus:border-[var(--gb-app-ring)]">
                                        {workModeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </section>

                            {fieldErrors.openRoles ? <p className="text-xs text-red-300">{fieldErrors.openRoles}</p> : null}

                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--gb-muted)]">
                                        Open roles
                                    </h2>
                                    <Button type="button" variant="outline" size="sm" onClick={addRole}>
                                        Add role
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {roles.map((role, index) => (
                                        <div
                                            key={role.id ?? index}
                                            className="grid gap-2 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-3 md:grid-cols-[2fr_100px_2fr_auto]">
                                            <Input
                                                value={role.title}
                                                onChange={(event) =>
                                                    setRoles((current) =>
                                                        current.map((item, i) =>
                                                            i === index ? { ...item, title: event.target.value } : item,
                                                        ),
                                                    )
                                                }
                                                placeholder="Role title"
                                            />
                                            <Input
                                                type="number"
                                                min={1}
                                                value={role.quantity}
                                                onChange={(event) =>
                                                    setRoles((current) =>
                                                        current.map((item, i) =>
                                                            i === index
                                                                ? { ...item, quantity: Number(event.target.value) || 1 }
                                                                : item,
                                                        ),
                                                    )
                                                }
                                                placeholder="Qty"
                                            />
                                            <Input
                                                value={role.skills.join(", ")}
                                                onChange={(event) =>
                                                    setRoles((current) =>
                                                        current.map((item, i) =>
                                                            i === index
                                                                ? { ...item, skills: parseCommaSeparated(event.target.value) }
                                                                : item,
                                                        ),
                                                    )
                                                }
                                                placeholder="Skills tags"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() =>
                                                    setRoles((current) => current.filter((_, roleIndex) => roleIndex !== index))
                                                }>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--gb-muted)]">
                                        Milestones
                                    </h2>
                                    <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                                        Add milestone
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {milestones.map((milestone, index) => (
                                        <div
                                            key={milestone.id ?? index}
                                            className="grid gap-2 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-3 md:grid-cols-[2fr_3fr_130px]">
                                            <Input
                                                value={milestone.title}
                                                onChange={(event) =>
                                                    setMilestones((current) =>
                                                        current.map((item, i) =>
                                                            i === index ? { ...item, title: event.target.value } : item,
                                                        ),
                                                    )
                                                }
                                                placeholder="Milestone title"
                                            />
                                            <Input
                                                value={milestone.description}
                                                onChange={(event) =>
                                                    setMilestones((current) =>
                                                        current.map((item, i) =>
                                                            i === index ? { ...item, description: event.target.value } : item,
                                                        ),
                                                    )
                                                }
                                                placeholder="Description"
                                            />
                                            <select
                                                value={milestone.status}
                                                onChange={(event) =>
                                                    setMilestones((current) =>
                                                        current.map((item, i) =>
                                                            i === index
                                                                ? {
                                                                      ...item,
                                                                      status: event.target.value as ProjectMilestoneInput["status"],
                                                                  }
                                                                : item,
                                                        ),
                                                    )
                                                }
                                                className="h-8 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] px-2 text-xs">
                                                <option value="todo">Todo</option>
                                                <option value="in_progress">In progress</option>
                                                <option value="done">Done</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            {fieldErrors.milestones ? <p className="text-xs text-red-300">{fieldErrors.milestones}</p> : null}
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => (step === 1 ? navigate("/app/projects") : setStep(1))}>
                    <ArrowLeft className="h-4 w-4" /> {step === 1 ? "Back to projects" : "Previous step"}
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    {step === 1 ? (
                        <>
                            <Button
                                variant="outline"
                                disabled={!canContinue || isSubmitting}
                                onClick={() => void submit(false)}
                                className="border-[var(--gb-border)]">
                                <Save className="h-4 w-4" />
                                Save draft
                            </Button>
                            <Button disabled={!canContinue} onClick={() => setStep(2)}>
                                Continue <ArrowRight className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                disabled={isSubmitting}
                                onClick={() => void submit(false)}
                                className="border-[var(--gb-border)]">
                                <Save className="h-4 w-4" />
                                Save draft
                            </Button>
                            <Button disabled={isSubmitting} onClick={() => void submit(true)}>
                                <CheckCircle2 className="h-4 w-4" />
                                Launch project
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function validateForm(input: {
    title: string;
    shortDescription: string;
    description: string;
    technologies: string[];
    roles: ProjectRoleRequirementInput[];
    milestones: ProjectMilestoneInput[];
}): Record<string, string> {
    const errors: Record<string, string> = {};
    if (input.title.trim().length < 3) errors.title = "Title must be at least 3 characters.";
    if (input.shortDescription.trim().length < 10) errors.shortDescription = "Short description must be at least 10 characters.";
    if (input.description.trim().length < 20) errors.description = "Detailed description must be at least 20 characters.";
    if (input.technologies.length === 0) errors.technologies = "Add at least one technology.";
    if (!input.roles.some((role) => role.title.trim())) errors.openRoles = "Add at least one role with a title.";
    if (!input.milestones.some((milestone) => milestone.title.trim() && milestone.description.trim())) {
        errors.milestones = "Add at least one milestone with title and description.";
    }
    return errors;
}

function StepChip({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
    return (
        <div
            className={[
                "inline-flex min-w-[130px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.08em] uppercase",
                completed
                    ? "bg-[rgba(22,163,74,0.2)] text-[#22c55e]"
                    : active
                      ? "bg-[var(--gb-app-active-bg)] text-[var(--gb-text)]"
                      : "bg-[var(--gb-app-hover)] text-[var(--gb-muted)]",
            ].join(" ")}>
            {label}
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--gb-text)]">{label}</label>
            {children}
        </div>
    );
}
