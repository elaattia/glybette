import { AlertTriangle, Check, CircleDashed, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resumeHealth } from "@/components/dashboard/data";

export default function ResumeHealthCard() {
  return (
    <Card className="h-full border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
      <CardHeader className="px-5 pt-5 md:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base text-[var(--gb-text)]">ATS Resume Health</CardTitle>
          <Info className="h-4 w-4 text-[var(--gb-muted)]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5 md:px-6 md:pb-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-[#16A34A] text-3xl font-bold text-[var(--gb-text)]">
            {resumeHealth.grade}
          </div>
          <div>
            <p className="font-semibold text-[var(--gb-text)]">{resumeHealth.summary}</p>
            <p className="text-sm text-[var(--gb-muted)]">{resumeHealth.details}</p>
          </div>
        </div>

        <div className="space-y-2">
          {resumeHealth.checks.map((check) => {
            const needsWork = check.status.toLowerCase().includes("needs");
            return (
              <div key={check.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-[var(--gb-text-off)]">
                  {needsWork ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                  )}
                  {check.label}
                </div>
                <span className="text-[var(--gb-muted)]">{check.status}</span>
              </div>
            );
          })}
        </div>

        <button className="inline-flex items-center gap-2 text-sm font-medium text-[#16A34A]">
          <CircleDashed className="h-4 w-4" />
          View detailed report
        </button>
      </CardContent>
    </Card>
  );
}
