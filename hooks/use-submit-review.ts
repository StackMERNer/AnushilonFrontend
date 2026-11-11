"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { createStudyService } from "@/services/study.service";

export function useSubmitReview() {
  const study = createStudyService(apiClient);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: study.submitReview,
    retry: 2,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      // also needs to invalidate whatever key your useDueCount hook uses (sidebar badge)
    },
  });
}
