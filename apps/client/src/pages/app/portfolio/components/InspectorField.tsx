import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type InspectorFieldProps = {
    label: string;
    children: ReactNode;
};

export function InspectorField({ label, children }: InspectorFieldProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}
