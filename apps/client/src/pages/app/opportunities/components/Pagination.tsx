import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageRange } from "../constants";
import { listStyles as s } from "../styles";

interface PaginationProps {
    pages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ pages, currentPage, onPageChange }: PaginationProps) {
    if (pages <= 1) return null;

    return (
        <div style={s.pagination}>
            <button
                style={s.pager(false, currentPage <= 1)}
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}>
                <ChevronLeft size={14} />
            </button>

            {buildPageRange(currentPage, pages).map((p, i) =>
                p === "…" ? (
                    <span key={`ell-${i}`} style={{ color: "var(--gb-muted)", padding: "0 4px" }}>…</span>
                ) : (
                    <button
                        key={p}
                        style={s.pager(currentPage === p, false)}
                        onClick={() => onPageChange(p as number)}>
                        {p}
                    </button>
                ),
            )}

            <button
                style={s.pager(false, currentPage >= pages)}
                disabled={currentPage >= pages}
                onClick={() => onPageChange(currentPage + 1)}>
                <ChevronRight size={14} />
            </button>
        </div>
    );
}