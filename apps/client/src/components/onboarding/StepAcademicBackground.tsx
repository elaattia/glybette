import { useState } from "react";
import type { AcademicBackgroundPayload } from "@glybette/types";
import { StepFooter } from "./StepFooter";

const DEGREES = ["Licence", "Master", "Ingénieur", "Doctorat", "BTS", "Other"];
const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

interface Props {
    onNext: (data: AcademicBackgroundPayload) => void;
    onSkip: () => void;
}

export function StepAcademicBackground({ onNext, onSkip }: Props) {
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
                <div className="gb-sec-label justify-center w-full">Academic</div>
                <h1 className="text-4xl font-bold ob-page-title">Academic background</h1>
                <p className="text-sm ob-page-sub">Tell us about your studies.</p>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                <div className="col-span-2 space-y-1.5">
                    <label htmlFor="university" className="ob-label">
                        University
                    </label>
                    <input
                        id="university"
                        className="ob-input"
                        placeholder="Your university or school"
                        value={form.university}
                        onChange={(e) => set("university", e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="degree" className="ob-label">
                        Degree
                    </label>
                    <select
                        id="degree"
                        className="ob-select"
                        value={form.degree}
                        onChange={(e) => set("degree", e.target.value)}>
                        <option value="" disabled>
                            Select your degree
                        </option>
                        {DEGREES.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="graduationYear" className="ob-label">
                        Graduation Year
                    </label>
                    <select
                        id="graduationYear"
                        className="ob-select"
                        value={form.graduationYear}
                        onChange={(e) => set("graduationYear", e.target.value)}>
                        <option value="" disabled>
                            Select year
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
                        Specialization
                    </label>
                    <input
                        id="specialization"
                        className="ob-input"
                        placeholder="e.g. Computer Science, Marketing..."
                        value={form.specialization}
                        onChange={(e) => set("specialization", e.target.value)}
                    />
                </div>
            </div>

            <StepFooter onSkip={onSkip} onContinue={() => onNext(form)} canContinue={!!isValid} />
        </div>
    );
}
