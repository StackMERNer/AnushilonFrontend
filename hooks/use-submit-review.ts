"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { createStudyService } from "@/services/study.service";
import { touchToday } from "@/lib/daily-goal";
import { celebrateChapter } from "@/lib/fun";

export function useSubmitReview() {
  const study = createStudyService(apiClient);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: study.submitReview,
    retry: 2,
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["due-count"] });
      touchToday(vars.questionId);
      if (res.chapterComplete)
        celebrateChapter(
          res.chapterComplete.chapterId,
          res.chapterComplete.name,
        );
    },
  });
}
