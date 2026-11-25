"use client";
import { apiClient } from "@/lib/api/api-client";
import { createPdfService, IPdfAnchor, PdfRect } from "@/services/pdf.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ms from "ms";

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
