import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cvApi } from "../api/cv.api";
import type { AtsScoreResult, SuggestionsResult, TailorResult } from "../types/cv.types";

export function useAiFeatures(cvId: string | undefined) {
    const { t } = useTranslation("cvBuilder");
    const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);
    const [atsCvOnlyResult, setAtsCvOnlyResult] = useState<AtsScoreResult | null>(null); 
    const [suggestions, setSuggestions] = useState<SuggestionsResult["suggestions"]>([]);
    const [coverLetter, setCoverLetter] = useState<string>("");
    const [tailorResult, setTailorResult] = useState<TailorResult | null>(null);

    const [loadingAts, setLoadingAts] = useState(false);
    const [loadingAtsCvOnly, setLoadingAtsCvOnly] = useState(false); 
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);
    const [loadingTailor, setLoadingTailor] = useState(false);
    const [enhancingKey, setEnhancingKey] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    const guarded = useCallback(
        <T>(setLoading: (v: boolean) => void, fn: (id: string) => Promise<T>): Promise<T | undefined> => {
            if (!cvId) {
                setError(t("ai.errors.saveFirst"));
                return Promise.resolve(undefined);
            }
            setLoading(true);
            setError(null);
            return fn(cvId)
                .catch((e: Error) => {
                    setError(e.message);
                    return undefined;
                })
                .finally(() => setLoading(false));
        },
        [cvId, t],
    );

    const checkAtsCvOnly = useCallback(
        () =>
            guarded(setLoadingAtsCvOnly, async (id) => {
                const result = await cvApi.scoreAtsCvOnly(id);
                setAtsCvOnlyResult(result);
                return result;
            }),
        [guarded],
    );

    const checkAts = useCallback(
        (jobDescription: string) =>
            guarded(setLoadingAts, async (id) => {
                const result = await cvApi.scoreAts(id, jobDescription);
                setAtsResult(result);
                return result;
            }),
        [guarded],
    );

    const getSuggestions = useCallback(
        (targetRole?: string) =>
            guarded(setLoadingSuggestions, async (id) => {
                const result = await cvApi.suggestImprovements(id, targetRole);
                setSuggestions(result.suggestions);
                return result;
            }),
        [guarded],
    );

    const tailorCv = useCallback(
        (jobDescription: string) =>
            guarded(setLoadingTailor, async (id) => {
                const result = await cvApi.tailorCv(id, jobDescription);
                setTailorResult(result);
                return result;
            }),
        [guarded],
    );

    const generateCoverLetter = useCallback(
        (jobDescription: string, tone?: string) =>
            guarded(setLoadingCoverLetter, async (id) => {
                const result = await cvApi.coverLetter(id, jobDescription, tone);
                setCoverLetter(result.content);
                return result;
            }),
        [guarded],
    );

    const enhanceSection = useCallback(
        async (text: string, sectionType: string, enhanceKey: string): Promise<string | null> => {
            if (!cvId) { setError(t("ai.errors.saveFirst")); return null; }
            if (!text.trim()) { setError(t("ai.errors.emptyField")); return null; }
            setEnhancingKey(enhanceKey);
            setError(null);
            try {
                const result = await cvApi.enhanceSection(cvId, text, sectionType);
                return result.enhanced;
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : t("ai.errors.generic"));
                return null;
            } finally {
                setEnhancingKey(null);
            }
        },
        [cvId, t],
    );

    const clearError = useCallback(() => setError(null), []);
    const clearResults = useCallback(() => {
        setAtsResult(null);
        setAtsCvOnlyResult(null);
        setSuggestions([]);
        setCoverLetter("");
        setTailorResult(null);
        setError(null);
    }, []);

    return {
        atsResult,
        atsCvOnlyResult,       
        suggestions,
        coverLetter,
        tailorResult,
        error,

        loadingAts,
        loadingAtsCvOnly,      
        loadingSuggestions,
        loadingCoverLetter,
        loadingTailor,
        enhancingKey,

        checkAts,
        checkAtsCvOnly,       
        getSuggestions,
        tailorCv,
        generateCoverLetter,
        enhanceSection,
        clearError,
        clearResults,
    };
}