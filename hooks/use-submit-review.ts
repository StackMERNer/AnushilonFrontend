"use client";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { createStudyService } from "@/services/study.service";

export function useSubmitReview() {
  const study = createStudyService(apiClient);
  return useMutation({ mutationFn: study.submitReview, retry: 2 });
}
