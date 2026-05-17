import { useRef, useEffect, useCallback } from "react";
import { GripVertical } from "lucide-react";

interface ResizableSplitProps {
    leftWidth: number;
    onWidthChange: (w: number) => void;
    minLeft?: number;
    maxLeft?: number;
}

export function ResizeHandle({ leftWidth, onWidthChange, minLeft = 280, maxLeft = 700 }: ResizableSplitProps) {
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            isDragging.current = true;
            startX.current = e.clientX;
            startWidth.current = leftWidth;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            e.preventDefault();
        },
        [leftWidth],
    );

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const delta = e.clientX - startX.current;
            const newWidth = Math.max(minLeft, Math.min(maxLeft, startWidth.current + delta));
            onWidthChange(newWidth);
        };
        const onMouseUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    }, [minLeft, maxLeft, onWidthChange]);

    return (
        <div
            onMouseDown={onMouseDown}
            style={{
                width: "6px",
                flexShrink: 0,
                background: "var(--gb-border)",
                cursor: "col-resize",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                position: "relative",
                zIndex: 5,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(22,163,74,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--gb-border)"; }}
            title="Glisser pour redimensionner">
            <GripVertical style={{ width: 10, height: 20, color: "var(--gb-muted)", pointerEvents: "none" }} />
        </div>
    );
}