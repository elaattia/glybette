import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recommendedJobs } from "@/components/dashboard/data";

export default function RecommendedJobsSection() {
  return (
    <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
      <CardHeader className="px-5 pt-5 md:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#a78bfa]" />
          <CardTitle className="text-lg text-[var(--gb-text)]">Recommended for You</CardTitle>
        </div>
        <p className="text-sm text-[var(--gb-muted)]">Based on your skills and profile signal.</p>
      </CardHeader>

      <CardContent className="grid gap-3 px-5 pb-5 md:grid-cols-3 md:px-6 md:pb-6">
        {recommendedJobs.map((job) => (
          <article
            key={job.id}
            className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg)] p-4 transition hover:border-[var(--gb-app-ring)]"
          >
            <Badge className="mb-3 rounded-full bg-[#16A34A1A] text-[#22c55e] hover:bg-[#16A34A2A]">
              {job.match}% match
            </Badge>
            <h3 className="text-base font-semibold text-[var(--gb-text)]">{job.role}</h3>
            <p className="mt-1 text-sm text-[var(--gb-muted)]">
              {job.company} • {job.location}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-md border-[var(--gb-border)] bg-transparent text-[11px] text-[var(--gb-muted)]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[var(--gb-muted)]">{job.posted}</span>
              <Button type="button" variant="link" className="h-auto p-0 text-[#16A34A]">
                Apply now
              </Button>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
