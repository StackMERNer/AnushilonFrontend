"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { createQuestionFeedbackService } from "@/services/question-feedback.service";

const service = createQuestionFeedbackService(apiClient);

export function useBookmarkToggle(questionId: string, initial = false) {
  const [bookmarked, setBookmarked] = useState(initial);
  const [failed, setFailed] = useState(false);

  const m = useMutation({
    mutationFn: (next: boolean) =>
      next
        ? service.addBookmark(questionId)
        : service.removeBookmark(questionId),
  });

  const toggle = () => {
    if (m.isPending) return;
    const next = !bookmarked;
    setBookmarked(next);
    setFailed(false);
    m.mutate(next, {
      onError: () => {
        setBookmarked(!next);
        setFailed(true);
        setTimeout(() => setFailed(false), 2500);
      },
    });
  };

  return { bookmarked, toggle, failed };
}
