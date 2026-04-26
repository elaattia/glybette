import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cvApi } from "../api/cv.api";
import type { CvEditorState, CvSection, CvTemplate } from "../types/cv.types";
import { CV_LIST_KEY } from "./useCvList";

const AUTOSAVE_DELAY_MS = 2000;

export function useCvEditor(initial: CvEditorState) {
    const [state, setState] = useState<CvEditorState>(initial);
    const qc = useQueryClient();
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const persist = useCallback(
        async (s: CvEditorState) => {
            if (!s.isDirty) return;
            setState((prev) => ({ ...prev, isSaving: true }));

            try {
                const payload = { title: s.title, template: s.template, sections: s.sections };

                if (s.id) {
                    await cvApi.update(s.id, payload);
                    setState((prev) => ({ ...prev, isDirty: false, isSaving: false, lastSaved: new Date() }));
                } else {
                    const { cv } = await cvApi.create(payload);
                    setState((prev) => ({
                        ...prev,
                        id: cv._id,
                        isDirty: false,
                        isSaving: false,
                        lastSaved: new Date(),
                    }));
                }

                qc.invalidateQueries({ queryKey: CV_LIST_KEY });
            } catch (err) {
                console.error("[useCvEditor] save failed:", err);
                setState((prev) => ({ ...prev, isSaving: false }));
            }
        },
        [qc],
    );

    useEffect(() => {
        if (!state.isDirty) return;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => persist(state), AUTOSAVE_DELAY_MS);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [state, persist]);

    const setTitle = useCallback((title: string) => setState((prev) => ({ ...prev, title, isDirty: true })), []);

    const setTemplate = useCallback(
        (template: CvTemplate) => setState((prev) => ({ ...prev, template, isDirty: true })),
        [],
    );

    const updateSection = useCallback(
        (type: string, data: CvSection["data"]) =>
            setState((prev) => ({
                ...prev,
                isDirty: true,
                sections: prev.sections.map((s) => (s.type === type ? ({ ...s, data } as CvSection) : s)),
            })),
        [],
    );

    const addSection = useCallback(
        (section: CvSection) =>
            setState((prev) => ({
                ...prev,
                isDirty: true,
                sections: [...prev.sections, section].sort((a, b) => a.order - b.order),
            })),
        [],
    );

    const removeSection = useCallback(
        (type: string) =>
            setState((prev) => ({
                ...prev,
                isDirty: true,
                sections: prev.sections.filter((s) => s.type !== type),
            })),
        [],
    );

    const reorderSections = useCallback(
        (sections: CvSection[]) => setState((prev) => ({ ...prev, isDirty: true, sections })),
        [],
    );

    const setAtsScore = useCallback((score: number) => setState((prev) => ({ ...prev, atsScore: score })), []);

    const setPdfUrl = useCallback((pdfUrl: string) => setState((prev) => ({ ...prev, pdfUrl })), []);

    const setShareInfo = useCallback(
        (shareToken: string | undefined, isPublic: boolean) => setState((prev) => ({ ...prev, shareToken, isPublic })),
        [],
    );

    const saveNow = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        return persist(state);
    }, [persist, state]);

    return {
        state,
        setTitle,
        setTemplate,
        updateSection,
        addSection,
        removeSection,
        reorderSections,
        setAtsScore,
        setPdfUrl,
        setShareInfo,
        saveNow,
    };
}
