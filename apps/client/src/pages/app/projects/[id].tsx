import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Clock3, MessageSquare, Send, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useProjectComments, useProjectDetail, useProjectJoinRequests, useProjectsMutations } from "@/features/projects";

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id ?? "";
    const navigate = useNavigate();
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

    const requestState = useMemo(
        () => ({
            pending: project?.viewerJoinRequestStatus === "pending",
            approved: project?.viewerJoinRequestStatus === "approved",
            rejected: project?.viewerJoinRequestStatus === "rejected",
        }),
        [project?.viewerJoinRequestStatus],
    );

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

    return (
        <div className="space-y-5">
            <Card className="overflow-hidden border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <div className="relative h-52 border-b border-[var(--gb-border)] bg-[linear-gradient(145deg,#17384f,#10293d)]">
                    {project.coverAsset?.publicUrl ? (
                        <img src={project.coverAsset.publicUrl} alt={project.title} className="h-full w-full object-cover" />
                    ) : null}
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <Badge className="bg-[var(--gb-app-active-bg)] text-[#16a34a]">{project.status}</Badge>
                        <Badge variant="secondary" className="bg-black/35 text-white">
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
                                <Badge key={tech} variant="outline" className="border-[var(--gb-border)] bg-[var(--gb-surface)]">
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
                                            <AvatarFallback>{member.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-[var(--gb-text)]">{member.role}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-3">
                        <Card className="border border-[var(--gb-border)] bg-[var(--gb-surface)]">
                            <CardContent className="space-y-3 px-4 py-4">
                                <h3 className="text-sm font-semibold text-[var(--gb-text)]">Take action</h3>
                                <div className="space-y-2 text-xs text-[var(--gb-muted)]">
                                    <p className="inline-flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" /> {project.memberCount}/{project.teamSizeTarget} members
                                    </p>
                                    <p className="inline-flex items-center gap-1">
                                        <Clock3 className="h-3.5 w-3.5" /> {project.engagement.hoursPerWeek}h/week
                                    </p>
                                    <p className="inline-flex items-center gap-1">
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
                                        <Button className="w-full" variant="ghost" onClick={() => navigate(`/app/projects/create?edit=${projectId}`)}>
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
                                                <Badge key={skill} variant="outline" className="text-[10px]">
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
                                            <p className="text-xs text-[var(--gb-text)]">{request.userId}</p>
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

                    <div className="flex gap-2">
                        <Input
                            value={commentContent}
                            onChange={(event) => setCommentContent(event.target.value)}
                            placeholder="Share constructive feedback..."
                            className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                        />
                        <Button disabled={!commentContent.trim() || mutations.createComment.isPending} onClick={() => void submitComment()}>
                            <Send className="h-4 w-4" />
                            Post
                        </Button>
                    </div>

                    {commentsQuery.data?.threads.map((thread) => (
                        <div key={thread.comment.id} className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2">
                                    <Avatar size="sm">
                                        <AvatarFallback>{thread.comment.authorId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-semibold text-[var(--gb-text)]">{thread.comment.authorId}</p>
                                        <p className="text-sm text-[var(--gb-text-off)]">{thread.comment.content}</p>
                                    </div>
                                </div>
                                {thread.comment.status === "active" ? (
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => setReplyParentId((current) => (current === thread.comment.id ? null : thread.comment.id))}>
                                        Reply
                                    </Button>
                                ) : null}
                            </div>

                            {thread.replies.length > 0 ? (
                                <div className="mt-3 space-y-2 border-l border-[var(--gb-border)] pl-4">
                                    {thread.replies.map((reply) => (
                                        <div key={reply.id} className="rounded-lg border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-2">
                                            <p className="text-xs font-semibold text-[var(--gb-text)]">{reply.authorId}</p>
                                            <p className="text-sm text-[var(--gb-text-off)]">{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {replyParentId === thread.comment.id ? (
                                <div className="mt-3 flex gap-2">
                                    <Input
                                        value={replyContent}
                                        onChange={(event) => setReplyContent(event.target.value)}
                                        placeholder="Reply..."
                                        className="h-9 border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]"
                                    />
                                    <Button size="sm" onClick={() => void submitReply()} disabled={!replyContent.trim()}>
                                        Reply
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
