import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, UserCircle2 } from "lucide-react";
import { StepFooter } from "@/components/onboarding/StepFooter";

interface StepRoleSelectProps {
    onNext: (role: "student" | "enterprise") => void;
}

export function StepRoleSelect({ onNext }: StepRoleSelectProps) {
    const { t } = useTranslation("onboarding");
    const [selectedRole, setSelectedRole] = React.useState<"student" | "enterprise" | null>(null);

    return (
        <div className="flex flex-col h-full animate-slide-up-fade">
            <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[var(--gb-text)]">
                            {t("roleSelect.title")}
                        </h2>
                        <p className="mt-2 text-[var(--gb-muted)]">{t("roleSelect.subtitle")}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mt-8">
                        <div
                            onClick={() => setSelectedRole("student")}
                            className={`relative cursor-pointer rounded-xl border p-6 transition-all duration-200 ${
                                selectedRole === "student"
                                    ? "border-[#16A34A] bg-[#16A34A]/5 shadow-[0_0_15px_rgba(22,163,74,0.1)]"
                                    : "border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] hover:border-[#16A34A]/50"
                            }`}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className={`p-4 rounded-full ${
                                    selectedRole === "student" ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[var(--gb-surface)] text-[var(--gb-muted)]"
                                }`}>
                                    <UserCircle2 size={40} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--gb-text)]">
                                        {t("roleSelect.student.title")}
                                    </h3>
                                    <p className="mt-2 text-sm text-[var(--gb-muted)]">
                                        {t("roleSelect.student.description")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setSelectedRole("enterprise")}
                            className={`relative cursor-pointer rounded-xl border p-6 transition-all duration-200 ${
                                selectedRole === "enterprise"
                                    ? "border-[#3B82F6] bg-[#3B82F6]/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                    : "border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] hover:border-[#3B82F6]/50"
                            }`}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className={`p-4 rounded-full ${
                                    selectedRole === "enterprise" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "bg-[var(--gb-surface)] text-[var(--gb-muted)]"
                                }`}>
                                    <Building2 size={40} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--gb-text)]">
                                        {t("roleSelect.enterprise.title")}
                                    </h3>
                                    <p className="mt-2 text-sm text-[var(--gb-muted)]">
                                        {t("roleSelect.enterprise.description")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StepFooter
                onContinue={() => selectedRole && onNext(selectedRole)}
                canContinue={!!selectedRole}
            />
        </div>
    );
}
