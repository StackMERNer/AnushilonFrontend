import { getDefaultQuestionHeading } from "@/lib/question-paper";
import { IPaperSectionItem } from "@/types/question-paper";
import RichTextRenderer from "./RichTextRenderer";

export default function QuestionHeading({
    item,
    questionCount,
    marksPerQuestion,
}: {
    item: Extract<IPaperSectionItem, { type: "question_heading" }>;
    questionCount: number;
    marksPerQuestion: number;
    isEditingMode: boolean
}) {
    const content = item.content ?? getDefaultQuestionHeading(
        item.questionType,
        questionCount,
        marksPerQuestion
    );

    return (
        <div
            className="mb-1 mt-2 break-inside-avoid font-semibold"
        >
            <RichTextRenderer editableProps={true ? { contentEditable: true, suppressContentEditableWarning: true } : {}} content={content} />
        </div>
    );
}