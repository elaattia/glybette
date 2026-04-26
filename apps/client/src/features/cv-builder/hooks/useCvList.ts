import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi } from "../api/cv.api";
import type { CvDTO } from "../types/cv.types";

export const CV_LIST_KEY = ["cvs"] as const;

export function useCvList() {
    const qc = useQueryClient();

    const listQuery = useQuery({
        queryKey: CV_LIST_KEY,
        queryFn: () => cvApi.list().then((r) => r.cvs),
        staleTime: 30_000,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => cvApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: CV_LIST_KEY }),
    });

    const duplicateMutation = useMutation({
        mutationFn: (id: string) => cvApi.duplicate(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: CV_LIST_KEY }),
    });

    const generatePdfMutation = useMutation({
        mutationFn: (id: string) => cvApi.generatePdf(id),
        onSuccess: ({ pdfUrl }, id) => {
            qc.setQueryData<CvDTO[]>(CV_LIST_KEY, (prev) =>
                prev?.map((cv) => (cv._id === id ? { ...cv, pdfUrl } : cv)),
            );
            const a = document.createElement("a");
            a.href = pdfUrl;
            a.download = "cv.pdf";
            a.click();
        },
    });

    return {
        cvs: listQuery.data ?? [],
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,
        deleteCV: deleteMutation.mutateAsync,
        isDeletingId: deleteMutation.isPending ? deleteMutation.variables : null,
        duplicateCV: duplicateMutation.mutateAsync,
        isDuplicatingId: duplicateMutation.isPending ? duplicateMutation.variables : null,
        exportPdf: generatePdfMutation.mutateAsync,
        isExportingId: generatePdfMutation.isPending ? generatePdfMutation.variables : null,
    };
}
