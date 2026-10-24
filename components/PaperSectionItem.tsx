import { IPaperSectionItem } from "@/types/question-paper";
import PaperQuestion from "./PaperQuestion";
import QuestionHeading from "./QuestionHeading";
import PaperTextItem from "./PaperTextItem";

export default function PaperSectionItem({
    item,
    defaultQuestionNo,
    questionCount,
    marksPerQuestion,
    isEditingMode,
    language
}: {
    item: IPaperSectionItem;
    defaultQuestionNo: number;
    questionCount: number;
    marksPerQuestion: number;
    isEditingMode: boolean;
    language: 'bn' | 'en'
}) {

    const editableProps = isEditingMode ? { contentEditable: true, suppressContentEditableWarning: true } : {};
    switch (item.type) {
        case "text":
            return (
                <PaperTextItem
                    content={item.content}
                    isEditingMode={isEditingMode}
                />
            );
        case "question_heading":
            return (
                <QuestionHeading
                    item={item}
                    questionCount={questionCount}
                    marksPerQuestion={marksPerQuestion}
                    isEditingMode={isEditingMode}
                />
            );
        case "question":
            return <PaperQuestion language={language} editableProps={editableProps} item={item as any} defaultQuestionNo={defaultQuestionNo} />;
        default:
            return null;
    }
}