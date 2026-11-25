"use server";
import { createServerApiClient } from "@/lib/api/api-server";
import { createPdfService } from "@/services/pdf.service";
import type { CardQuestion } from "@/components/QuestionCard";

export async function getAnchorQuestions(
  anchorId: string,
): Promise<CardQuestion[]> {
  if (!/^[a-f\d]{24}$/i.test(anchorId)) throw new Error("Invalid anchor");
  const r = await createPdfService(createServerApiClient()).getAnchorQuestions(
    anchorId,
  );
  return r.questions;
}
