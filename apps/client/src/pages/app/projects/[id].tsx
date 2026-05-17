import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { PROJECT_DOMAINS, type ProjectMilestoneInput, type ProjectRoleRequirementInput } from "@glybette/contracts";
import { Clock3, MessageSquare, Pencil, Send, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useProjectComments, useProjectDetail, useProjectJoinRequests, useProjectsMutations } from "@/features/projects";
import { ApiError } from "@/lib/api";

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id ?? "";
    const auth = useAuth();
    const detailQuery = useProjectDetail(projectId);
    const commentsQuery = useProjectComments(projectId);
    const mutations = useProjectsMutations(projectId);

    const project = detailQuery.data?.project;
    const isOwner = project?.ownerId === auth.user?.id;
    const joinRequestsQuery = useProjectJoinRequests(projectId, Boolean(isOwner));

    const [joinMessage, setJoinMessage] = useState("");
    const [commentContent, setCommentContent] = useState("");
    const [replyParentId, setReplyParentId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editShortDescription, setEditShortDescription] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDomain, setEditDomain] = useState<(typeof PROJECT_DOMAINS)[number]>("Software / IT");
    const [editDifficulty, setEditDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
    const [editTechnologyInput, setEditTechnologyInput] = useState("");
    const [editTechnologies, setEditTechnologies] = useState<string[]>([]);
    const [editTeamSizeTarget, setEditTeamSizeTarget] = useState(1);
    const [editHoursPerWeek, setEditHoursPerWeek] = useState(1);
    const [editWorkMode, setEditWorkMode] = useState<"async" | "hybrid" | "live">("async");
    const [editRoles, setEditRoles] = useState<ProjectRoleRequirementInput[]>([]);
    const [editMilestones, setEditMilestones] = useState<ProjectMilestoneInput[]>([]);

    const requestState = useMemo(
        () => ({
            pending: project?.viewerJoinRequestStatus === "pending",
            approved: project?.viewerJoinRequestStatus === "approved",
            rejected: project?.viewerJoinRequestStatus === "rejected",
        }),
        [project?.viewerJoinRequestStatus],
    );

    useEffect(() => {
        if (!project) return;
        if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
        setCoverPreviewUrl(null);
        setCoverFile(null);
        setEditTitle(project.title);
        setEditShortDescription(project.shortDescription);
        setEditDescription(project.description);
        setEditDomain(project.domain);
        setEditDifficulty(project.difficulty);
        setEditTechnologies([...project.technologies]);
        setEditTeamSizeTarget(project.teamSizeTarget);
        setEditHoursPerWeek(project.engagement.hoursPerWeek);
        setEditWorkMode(project.engagement.workMode);
        setEditRoles(project.openRoles.map((role) => ({ ...role })));
        setEditMilestones(project.milestones.map((milestone) => ({ ...milestone })));
    }, [project]);

    if (!projectId) {
        return (
            <Card className="border border-red-500/30 bg-red-500/5">
                <CardContent className="px-5 py-5 text-sm text-red-200">Missing project id.</CardContent>
            </Card>
        );
    }

    if (detailQuery.isLoading) {
        return <div className="h-[420px] animate-pulse rounded-3xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]" />;
    }

    if (detailQuery.isError || !project) {
        return (
            <Card className="border border-red-500/30 bg-red-500/5">
                <CardContent className="space-y-3 px-5 py-5 text-sm text-red-200">
                    <p>Project not found or unavailable.</p>
                    <Button asChild size="sm" variant="outline">
                        <Link to="/app/projects">Back to listing</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const submitJoin = async () => {
        await mutations.createJoinRequest.mutateAsync({ id: projectId, message: joinMessage.trim() || undefined });
        setJoinMessage("");
    };

    const submitComment = async () => {
        if (!commentContent.trim()) return;
        await mutations.createComment.mutateAsync({ id: projectId, content: commentContent.trim() });
        setCommentContent("");
    };

    const submitReply = async () => {
        if (!replyParentId || !replyContent.trim()) return;
        await mutations.createComment.mutateAsync({ id: projectId, content: replyContent.trim(), parentId: replyParentId });
        setReplyContent("");
        setReplyParentId(null);
    };

    const addEditTechnology = () => {
        const candidate = editTechnologyInput.trim();
        if (!candidate) return;
        setEditTechnologies((current) =>
            current.some((item) => item.toLowerCase() === candidate.toLowerCase()) ? current : [...current, candidate],
        );
        setEditTechnologyInput("");
    };

    const saveEdit = async () => {
        const validation = validateProjectForm({
            title: editTitle,
            shortDescription: editShortDescription,
            description: editDescription,
            technologies: editTechnologies,
            roles: editRoles,
            milestones: editMilestones,
        });
        setEditFieldErrors(validation);
        setEditError(null);
        if (Object.keys(validation).length > 0) {
            setEditError("Please fix the highlighted fields.");
            return;
        }

        try {
            await mutations.updateProject.mutateAsync({
                id: projectId,
                payload: {
                    title: editTitle.trim(),
                    shortDescription: editShortDescription.trim(),
                    description: editDescription.trim(),
                    domain: editDomain,
                    difficulty: editDifficulty,
                    technologies: editTechnologies,
                    teamSizeTarget: editTeamSizeTarget,
                    engagement: {
                        hoursPerWeek: editHoursPerWeek,
                        workMode: editWorkMode,
                    },
                    openRoles: editRoles.filter((role) => role.title.trim()),
                    milestones: editMilestones.filter((milestone) => milestone.title.trim() && milestone.description.trim()),
                },
            });
            if (coverFile) {
                await mutations.uploadCover.mutateAsync({ id: projectId, file: coverFile });
            }
            setIsEditOpen(false);
        } catch (error) {
            if (error instanceof ApiError) {
                setEditError(error.message);
                return;
            }
            setEditError("Failed to update project.");
        }
    };

    return (
        <div className="space-y-5">
            <Card className="overflow-hidden border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <div className="relative h-52 border-b border-[var(--gb-border)] bg-[linear-gradient(145deg,#17384f,#10293d)]">
                    {project.coverAsset?.publicUrl ? (
                        <img src={project.coverAsset.publicUrl} alt={project.title} className="h-full w-full object-cover" />
                    ) : null}
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <Badge
                            className={
                                project.status === "published"
                                    ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                                    : "bg-amber-500/20 text-amber-200 ring-1 ring-amber-300/40"
                            }>
                            {project.status}
                        </Badge>
                        <Badge variant="secondary" className="bg-black/45 text-white">
                            {project.domain}
                        </Badge>
                    </div>
                </div>

                <CardContent className="grid gap-5 p-5 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-4">
                        <div>
                            <h1 className="font-['Bricolage_Grotesque'] text-4xl font-extrabold text-[var(--gb-text)]">{project.title}</h1>
                            <p className="mt-2 text-sm text-[var(--gb-text-off)]">{project.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {project.technologies.map((tech) => (
                                <Badge
                                    key={tech}
                                    variant="outline"
                                    className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] text-[var(--gb-text)]">
                                    {tech}
                                </Badge>
                            ))}
                        </div>

                        {project.milestones.length > 0 ? (
                            <section className="space-y-2">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--gb-muted)]">Objectives & milestones</h2>
                                <div className="space-y-2">
                                    {project.milestones.map((milestone) => (
                                        <div
                                            key={milestone.id}
                                            className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-3">
                                            <p className="text-sm font-semibold text-[var(--gb-text)]">{milestone.title}</p>
                                            <p className="mt-1 text-xs text-[var(--gb-muted)]">{milestone.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        <section className="space-y-2">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--gb-muted)]">Current team</h2>
                            <div className="flex flex-wrap gap-2">
                                {project.members.map((member) => (
                                    <div
                                        key={`${member.userId}-${member.role}`}
                                        className="inline-flex items-center gap-2 rounded-full border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 py-1.5">
                                        <Avatar size="sm">
                                            <AvatarFallback>
                                                {(member.user?.displayName ?? member.userId).slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-[var(--gb-text)]">
                                            {member.user?.displayName ?? member.userId} - {member.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-3">
                        <Card className="border border-emerald-400/30 bg-[var(--gb-surface)]">
                            <CardContent className="space-y-3 px-4 py-4">
                                <h3 className="text-sm font-semibold text-emerald-300">Take action</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--gb-muted)]">
                                    <p className="inline-flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" /> {project.memberCount}/{project.teamSizeTarget} members
                                    </p>
                                    <p className="inline-flex items-center gap-1.5">
                                        <Clock3 className="h-3.5 w-3.5" /> {project.engagement.hoursPerWeek}h/week
                                    </p>
                                    <p className="inline-flex items-center gap-1.5">
                                        <MessageSquare className="h-3.5 w-3.5" /> {project.commentCount} comments
                                    </p>
                                </div>

                                {!isOwner ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={joinMessage}
                                            onChange={(event) => setJoinMessage(event.target.value)}
                                            rows={3}
                                            placeholder="Optional message for project owner"
                                            className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]"
                                        />
                                        <Button
                                            className="w-full"
                                            disabled={requestState.pending || requestState.approved || mutations.createJoinRequest.isPending}
                                            onClick={() => void submitJoin()}>
                                            <UserPlus className="h-4 w-4" />
                                            {requestState.pending
                                                ? "Request pending"
                                                : requestState.approved
                                                  ? "Already accepted"
                                                  : "Request to join"}
                                        </Button>
                                        {requestState.rejected ? (
                                            <p className="text-[11px] text-amber-300">
                                                Previous request was rejected. You can submit a new one.
                                            </p>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => void mutations.archiveProject.mutateAsync(projectId)}
                                            disabled={mutations.archiveProject.isPending}>
                                            Archive project
                                        </Button>
                                        <Button
                                            className="w-full"
                                            variant="secondary"
                                            onClick={() =>
                                                void (project.status === "published"
                                                    ? mutations.unpublishProject.mutateAsync(projectId)
                                                    : mutations.publishProject.mutateAsync(projectId))
                                            }
                                            disabled={mutations.publishProject.isPending || mutations.unpublishProject.isPending}>
                                            {project.status === "published" ? "Unpublish" : "Publish"}
                                        </Button>
                                        <Button
                                            className="w-full bg-[var(--gb-app-active-bg)] text-[var(--gb-text)] hover:bg-[var(--gb-app-hover)]"
                                            onClick={() => setIsEditOpen(true)}>
                                            <Pencil className="h-4 w-4" />
                                            Edit project
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-[var(--gb-border)] bg-[var(--gb-surface)]">
                            <CardContent className="space-y-2 px-4 py-4">
                                <h3 className="text-sm font-semibold text-[var(--gb-text)]">Profiles needed</h3>
                                {project.openRoles.map((role) => (
                                    <div key={role.id} className="rounded-lg border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-2">
                                        <p className="text-xs font-semibold text-[var(--gb-text)]">
                                            {role.quantity}x {role.title}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {role.skills.map((skill) => (
                                                <Badge
                                                    key={skill}
                                                    variant="outline"
                                                    className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] text-[10px] text-[var(--gb-text)]">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {isOwner ? (
                            <Card className="border border-[var(--gb-border)] bg-[var(--gb-surface)]">
                                <CardContent className="space-y-2 px-4 py-4">
                                    <h3 className="text-sm font-semibold text-[var(--gb-text)]">Pending requests</h3>
                                    {joinRequestsQuery.data?.requests.filter((request) => request.status === "pending").slice(0, 5).map((request) => (
                                        <div key={request.id} className="rounded-lg border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-2">
                                            <p className="text-xs text-[var(--gb-text)]">
                                                {request.user?.displayName ?? request.userId}
                                            </p>
                                            <p className="mt-1 text-[11px] text-[var(--gb-muted)]">{request.message ?? "No message provided."}</p>
                                            <div className="mt-2 flex gap-2">
                                                <Button
                                                    size="xs"
                                                    onClick={() => void mutations.approveJoinRequest.mutateAsync({ id: projectId, requestId: request.id })}>
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    onClick={() => void mutations.rejectJoinRequest.mutateAsync({ id: projectId, requestId: request.id })}>
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ) : null}
                    </aside>
                </CardContent>
            </Card>

            <Card className="border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardContent className="space-y-4 px-5 py-5">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--gb-muted)]">
                        Community thread
                    </h2>

                    <div className="flex items-center gap-2">
                        <Textarea
                            value={commentContent}
                            onChange={(event) => setCommentContent(event.target.value)}
                            placeholder="Share constructive feedback..."
                            rows={2}
                            className="min-h-[44px] border-[var(--gb-border)] bg-[var(--gb-surface)]"
                        />
                        <Button
                            className="h-10 self-center"
                            disabled={!commentContent.trim() || mutations.createComment.isPending}
                            onClick={() => void submitComment()}>
                            <Send className="h-4 w-4" />
                            Post
                        </Button>
                    </div>

                    {commentsQuery.data?.threads.map((thread) => (
                        <div key={thread.comment.id} className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2">
                                    <Avatar size="sm">
                                        <AvatarFallback>
                                            {(thread.comment.author?.displayName ?? thread.comment.authorId).slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-semibold text-[var(--gb-text)]">
                                            {thread.comment.author?.displayName ?? thread.comment.authorId}
                                        </p>
                                        <p className="text-sm text-[var(--gb-text-off)]">{thread.comment.content}</p>
                                    </div>
                                </div>
                            </div>

                            {thread.replies.length > 0 ? (
                                <div className="mt-3 ml-6 space-y-2 border-l border-[var(--gb-border)] pl-4">
                                    {thread.replies.map((reply) => (
                                        <div key={reply.id} className="flex items-start gap-2 rounded-lg bg-[var(--gb-app-panel-bg)]/70 p-2">
                                            <Avatar size="sm">
                                                <AvatarFallback>
                                                    {(reply.author?.displayName ?? reply.authorId).slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-xs font-semibold text-[var(--gb-text)]">
                                                    {reply.author?.displayName ?? reply.authorId}
                                                </p>
                                                <p className="text-sm text-[var(--gb-text-off)]">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {replyParentId === thread.comment.id ? (
                                <div className="mt-3 flex items-stretch gap-2">
                                    <Textarea
                                        value={replyContent}
                                        onChange={(event) => setReplyContent(event.target.value)}
                                        placeholder="Reply..."
                                        rows={2}
                                        className="min-h-[38px] border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]"
                                    />
                                    <Button size="sm" onClick={() => void submitReply()} disabled={!replyContent.trim()}>
                                        Reply
                                    </Button>
                                </div>
                            ) : null}
                            {thread.comment.status === "active" ? (
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    className="mt-2 justify-start px-0 text-[var(--gb-muted)] hover:text-[var(--gb-text)]"
                                    onClick={() => setReplyParentId((current) => (current === thread.comment.id ? null : thread.comment.id))}>
                                    Reply
                                </Button>
                            ) : null}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit project</DialogTitle>
                        <DialogDescription>Update all project details in one place.</DialogDescription>
                    </DialogHeader>

                    {editError ? <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">{editError}</p> : null}

                    <div className="space-y-5">
                        <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--gb-border)] bg-[var(--gb-surface)] px-4 py-8 text-center">
                            {coverPreviewUrl || project.coverAsset?.publicUrl ? (
                                <img
                                    src={coverPreviewUrl ?? project.coverAsset?.publicUrl}
                                    alt="Project cover preview"
                                    className="h-full w-full rounded-lg object-cover"
                                />
                            ) : (
                                <span className="text-sm text-[var(--gb-text-off)]">Upload a new cover image</span>
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

                        <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Project title" error={editFieldErrors.title}>
                                <Input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                            </Field>
                            <Field label="Short description" error={editFieldErrors.shortDescription}>
                                <Input value={editShortDescription} onChange={(event) => setEditShortDescription(event.target.value)} />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Detailed description" error={editFieldErrors.description}>
                                    <Textarea
                                        rows={4}
                                        value={editDescription}
                                        onChange={(event) => setEditDescription(event.target.value)}
                                    />
                                </Field>
                            </div>
                            <Field label="Domain">
                                <select
                                    value={editDomain}
                                    onChange={(event) => setEditDomain(event.target.value as (typeof PROJECT_DOMAINS)[number])}
                                    className="h-10 w-full rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 text-sm text-[var(--gb-text)] outline-none focus:border-[var(--gb-app-ring)]">
                                    {PROJECT_DOMAINS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Difficulty">
                                <select
                                    value={editDifficulty}
                                    onChange={(event) => setEditDifficulty(event.target.value as typeof editDifficulty)}
                                    className="h-10 w-full rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 text-sm text-[var(--gb-text)] outline-none focus:border-[var(--gb-app-ring)]">
                                    <option value="beginner">Beginner-friendly</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </Field>
                            <Field label="Technologies" error={editFieldErrors.technologies}>
                                <Input
                                    value={editTechnologyInput}
                                    onChange={(event) => setEditTechnologyInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            addEditTechnology();
                                        }
                                    }}
                                    onBlur={addEditTechnology}
                                    placeholder="Type and press Enter"
                                />
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {editTechnologies.map((tech) => (
                                        <Badge
                                            key={tech}
                                            variant="outline"
                                            className="h-6 border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] text-[var(--gb-text)]">
                                            {tech}
                                            <button
                                                type="button"
                                                className="ml-1 rounded-full px-1 text-[var(--gb-muted)] hover:text-[var(--gb-text)]"
                                                onClick={() =>
                                                    setEditTechnologies((current) => current.filter((item) => item !== tech))
                                                }>
                                                x
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Team size target">
                                <Input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={editTeamSizeTarget}
                                    onChange={(event) => setEditTeamSizeTarget(Number(event.target.value) || 1)}
                                />
                            </Field>
                            <Field label="Hours per week">
                                <Input
                                    type="number"
                                    min={1}
                                    max={80}
                                    value={editHoursPerWeek}
                                    onChange={(event) => setEditHoursPerWeek(Number(event.target.value) || 1)}
                                />
                            </Field>
                            <Field label="Work mode">
                                <select
                                    value={editWorkMode}
                                    onChange={(event) => setEditWorkMode(event.target.value as typeof editWorkMode)}
                                    className="h-10 w-full rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 text-sm text-[var(--gb-text)] outline-none focus:border-[var(--gb-app-ring)]">
                                    <option value="async">Async-first</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="live">Live weekly sessions</option>
                                </select>
                            </Field>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-[var(--gb-text)]">Open roles</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditRoles((current) => [...current, { title: "", quantity: 1, skills: [] }])}>
                                    Add role
                                </Button>
                            </div>
                            {editRoles.map((role, index) => (
                                <div
                                    key={role.id ?? index}
                                    className="grid gap-2 rounded-xl border border-[var(--gb-border)] p-3 md:grid-cols-[2fr_100px_2fr_auto]">
                                    <Input
                                        value={role.title}
                                        onChange={(event) =>
                                            setEditRoles((current) =>
                                                current.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)),
                                            )
                                        }
                                        placeholder="Role title"
                                    />
                                    <Input
                                        type="number"
                                        min={1}
                                        value={role.quantity}
                                        onChange={(event) =>
                                            setEditRoles((current) =>
                                                current.map((item, i) =>
                                                    i === index ? { ...item, quantity: Number(event.target.value) || 1 } : item,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        value={role.skills.join(", ")}
                                        onChange={(event) =>
                                            setEditRoles((current) =>
                                                current.map((item, i) =>
                                                    i === index ? { ...item, skills: splitComma(event.target.value) } : item,
                                                ),
                                            )
                                        }
                                        placeholder="Skills (comma-separated)"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setEditRoles((current) => current.filter((_, roleIndex) => roleIndex !== index))}>
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            {editFieldErrors.openRoles ? <p className="text-xs text-red-300">{editFieldErrors.openRoles}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-[var(--gb-text)]">Milestones</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setEditMilestones((current) => [...current, { title: "", description: "", status: "todo" }])
                                    }>
                                    Add milestone
                                </Button>
                            </div>
                            {editMilestones.map((milestone, index) => (
                                <div
                                    key={milestone.id ?? index}
                                    className="grid gap-2 rounded-xl border border-[var(--gb-border)] p-3 md:grid-cols-[2fr_3fr_130px_auto]">
                                    <Input
                                        value={milestone.title}
                                        onChange={(event) =>
                                            setEditMilestones((current) =>
                                                current.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)),
                                            )
                                        }
                                    />
                                    <Input
                                        value={milestone.description}
                                        onChange={(event) =>
                                            setEditMilestones((current) =>
                                                current.map((item, i) =>
                                                    i === index ? { ...item, description: event.target.value } : item,
                                                ),
                                            )
                                        }
                                    />
                                    <select
                                        value={milestone.status}
                                        onChange={(event) =>
                                            setEditMilestones((current) =>
                                                current.map((item, i) =>
                                                    i === index
                                                        ? { ...item, status: event.target.value as ProjectMilestoneInput["status"] }
                                                        : item,
                                                ),
                                            )
                                        }
                                        className="h-8 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] px-2 text-xs">
                                        <option value="todo">Todo</option>
                                        <option value="in_progress">In progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                            setEditMilestones((current) =>
                                                current.filter((_, milestoneIndex) => milestoneIndex !== index),
                                            )
                                        }>
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            {editFieldErrors.milestones ? <p className="text-xs text-red-300">{editFieldErrors.milestones}</p> : null}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => void saveEdit()} disabled={mutations.updateProject.isPending || mutations.uploadCover.isPending}>
                                Save changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function splitComma(value: string): string[] {
    return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function validateProjectForm(input: {
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

function Field({ label, error, children }: { label: string; children: ReactNode; error?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--gb-text)]">{label}</label>
            {children}
            {error ? <p className="text-xs text-red-300">{error}</p> : null}
        </div>
    );
}
