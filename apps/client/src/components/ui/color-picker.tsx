"use client";

import { Pipette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
    value: string;
    onChange: (value: string) => void;
    swatches?: string[];
    className?: string;
};

const defaultSwatches = ["#16A34A", "#0284C7", "#38BDF8", "#D97706", "#EF4444", "#A855F7", "#111827", "#F4F0E8"];

function normalizeHex(value: string) {
    const trimmed = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
        return trimmed.toUpperCase();
    }
    return value;
}

export function ColorPicker({ value, onChange, swatches = defaultSwatches, className }: ColorPickerProps) {
    const handleEyeDropper = async () => {
        if (!("EyeDropper" in window)) {
            return;
        }

        try {
            const eyeDropper = new (
                window as typeof window & {
                    EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> };
                }
            ).EyeDropper();
            const result = await eyeDropper.open();
            onChange(result.sRGBHex.toUpperCase());
        } catch {
            // The browser throws when the user cancels the picker; no UI state needs changing.
        }
    };

    return (
        <div
            className={cn(
                "rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-bg)] p-3 shadow-inner",
                className,
            )}>
            <div className="flex items-center gap-3">
                <label
                    className="relative grid size-12 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-[var(--gb-border)] shadow-lg"
                    style={{ background: value }}>
                    <Input
                        aria-label="Accent color"
                        type="color"
                        value={value}
                        onChange={(event) => onChange(event.target.value.toUpperCase())}
                        className="absolute inset-0 size-full cursor-pointer opacity-0"
                    />
                </label>
                <div className="min-w-0 flex-1">
                    <Input
                        value={value}
                        onChange={(event) => onChange(normalizeHex(event.target.value))}
                        className="h-9 font-mono text-xs uppercase"
                        placeholder="#16A34A"
                    />
                    <div className="mt-2 flex gap-1.5">
                        {swatches.map((swatch) => (
                            <button
                                key={swatch}
                                type="button"
                                aria-label={`Use ${swatch}`}
                                onClick={() => onChange(swatch)}
                                className={cn(
                                    "size-5 rounded-full border border-white/20 ring-offset-2 transition hover:scale-110",
                                    value.toUpperCase() === swatch.toUpperCase() && "ring-2 ring-[var(--gb-app-ring)]",
                                )}
                                style={{ background: swatch }}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={handleEyeDropper}
                        disabled={!("EyeDropper" in window)}
                        aria-label="Pick color from screen">
                        <Pipette className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onChange("#16A34A")}
                        aria-label="Reset color">
                        <RotateCcw className="size-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
