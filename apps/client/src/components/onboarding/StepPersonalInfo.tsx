import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PersonalInfoPayload } from "@glybette/types";
import { StepFooter } from "./StepFooter";

interface Props {
    onNext: (data: PersonalInfoPayload) => void;
    onSkip: () => void;
}

const FIELD_CONFIG: {
    key: keyof PersonalInfoPayload;
    type?: string;
    colSpan?: boolean;
}[] = [
    { key: "firstName" },
    { key: "lastName" },
    { key: "email", type: "email" },
    { key: "phone" },
    { key: "country", colSpan: true },
];

export function StepPersonalInfo({ onNext, onSkip }: Props) {
    const { t } = useTranslation("onboarding");
    const [form, setForm] = useState<PersonalInfoPayload>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "",
    });

    function set(field: keyof PersonalInfoPayload, value: string) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    const isValid = form.firstName && form.lastName && form.email;

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="gb-sec-label justify-center w-full">{t("personalInfo.label")}</div>
                <h1 className="text-4xl font-bold ob-page-title">{t("personalInfo.title")}</h1>
                <p className="text-sm ob-page-sub">{t("personalInfo.subtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                {FIELD_CONFIG.map(({ key, type, colSpan }) => (
                    <div key={key} className={`space-y-1.5 ${colSpan ? "col-span-2" : ""}`}>
                        <label htmlFor={key} className="ob-label">
                            {t(`personalInfo.fields.${key}.label`)}
                        </label>
                        <input
                            id={key}
                            className="ob-input"
                            type={type ?? "text"}
                            placeholder={t(`personalInfo.fields.${key}.placeholder`)}
                            value={form[key]}
                            onChange={(e) => set(key, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            <StepFooter onSkip={onSkip} onContinue={() => onNext(form)} canContinue={!!isValid} />
        </div>
    );
}
