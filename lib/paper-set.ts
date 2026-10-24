import { seededShuffle } from "./seeded-random";
import { IPaperSectionItem } from "@/types/question-paper";

export const setLabels = ["ক", "খ", "গ", "ঘ", "ঙ", "চ"];

export function getSetSeed(
  paperId: string,
  sectionId: string,
  setIndex: number,
) {
  return `${paperId}:${sectionId}:set-${setIndex}`;
}

export function reorderSectionItemsForSet(
  items: IPaperSectionItem[],
  sectionType: string,
  seed: string,
): IPaperSectionItem[] {
  if (sectionType !== "mcq") return items; // only MCQ sections get shuffled

  const questionSlots: number[] = [];
  const questionItems: IPaperSectionItem[] = [];

  items.forEach((item, idx) => {
    if (item.type === "question") {
      questionSlots.push(idx);
      questionItems.push(item);
    }
  });

  if (questionItems.length < 2) return items;

  const shuffled = seededShuffle(questionItems, seed);
  const result = [...items];
  questionSlots.forEach((slotIdx, i) => {
    result[slotIdx] = shuffled[i];
  });

  return result;
}
