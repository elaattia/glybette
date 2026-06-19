import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { formatDate } from "@/lib/locale-format";
import { inputCss } from "../primitives";

type PickerMode = "month" | "year" | "decade";

export interface DatePickerProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    disabled?: boolean;
    showDay?: boolean;
}

export function DatePicker({ value, onChange, placeholder, disabled, showDay = false }: DatePickerProps) {
    const { t, locale } = useLocale("cvBuilder");
    const defaultPlaceholder = t("sections.datePicker.default");
    const resolvedPlaceholder = placeholder ?? defaultPlaceholder;
    const months = useMemo(
        () => Array.from({ length: 12 }, (_, i) => formatDate(new Date(2000, i, 1), locale, { month: "short" })),
        [locale],
    );
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<PickerMode>("month");

    const currentYear = (() => {
        const parts = value?.split(" ") ?? [];
        const y = parseInt(parts[parts.length - 1]);
        return isNaN(y) ? null : y;
    })();

    const [displayYear, setDisplayYear] = useState(() => currentYear ?? new Date().getFullYear());
    const [decadeStart, setDecadeStart] = useState(() => Math.floor((currentYear ?? new Date().getFullYear()) / 10) * 10);

    const [selectedDay, setSelectedDay] = useState<number | null>(() => {
        if (!value || !showDay) return null;
        const d = parseInt(value.split("/")[0]);
        return isNaN(d) ? null : d;
    });

    const ref = useRef<HTMLDivElement>(null);

    const currentMonthIdx = (() => {
        if (!value) return -1;
        for (let i = 0; i < months.length; i++) {
            if (value.toLowerCase().includes(months[i].toLowerCase().slice(0, 3))) return i;
        }
        return -1;
    })();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setMode("month");
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSelectMonth = (monthIdx: number) => {
        if (showDay && selectedDay) {
            onChange(`${String(selectedDay).padStart(2, "0")}/${String(monthIdx + 1).padStart(2, "0")}/${displayYear}`);
        } else {
            onChange(`${months[monthIdx]} ${displayYear}`);
        }
        setOpen(false);
        setMode("month");
    };

    const handleSelectYear = (year: number) => {
        setDisplayYear(year);
        setMode("month");
    };

    const handleSelectDecade = (start: number) => {
        setDecadeStart(start);
        setMode("year");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSelectedDay(null);
    };

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

    const yearCells = Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => { if (!disabled) { setOpen((o) => !o); setMode("month"); } }}
                style={{
                    ...inputCss,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.5 : 1,
                    borderColor: open ? "#16A34A" : "var(--gb-border)",
                    textAlign: "left",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar style={{ width: 13, height: 13, color: "var(--gb-muted)", flexShrink: 0 }} />
                    <span style={{ color: value ? "var(--gb-text)" : "var(--gb-muted)", fontSize: "13px" }}>
                        {value || resolvedPlaceholder}
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {value && (
                        <span onClick={handleClear}
                            style={{ fontSize: "15px", color: "var(--gb-muted)", cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>
                            ×
                        </span>
                    )}
                    <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </div>
            </button>

            {open && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    zIndex: 100,
                    background: "var(--gb-surface)",
                    border: "1px solid var(--gb-border)",
                    borderRadius: "16px",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
                    padding: "14px",
                    minWidth: "260px",
                    userSelect: "none",
                }}>

                    {mode === "month" && (
                        <>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                <NavBtn onClick={() => setDisplayYear((y) => y - 1)}>
                                    <ChevronLeft style={{ width: 13, height: 13 }} />
                                </NavBtn>

                                <button
                                    type="button"
                                    onClick={() => { setDecadeStart(Math.floor(displayYear / 10) * 10); setMode("year"); }}
                                    style={{
                                        background: "var(--gb-app-hover)",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "5px 14px",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontSize: "14px",
                                        color: "var(--gb-text)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}>
                                    {displayYear}
                                    <ChevronDown style={{ width: 11, height: 11, color: "var(--gb-muted)" }} />
                                </button>

                                <NavBtn onClick={() => setDisplayYear((y) => y + 1)}>
                                    <ChevronRight style={{ width: 13, height: 13 }} />
                                </NavBtn>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
                                {months.map((m, idx) => {
                                    const isSelected = idx === currentMonthIdx && displayYear === currentYear;
                                    const isToday = idx === new Date().getMonth() && displayYear === new Date().getFullYear();
                                    return (
                                        <button key={m} type="button" onClick={() => handleSelectMonth(idx)}
                                            style={{
                                                background: isSelected ? "#16A34A" : "transparent",
                                                color: isSelected ? "#fff" : isToday ? "#16A34A" : "var(--gb-text)",
                                                border: isToday && !isSelected ? "1.5px solid #16A34A40" : "1.5px solid transparent",
                                                borderRadius: "8px",
                                                padding: "8px 4px",
                                                fontSize: "11.5px",
                                                fontWeight: isSelected ? 700 : 400,
                                                cursor: "pointer",
                                                transition: "background 0.12s",
                                            }}
                                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(22,163,74,0.1)"; }}
                                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>

                            {showDay && currentMonthIdx >= 0 && (
                                <div style={{ marginTop: "10px", borderTop: "1px solid var(--gb-border)", paddingTop: "10px" }}>
                                    <p style={{ fontSize: "10px", color: "var(--gb-muted)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Jour</p>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                                        {Array.from({ length: daysInMonth(currentMonthIdx, displayYear) }, (_, i) => i + 1).map((day) => (
                                            <button key={day} type="button"
                                                onClick={() => {
                                                    setSelectedDay(day);
                                                    onChange(`${String(day).padStart(2, "0")}/${String(currentMonthIdx + 1).padStart(2, "0")}/${displayYear}`);
                                                    setOpen(false);
                                                }}
                                                style={{
                                                    background: selectedDay === day ? "#16A34A" : "var(--gb-app-hover)",
                                                    color: selectedDay === day ? "#fff" : "var(--gb-text)",
                                                    border: "none", borderRadius: "5px", padding: "4px 2px", fontSize: "10px", cursor: "pointer",
                                                }}>
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {mode === "year" && (
                        <>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                <NavBtn onClick={() => setDecadeStart((d) => d - 10)}>
                                    <ChevronLeft style={{ width: 13, height: 13 }} />
                                </NavBtn>

                                <button type="button" onClick={() => setMode("decade")}
                                    style={{ background: "var(--gb-app-hover)", border: "none", borderRadius: "8px", padding: "5px 14px", cursor: "pointer", fontWeight: 700, fontSize: "13px", color: "var(--gb-text)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    {decadeStart}–{decadeStart + 9}
                                    <ChevronDown style={{ width: 11, height: 11, color: "var(--gb-muted)" }} />
                                </button>

                                <NavBtn onClick={() => setDecadeStart((d) => d + 10)}>
                                    <ChevronRight style={{ width: 13, height: 13 }} />
                                </NavBtn>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
                                {yearCells.map((year) => {
                                    const isSelected = year === currentYear;
                                    const isThisYear = year === new Date().getFullYear();
                                    const isOutside = year < decadeStart || year > decadeStart + 9;
                                    return (
                                        <button key={year} type="button" onClick={() => handleSelectYear(year)}
                                            style={{
                                                background: isSelected ? "#16A34A" : "transparent",
                                                color: isSelected ? "#fff" : isOutside ? "var(--gb-muted)" : isThisYear ? "#16A34A" : "var(--gb-text)",
                                                border: isThisYear && !isSelected ? "1.5px solid #16A34A40" : "1.5px solid transparent",
                                                borderRadius: "8px",
                                                padding: "9px 4px",
                                                fontSize: "12px",
                                                fontWeight: isSelected ? 700 : 400,
                                                cursor: "pointer",
                                                transition: "background 0.12s",
                                            }}
                                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(22,163,74,0.1)"; }}
                                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                                            {year}
                                        </button>
                                    );
                                })}
                            </div>

                            <button type="button" onClick={() => setMode("month")}
                                style={{ marginTop: "8px", width: "100%", background: "transparent", border: "none", fontSize: "11px", color: "var(--gb-muted)", cursor: "pointer", padding: "4px", borderRadius: "6px" }}>
                                ← Retour aux mois
                            </button>
                        </>
                    )}

                    {mode === "decade" && (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "12px",
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 700,
                                        fontSize: "13px",
                                        color: "var(--gb-text)",
                                    }}
                                >
                                    Choisir une décennie
                                </span>
                            </div>

                            {(() => {
                                const minYear = 1950;
                                const maxYear = new Date().getFullYear() + 5;

                                const decades = [];

                                for (let year = minYear; year <= maxYear; year += 10) {
                                    decades.push(year);
                                }

                                return (
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3, 1fr)",
                                            gap: "6px",
                                            maxHeight: "250px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {decades.map((start) => {
                                            const isSelected =
                                                currentYear !== null &&
                                                currentYear >= start &&
                                                currentYear < start + 10;

                                            return (
                                                <button
                                                    key={start}
                                                    type="button"
                                                    onClick={() => handleSelectDecade(start)}
                                                    style={{
                                                        background: isSelected
                                                            ? "#16A34A"
                                                            : "transparent",
                                                        color: isSelected
                                                            ? "#fff"
                                                            : "var(--gb-text)",
                                                        border: "1px solid var(--gb-border)",
                                                        borderRadius: "8px",
                                                        padding: "10px 6px",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {start}–{start + 9}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            <button
                                type="button"
                                onClick={() => setMode("year")}
                                style={{
                                    marginTop: "10px",
                                    width: "100%",
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "11px",
                                    color: "var(--gb-muted)",
                                    cursor: "pointer",
                                }}
                            >
                                ← Retour aux années
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick}
            style={{
                background: "var(--gb-app-hover)", border: "none", borderRadius: "8px",
                padding: "6px 10px", cursor: "pointer", color: "var(--gb-text)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(22,163,74,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--gb-app-hover)"; }}>
            {children}
        </button>
    );
}