import { useCallback, useEffect, useMemo, useState } from "react";
import { PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type {
    PortfolioBlock,
    PortfolioBlockType,
    PortfolioTab,
    PortfolioTemplateId,
    SavePortfolioRequest,
} from "@glybette/contracts";
import { useCurrentPortfolio, usePortfolioMutations } from "@/hooks/usePortfolio";
import { useUser } from "@/hooks/useUser";
import {
    createPortfolioBlock,
    createPortfolioTab,
    createStarterPortfolio,
    getTemplate,
    normalizePortfolioSlug,
    toSaveRequest,
} from "@/lib/portfolio";
import { loadPortfolioDraft, savePortfolioDraft } from "@/lib/portfolio-draft-storage";
import { normalizeDraftGrid, reflowBlocks } from "@/lib/portfolio-draft";

export type BuilderStep = "slug" | "template" | "editor";

export function usePortfolioBuilderState() {
    const { user } = useUser();
    const userId = user?.id;
    const currentPortfolio = useCurrentPortfolio();
    const mutations = usePortfolioMutations();
    const [step, setStep] = useState<BuilderStep>("slug");
    const [slugInput, setSlugInput] = useState("");
    const [slugMessage, setSlugMessage] = useState("");
    const [draft, setDraft] = useState<SavePortfolioRequest | null>(null);
    const [activeTabId, setActiveTabId] = useState<string | undefined>();
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [localSavedAt, setLocalSavedAt] = useState<string | null>(null);
    const [isDraggingBlock, setIsDraggingBlock] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
    );

    const activeTab = useMemo(
        () => draft?.tabs.find((tab) => tab.id === activeTabId) ?? draft?.tabs[0],
        [activeTabId, draft?.tabs],
    );
    const selectedBlock = useMemo(
        () => activeTab?.blocks.find((block) => block.id === selectedBlockId) ?? null,
        [activeTab?.blocks, selectedBlockId],
    );

    useEffect(() => {
        if (!userId || currentPortfolio.isPending || draft) {
            return;
        }

        const remote = currentPortfolio.data?.portfolio;
        let cancelled = false;

        queueMicrotask(() => {
            if (cancelled) {
                return;
            }

            if (!remote) {
                setStep("slug");
                return;
            }

            const remoteDraft = toSaveRequest(remote);
            const localDraft = loadPortfolioDraft(userId, remote.slug);
            setDraft(normalizeDraftGrid(localDraft ?? remoteDraft));
            setSlugInput(remote.slug);
            setActiveTabId(remote.tabs[0]?.id);
            setStep("editor");
        });

        return () => {
            cancelled = true;
        };
    }, [currentPortfolio.data?.portfolio, currentPortfolio.isPending, draft, userId]);

    useEffect(() => {
        if (!draft || !userId) {
            return;
        }

        savePortfolioDraft(userId, draft);
        const savedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        queueMicrotask(() => {
            setLocalSavedAt(savedAt);
        });
    }, [draft, userId]);

    const updateDraft = useCallback((updater: (draft: SavePortfolioRequest) => SavePortfolioRequest) => {
        setDraft((current) => (current ? updater(current) : current));
    }, []);

    const updateActiveTab = useCallback(
        (updater: (tab: PortfolioTab) => PortfolioTab) => {
            updateDraft((current) => ({
                ...current,
                tabs: current.tabs.map((tab) => (tab.id === activeTab?.id ? updater(tab) : tab)),
            }));
        },
        [activeTab?.id, updateDraft],
    );

    const updateSelectedBlock = useCallback(
        (updater: (block: PortfolioBlock) => PortfolioBlock) => {
            updateActiveTab((tab) => ({
                ...tab,
                blocks: tab.blocks.map((block) => (block.id === selectedBlockId ? updater(block) : block)),
            }));
        },
        [selectedBlockId, updateActiveTab],
    );

    const handleSlugContinue = useCallback(async () => {
        const slug = normalizePortfolioSlug(slugInput);
        setSlugInput(slug);
        setSlugMessage("");
        const availability = await mutations.checkSlug.mutateAsync(slug);
        if (!availability.available) {
            setSlugMessage("That portfolio URL is already taken.");
            return;
        }
        await mutations.setSlug.mutateAsync(slug);
        setStep("template");
    }, [mutations.checkSlug, mutations.setSlug, slugInput]);

    const chooseTemplate = useCallback(
        (templateId: PortfolioTemplateId) => {
            const nextDraft = createStarterPortfolio(normalizePortfolioSlug(slugInput), templateId);
            setDraft(nextDraft);
            setActiveTabId(nextDraft.tabs[0]?.id);
            setSelectedBlockId(nextDraft.tabs[0]?.blocks[0]?.id ?? null);
            setStep("editor");
        },
        [slugInput],
    );

    const applyTemplate = useCallback(
        (templateId: PortfolioTemplateId) => {
            const template = getTemplate(templateId);
            updateDraft((current) => ({
                ...current,
                templateId,
                style: template.defaultStyle,
            }));
        },
        [updateDraft],
    );

    const addBlock = useCallback(
        (type: PortfolioBlockType) => {
            if (!activeTab) {
                return;
            }
            const block = createPortfolioBlock(type, activeTab.blocks.length + 1);
            updateActiveTab((tab) => ({ ...tab, blocks: [...tab.blocks, block] }));
            setSelectedBlockId(block.id);
        },
        [activeTab, updateActiveTab],
    );

    const addTab = useCallback(() => {
        const tab = createPortfolioTab("Custom tab");
        updateDraft((current) => ({ ...current, tabs: [...current.tabs, tab] }));
        setActiveTabId(tab.id);
        setSelectedBlockId(null);
    }, [updateDraft]);

    const updateTab = useCallback(
        (tabId: string, label: string) => {
            updateDraft((current) => ({
                ...current,
                tabs: current.tabs.map((tab) =>
                    tab.id === tabId
                        ? {
                              ...tab,
                              label,
                              slug: normalizePortfolioSlug(label) || tab.slug,
                          }
                        : tab,
                ),
            }));
        },
        [updateDraft],
    );

    const deleteTab = useCallback(
        (tabId: string) => {
            if (!draft || draft.tabs.length <= 1) {
                return;
            }

            const deletedIndex = draft.tabs.findIndex((tab) => tab.id === tabId);
            const nextTabs = draft.tabs.filter((tab) => tab.id !== tabId);
            const nextActiveTab = nextTabs[Math.max(0, Math.min(deletedIndex, nextTabs.length - 1))];
            updateDraft((current) => ({
                ...current,
                tabs: current.tabs.filter((tab) => tab.id !== tabId),
            }));

            if (activeTabId === tabId) {
                setActiveTabId(nextActiveTab?.id);
                setSelectedBlockId(nextActiveTab?.blocks[0]?.id ?? null);
            }
        },
        [activeTabId, draft, updateDraft],
    );

    const deleteSelectedBlock = useCallback(() => {
        if (!selectedBlockId) {
            return;
        }

        updateActiveTab((tab) => ({
            ...tab,
            blocks: reflowBlocks(tab.blocks.filter((block) => block.id !== selectedBlockId)),
        }));
        setSelectedBlockId(null);
    }, [selectedBlockId, updateActiveTab]);

    const selectTab = useCallback((tab: PortfolioTab) => {
        setActiveTabId(tab.id);
        setSelectedBlockId(tab.blocks[0]?.id ?? null);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setIsDraggingBlock(false);
            const { active, over } = event;
            if (!over || active.id === over.id || !activeTab) {
                return;
            }
            const oldIndex = activeTab.blocks.findIndex((block) => block.id === active.id);
            const newIndex = activeTab.blocks.findIndex((block) => block.id === over.id);
            if (oldIndex < 0 || newIndex < 0) {
                return;
            }

            updateActiveTab((tab) => ({
                ...tab,
                blocks: reflowBlocks(arrayMove(tab.blocks, oldIndex, newIndex)),
            }));
        },
        [activeTab, updateActiveTab],
    );

    const handleDragStart = useCallback(() => {
        setIsDraggingBlock(true);
    }, []);

    const handleDragCancel = useCallback(() => {
        setIsDraggingBlock(false);
    }, []);

    const handleSave = useCallback(async () => {
        if (!draft || !userId) {
            return false;
        }
        const response = await mutations.save.mutateAsync(draft);
        if (response.portfolio) {
            savePortfolioDraft(userId, toSaveRequest(response.portfolio));
            return true;
        }
        return false;
    }, [draft, mutations.save, userId]);

    const updateSlug = useCallback(
        async (value: string) => {
            const slug = normalizePortfolioSlug(value);
            if (slug.length < 3) {
                setSlugMessage("Portfolio URL name must be at least 3 characters.");
                return;
            }

            const availability = await mutations.checkSlug.mutateAsync(slug);
            if (!availability.available) {
                setSlugMessage("That portfolio URL is already taken.");
                return;
            }

            setSlugMessage("");
            updateDraft((current) => ({ ...current, slug }));
            setSlugInput(slug);
        },
        [mutations.checkSlug, updateDraft],
    );

    return {
        user,
        currentPortfolio,
        mutations,
        step,
        slugInput,
        setSlugInput,
        slugMessage,
        draft,
        activeTab,
        selectedBlock,
        selectedBlockId,
        setSelectedBlockId,
        setActiveTabId,
        localSavedAt,
        isDraggingBlock,
        sensors,
        updateDraft,
        updateSelectedBlock,
        handleSlugContinue,
        chooseTemplate,
        applyTemplate,
        addBlock,
        addTab,
        updateTab,
        deleteTab,
        deleteSelectedBlock,
        selectTab,
        handleDragStart,
        handleDragCancel,
        handleDragEnd,
        handleSave,
        updateSlug,
    };
}
