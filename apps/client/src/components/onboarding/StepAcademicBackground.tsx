import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AcademicBackgroundPayload } from "@glybette/types";
import { StepFooter } from "./StepFooter";

const DEGREE_KEYS = ["licence", "master", "ingenieur", "doctorat", "bts", "other"] as const;
const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

interface Props {
    onNext: (data: AcademicBackgroundPayload) => void;
    onSkip: () => void;
}

export function StepAcademicBackground({ onNext, onSkip }: Props) {
    const { t } = useTranslation("onboarding");
    const [form, setForm] = useState<AcademicBackgroundPayload>({
        university: "",
        degree: "",
        specialization: "",
        graduationYear: "",
    });

    function set(field: keyof AcademicBackgroundPayload, value: string) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    const isValid = form.university && form.degree && form.specialization;

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="gb-sec-label justify-center w-full">{t("academicBackground.label")}</div>
                <h1 className="text-4xl font-bold ob-page-title">{t("academicBackground.title")}</h1>
                <p className="text-sm ob-page-sub">{t("academicBackground.subtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                <div className="col-span-2 space-y-1.5">
                    <label htmlFor="university" className="ob-label">
                        {t("academicBackground.fields.university.label")}
                    </label>
                    <input
                        id="university"
                        className="ob-input"
                        placeholder={t("academicBackground.fields.university.placeholder")}
                        value={form.university}
                        onChange={(e) => set("university", e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="degree" className="ob-label">
                        {t("academicBackground.fields.degree.label")}
                    </label>
                    <select
                        id="degree"
                        className="ob-select"
                        value={form.degree}
                        onChange={(e) => set("degree", e.target.value)}>
                        <option value="" disabled>
                            {t("academicBackground.fields.degree.placeholder")}
                        </option>
                        {DEGREE_KEYS.map((key) => (
                            <option key={key} value={t(`academicBackground.degrees.${key}`)}>
                                {t(`academicBackground.degrees.${key}`)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="graduationYear" className="ob-label">
                        {t("academicBackground.fields.graduationYear.label")}
                    </label>
                    <select
                        id="graduationYear"
                        className="ob-select"
                        value={form.graduationYear}
                        onChange={(e) => set("graduationYear", e.target.value)}>
                        <option value="" disabled>
                            {t("academicBackground.fields.graduationYear.placeholder")}
                        </option>
                        {YEARS.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2 space-y-1.5">
                    <label htmlFor="specialization" className="ob-label">
                        {t("academicBackground.fields.specialization.label")}
                    </label>
                    <input
                        id="specialization"
                        className="ob-input"
                        placeholder={t("academicBackground.fields.specialization.placeholder")}
                        value={form.specialization}
                        onChange={(e) => set("specialization", e.target.value)}
                    />
                </div>
            </div>

            <StepFooter onSkip={onSkip} onContinue={() => onNext(form)} canContinue={!!isValid} />
        </div>
    );
}
