"use server";
import { redirect } from "next/navigation";
import { createStudyService } from "@/services/study.service";
import { createServerApiClient } from "@/lib/api/api-server";

export async function startNewCardsAction(formData: FormData) {
  const chapterId = String(formData.get("chapterId") ?? "");
  const topicId = String(formData.get("topicId") ?? "") || undefined;
  const count = Math.min(100, Math.max(1, Number(formData.get("count")) || 10));

  await createStudyService(createServerApiClient()).startNew({
    chapterId,
    topicId,
    count,
  });
  redirect(`/review?chapter=${chapterId}${topicId ? `&topic=${topicId}` : ""}`);
}
