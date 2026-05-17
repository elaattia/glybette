import React from "react";
import { Search } from "lucide-react";
import { listStyles as s } from "../styles";

interface EmptyStateProps {
    onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
    return (
        <div style={s.empty}>
            <div style={{ fontSize: 44, opacity: 0.3 }}>
                <Search size={44} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--gb-text-off)", margin: 0 }}>
                Aucune offre trouvée
            </h3>
            <p style={{ fontSize: 14, color: "var(--gb-muted)", margin: 0 }}>
                Essayez de modifier vos filtres ou votre recherche.
            </p>
            <button onClick={onReset} style={s.emptyBtn}>
                Réinitialiser les filtres
            </button>
        </div>
    );
}