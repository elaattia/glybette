import React from "react";
import { Plus, Trash2 } from "lucide-react";

export const inputCss: React.CSSProperties = {
    width: "100%",
    background: "var(--gb-app-hover)",
    border: "1.5px solid var(--gb-border)",
    borderRadius: "10px",
    padding: "9px 12px",
    fontSize: "13px",
    color: "var(--gb-text)",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.18s",
    boxSizing: "border-box" as const,
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            style={{ ...inputCss, ...(props.style ?? {}) }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor = "#16A34A";
                props.onFocus?.(e);
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--gb-border)";
                props.onBlur?.(e);
            }}
        />
    );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            style={{ ...inputCss, minHeight: "76px", resize: "vertical", ...(props.style ?? {}) }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#16A34A")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gb-border)")}
        />
    );
}

export function Label({ children }: { children: React.ReactNode }) {
    return (
        <label
            style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--gb-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "5px",
            }}>
            {children}
        </label>
    );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <Label>{label}</Label>
            {children}
        </div>
    );
}

export const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };
export const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" };

export const itemBox: React.CSSProperties = {
    background: "var(--gb-app-hover)",
    border: "1px solid var(--gb-border)",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "10px",
};

export const addBtn: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "transparent",
    border: "1.5px dashed var(--gb-border2)",
    borderRadius: "10px",
    padding: "9px",
    color: "var(--gb-muted)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
};

export const delBtn: React.CSSProperties = {
    background: "transparent",
    border: "1px solid rgba(220,38,38,0.2)",
    borderRadius: "7px",
    padding: "4px 6px",
    color: "#dc2626",
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
};

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            style={addBtn}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)";
                e.currentTarget.style.color = "#16A34A";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--gb-border2)";
                e.currentTarget.style.color = "var(--gb-muted)";
            }}
            onClick={onClick}>
            <Plus style={{ width: 14, height: 14 }} /> {label}
        </button>
    );
}

export function DeleteButton({ onClick }: { onClick: () => void }) {
    return (
        <button style={delBtn} onClick={onClick}>
            <Trash2 style={{ width: 13, height: 13 }} />
        </button>
    );
}