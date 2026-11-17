"use server";

import { redirect } from "next/navigation";
import { createStudyService } from "@/services/study.service";
import { createServerApiClient } from "@/lib/api/api-server";

type ActionState = {
  error: string | null;
};

export async function startNewCardsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const subjectId = String(formData.get("subjectId") ?? "");
  const chapterId = String(formData.get("chapterId") ?? "");
  const topicId = String(formData.get("topicId") ?? "") || undefined;
  const count = Math.min(100, Math.max(1, Number(formData.get("count")) || 10));
  const types = formData.getAll("types").map(String).filter(Boolean);

  try {
    await createStudyService(createServerApiClient()).startNew({
      chapterId,
      topicId,
      count,
      types,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "প্রশ্ন শুরু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    };
  }

  const qs = new URLSearchParams({ chapter: chapterId });
  if (topicId) qs.set("topic", topicId);
  if (subjectId) qs.set("subject", subjectId);
  if (types.length) qs.set("types", types.join(","));

  redirect(`/review?${qs}`);
}
