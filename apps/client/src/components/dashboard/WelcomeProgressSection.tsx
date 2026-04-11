import { CircleCheckBig, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { profileCompletion } from "@/components/dashboard/data";
import { useAuth } from "@/hooks/useAuth";

export default function WelcomeProgressSection() {
  const auth = useAuth();
  const displayName =
    auth.user?.name?.trim() ||
    auth.user?.email?.split("@")[0] ||
    "there";

  return (
    <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
      <CardHeader className="px-5 pt-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--gb-muted)]">
              Profile Completion
            </p>
            <CardTitle className="mt-1 text-2xl font-bold text-[var(--gb-text)]">
              Good morning, {displayName}!
            </CardTitle>
            <p className="mt-1 text-sm text-[var(--gb-muted)]">
              Your profile is {profileCompletion.score}% ready for top recruiters.
            </p>
          </div>
          <Button type="button" className="gb-btn-primary h-10 px-4 py-0 text-sm">
            <Plus className="h-4 w-4" />
            Complete profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 md:px-6 md:pb-6">
        <Progress value={profileCompletion.score} className="h-2 bg-[var(--gb-app-hover)]" />

        <div className="flex flex-wrap gap-2">
          {profileCompletion.highlights.map((item) => (
            <Badge
              key={item.label}
              variant="outline"
              className="h-7 rounded-full border-[var(--gb-border)] bg-[var(--gb-bg)] px-3 text-xs text-[var(--gb-text-off)]"
            >
              {item.state === "done" ? (
                <CircleCheckBig className="h-3.5 w-3.5 text-[#16A34A]" />
              ) : (
                <Plus className="h-3.5 w-3.5 text-[#0284C7]" />
              )}
              {item.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
