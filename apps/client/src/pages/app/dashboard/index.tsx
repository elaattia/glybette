import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WelcomeProgressSection from "@/components/dashboard/WelcomeProgressSection";
import RecommendedJobsSection from "@/components/dashboard/RecommendedJobsSection";
import ResumeHealthCard from "@/components/dashboard/ResumeHealthCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";

export default function DashboardPage() {
  return (
    <div className="space-y-4 md:space-y-5">
      <WelcomeProgressSection />
      <RecommendedJobsSection />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <ResumeHealthCard />
        <RecentActivityCard />
      </section>

      <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
        <CardHeader className="px-5 pt-5 md:px-6">
          <CardTitle className="text-base text-[var(--gb-text)]">Coming next in Phase 2</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 text-sm text-[var(--gb-muted)] md:px-6 md:pb-6">
          Skills market trend, pipeline analytics, and personalized application strategy widgets.
        </CardContent>
      </Card>
    </div>
  );
}
