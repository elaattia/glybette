import { useState } from "react";
import type { PersonalInfoPayload } from "@glybette/types";
import { StepFooter } from "./StepFooter";

interface Props {
  onNext: (data: PersonalInfoPayload) => void;
  onSkip: () => void;
}

export function StepPersonalInfo({ onNext, onSkip }: Props) {
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

  const fields: {
    key: keyof PersonalInfoPayload;
    label: string;
    placeholder: string;
    type?: string;
    colSpan?: boolean;
  }[] = [
    { key: "firstName", label: "First Name", placeholder: "First Name" },
    { key: "lastName", label: "Last Name", placeholder: "Last Name" },
    { key: "email", label: "Email", placeholder: "you@example.com", type: "email" },
    { key: "phone", label: "Phone Number", placeholder: "+216 12 345 678" },
    { key: "country", label: "Country of Residence", placeholder: "e.g. Tunisia, France...", colSpan: true },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="gb-sec-label justify-center w-full">Personal Info</div>
        <h1 className="text-4xl font-bold ob-page-title">Personal information</h1>
        <p className="text-sm ob-page-sub">Tell us who you are</p>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        {fields.map(({ key, label, placeholder, type, colSpan }) => (
          <div key={key} className={`space-y-1.5 ${colSpan ? "col-span-2" : ""}`}>
            <label htmlFor={key} className="ob-label">{label}</label>
            <input
              id={key}
              className="ob-input"
              type={type ?? "text"}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <StepFooter
        onSkip={onSkip}
        onContinue={() => onNext(form)}
        canContinue={!!isValid}
      />
    </div>
  );
}
