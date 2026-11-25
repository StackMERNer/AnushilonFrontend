"use client";
import { apiClient } from "@/lib/api/api-client";
import {
  createPdfService,
  IExportInfo,
  IPdfAnchor,
  PdfRect,
} from "@/services/pdf.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ms from "ms";
import { useUserProfile } from "./useUserProfile";

export const pdfService = createPdfService(apiClient);

export function usePdfAnchors(
  versionId: string,
  admin: boolean,
  initial?: IPdfAnchor[],
) {
  return useQuery({
    queryKey: ["pdf-anchors", versionId, admin],
    queryFn: () =>
      admin
        ? pdfService.getAdminAnchors(versionId)
        : pdfService.getAnchors(versionId),
    initialData: admin ? undefined : initial, // students get the server-fetched list, no extra request
    placeholderData: (prev) => prev,
    staleTime: ms("5m"),
    refetchOnWindowFocus: false,
  });
}

export function useAnchorMutations(versionId: string) {
  const qc = useQueryClient();
  const done = () => {
    qc.invalidateQueries({ queryKey: ["pdf-anchors", versionId] });
    qc.invalidateQueries({ queryKey: ["anchor-questions"] });
  };
  return {
    create: useMutation({
      mutationFn: (b: { page: number; rect: PdfRect; questions: string[] }) =>
        pdfService.createAnchor({ version: versionId, ...b }),
      onSuccess: done,
    }),
    update: useMutation({
      mutationFn: (v: { id: string; rect: PdfRect; questions: string[] }) =>
        pdfService.updateAnchor(v.id, { rect: v.rect, questions: v.questions }),
      onSuccess: done,
    }),
    remove: useMutation({
      mutationFn: (id: string) => pdfService.deleteAnchor(id),
      onSuccess: done,
    }),
  };
}

export function useCreateBook() {
  return useMutation({ mutationFn: pdfService.createBook });
}

export function usePdfSubjects() {
  const { data: user } = useUserProfile();
  return useQuery({
    queryKey: ["pdf-subjects", user?.profile?._id, user?.activeTrackId], // refetch when profile/track changes
    queryFn: async () => (await pdfService.getSubjects()).subjectIds,
    enabled: !!user?.profile,
    staleTime: ms("30m"),
    refetchOnWindowFocus: false,
  });
}

export function useHasPdf() {
  const { data, isLoading } = usePdfSubjects();
  return { hasPdf: (data?.length ?? 0) > 0, isLoading };
}

export function useBookExport(bookId: string, enabled: boolean) {
  const qc = useQueryClient();
  const key = ["pdf-export", bookId];
  const info = useQuery({
    queryKey: key,
    queryFn: () => pdfService.getExport(bookId),
    enabled,
    staleTime: ms("5m"),
    refetchOnWindowFocus: false,
  });
  const generate = useMutation({
    mutationFn: (b: { topic?: string }) => pdfService.generateExport(bookId, b),
    onSuccess: (meta) =>
      qc.setQueryData<IExportInfo>(
        key,
        (old) => old && { ...old, export: meta },
      ),
  });
  return { info, generate };
}
