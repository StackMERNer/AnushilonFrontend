import { getSetSeed, reorderSectionItemsForSet } from "@/lib/paper-set";
import { usePaperSetStore } from "@/store/paper-set-store";
import { usePrintSettingsStore } from "@/store/print-settings-store";
import { IPaperSectionItem, IPopulatedPaperQuestionItem } from "@/types/question-paper";
import { useMemo } from "react";
import EditingToolbar from "./EditingToolbar";
import PaperSectionItem from "./PaperSectionItem";
import { questionTypeMap } from "@/lib/question-paper";

interface PaperSectionProps {
    section: {
        _id: string;
        type: string;
        items: IPaperSectionItem[];
    };
    showUttorMcqMala: boolean;
    paperId: string;
}

export default function PaperSection({
    section,
    paperId,
    showUttorMcqMala,
}: PaperSectionProps) {
    const activeSetIndex = usePaperSetStore((s) => s.activeSetIndex);

    const items = useMemo(() => {
        if (activeSetIndex === 0) return section.items;

        const seed = getSetSeed(paperId, section._id, activeSetIndex);

        return reorderSectionItemsForSet(
            section.items,
            section.type,
            seed
        );
    }, [section.items, section.type, section._id, paperId, activeSetIndex]);

    const questionCount = items.filter(
        (item) => item.type === "question"
    ).length;

    const typeInfo = questionTypeMap[section.type];
    const marksPerQuestion = typeInfo?.marks || 0;
    const isDefaultEnglish = typeInfo?.defaultLang === "en";

    // Get only MCQ questions with their running question number + answer
    const mcqAnswers = useMemo(() => {
        if (section.type !== "mcq") return [];

        let questionNo = 0;

        return items
            .filter((item) => item.type === "question")
            .map((item) => {
                questionNo++;

                return {
                    number: questionNo,
                    answer: (item as unknown as IPopulatedPaperQuestionItem).question?.correctMcq ?? -1.,
                };
            });
    }, [items, section.type]);
    const isEditingMode = usePrintSettingsStore((s) => s.settings.editingMode);

    return (
        <div className="contents">
            {true && (
                <>
                    <EditingToolbar />
                </>
            )}
            {items.map((item, index) => {
                const defaultQuestionNo = items
                    .slice(0, index + 1)
                    .filter((i) => i.type === "question").length;

                return (
                    <PaperSectionItem
                        isEditingMode={isEditingMode}
                        key={item._id}
                        item={item}
                        defaultQuestionNo={defaultQuestionNo}
                        language={isDefaultEnglish ? 'en' : 'bn'}
                        questionCount={questionCount}
                        marksPerQuestion={marksPerQuestion}
                    />
                );
            })}

            {showUttorMcqMala && section.type === "mcq" && (
                <div className="mt-4 border-t pt-2">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(28px,1fr))] w-full max-w-full">
                        {mcqAnswers.map(({ number, answer }) => (
                            <div
                                key={number}
                                className="text-center"
                            >
                                {/* Number */}
                                <div className="h-5 border border-black/60 text-xs pt-0.5">
                                    {number}
                                </div>

                                {/* Answer */}
                                <div className="flex h-6 items-center justify-center border-x border-b border-black/60">
                                    <span className="flex h-4 w-4 items-center justify-center text-xs">
                                        {String.fromCharCode(2453 + answer)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}