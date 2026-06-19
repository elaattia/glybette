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
        </div>
    );
}
