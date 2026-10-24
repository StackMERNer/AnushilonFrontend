import { IPopulatedPaperQuestionItem } from "@/types/question-paper";
import RichTextRenderer from "./RichTextRenderer";
import clsx from "clsx";
import { toBnDigits } from "@/lib/helpers";
import { useOptionLabels } from "@/hooks/useOptionLabels";
import { usePrintSettingsStore } from "@/store/print-settings-store";
import { McqAnswerMarker, OptionBulletStyle } from "@/types/print-settings";
import { IBoard, ISchool } from "@/types/academic";
import { IQuestionBoard, IQuestionSchool } from "@/types/question";
import { questionTypeMap } from "@/lib/question-paper";
import { Columns3 } from "lucide-react";
import { useState } from "react";

function formatBoards(boards: IQuestionBoard[]): string {
    if (!boards || boards.length === 0) return "";
    return boards.map((boardInfo) => `${(boardInfo.board as any as IBoard).acronym}:${toBnDigits(boardInfo.year)}`).join(',');
}
function formatSchools(schools: IQuestionSchool[]): string {
    if (!schools || schools.length === 0) return "";
    return schools.map((schoolInfo) => `${((schoolInfo.school as any as ISchool).name)}`).join(',');
}

function getWrittenSubQuestionsMark(questions: any[]) {
    const length = questions.filter(Boolean).length;
    if (length === 2) return [3, 7]; // bangla shohopath questions
    if (length === 3) return [2, 4, 4]; // math cq questions
    return [1, 2, 3, 4]; // normal cq questions
}

export default function PaperQuestion({
    item,
    defaultQuestionNo,
    editableProps,
    language
}: {
    item: IPopulatedPaperQuestionItem;
    defaultQuestionNo: number;
    editableProps?: {
        contentEditable?: boolean;
        suppressContentEditableWarning?: boolean;
    },
    language: 'bn' | 'en'
}) {
    const optionColumnCount = usePrintSettingsStore((s) => s.settings.questionFormat.optionColumnCount); // 1 to 4
    const optionBulletStyle = usePrintSettingsStore((s) => s.settings.questionFormat.optionBulletStyle);
    const mcqAnswerMarker = usePrintSettingsStore((s) => s.settings.mcqAnswerMarker);
    const fileFormat = usePrintSettingsStore((s) => s.settings.fileFormat);
    const templabels = useOptionLabels();
    const optionLabels = language === 'en' ? ['a', 'b', 'c', 'd', 'e', 'f'] : templabels
    const showAnswers = fileFormat === "question-answer";
    const showQuestionInfo = usePrintSettingsStore((s) => s.settings.content.questionInfo);
    const showWrittenMarks = usePrintSettingsStore((s) => s.settings.content.writtenMarks);

    // NEW: per-question column override, null = use global default
    const [columnOverride, setColumnOverride] = useState<number | null>(null);
    const effectiveColumnCount = columnOverride ?? optionColumnCount;

    const question = item.question;

    const showQuestionNo = questionTypeMap[question?.type || '']?.marks > 0;
    const displayNo = item.questionNo || (language === 'en' ? defaultQuestionNo : toBnDigits(defaultQuestionNo));

    if (!question) return <div className="italic border border-red-400 min-h-10 px-2 flex items-center justify-center mt-2">প্রশ্নটি পাওয়া যায়নি।</div>;

    const boards = formatBoards(question.boards);
    const schools = formatSchools(question.schools);

    const cqMarks = getWrittenSubQuestionsMark(question.questions || []);

    return (
        <div className="align-top">
            <div className="font-medium grid grid-cols-[auto_1fr] gap-x-1 items-start">
                {showQuestionNo && (
                    <span {...editableProps} className="editable">
                        {displayNo ? `${displayNo}.` : ""}
                    </span>
                )}

                <div className="min-w-0">
                    {question.context && (
                        <RichTextRenderer
                            editableProps={editableProps}
                            content={question.context}
                        />
                    )}

                    {question.question && (
                        <RichTextRenderer
                            editableProps={editableProps}
                            content={question.question}
                        />
                    )}
                </div>
            </div>
            {
                showQuestionInfo && (boards || schools) && <div className="italic text-sm flex  justify-end w-full">
                    [{boards ? `${boards}` : ""}{schools ? ` ${schools}` : ""}]
                </div>
            }
            <div
                className={clsx("relative mt-1 grid gap-x-4 gap-y-1 pl-5 sm:pl-6 group/options", {
                    "hover:outline hover:outline-primary hover:outline-dashed":
                        question.type === "mcq",
                })}
                style={{
                    gridTemplateColumns: `repeat(${effectiveColumnCount}, minmax(0, 1fr))`,
                }}
            >
                {question.type === 'mcq' && (
                    <ColumnOverrideToolbar
                        current={effectiveColumnCount}
                        isOverridden={columnOverride !== null}
                        onSelect={setColumnOverride}
                        onReset={() => setColumnOverride(null)}
                    />
                )}
                {question.options?.map((option, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-1.5"
                    >
                        <OptionBullet
                            style={optionBulletStyle}
                            label={optionLabels[index]}
                            isCorrect={
                                showAnswers &&
                                question.correctMcq === index
                            }
                            mcqAnswerMarker={mcqAnswerMarker}
                            editableProps={editableProps}
                        />

                        <RichTextRenderer editableProps={editableProps} content={option} />
                    </div>
                ))}
                {showAnswers && question.type === "mcq" && mcqAnswerMarker !== "circle" && (question.correctMcq !== undefined && question.correctMcq !== -1) && <div className="absolute bottom-0 right-0">
                    {mcqAnswerMarker === "answer-bn" && `উঃ ${optionLabels[question.correctMcq]}`}
                    {mcqAnswerMarker === "answer-en" && `Ans: ${optionLabels[question.correctMcq!]}`}
                    {mcqAnswerMarker === "circle-outside" && <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black/60 bg-black text-white mb-1">
                        {optionLabels[question.correctMcq]}
                    </span>}
                </div>}
            </div>
            {
                showAnswers && question.answer && (

                    <div>ব্যাখ্যা: <RichTextRenderer editableProps={editableProps} content={question.answer} /></div>

                )
            }
            {/* render cq questions */}
            <div className="mt-1 grid gap-x-4 gap-y-1 pl-5">
                {
                    question.questions?.filter(Boolean)?.map((subQuestion, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-1.5 w-full"
                        >
                            <OptionBullet
                                style={optionBulletStyle}
                                label={optionLabels[index + question.options.length]}
                                editableProps={editableProps}
                            />
                            <RichTextRenderer editableProps={editableProps} content={subQuestion.question} />
                            {showWrittenMarks && <span {...editableProps} className="ml-auto whitespace-nowrap text-xs">{toBnDigits(cqMarks[index])}</span>}
                        </div>
                    ))
                }
            </div>
            {showAnswers &&
                (question?.questions?.filter(Boolean)?.length || 0) > 0 && (
                    <div className="mt-2">
                        <p className="font-semibold mb-1" {...editableProps}>
                            উত্তর:
                        </p>

                        <div className="space-y-1">
                            {question.questions?.filter(Boolean)?.map(
                                (solution, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-1.5"
                                    >
                                        <span className="shrink-0" {...editableProps}>
                                            {optionLabels[index]}.
                                        </span>

                                        <RichTextRenderer
                                            editableProps={editableProps}
                                            content={solution.answer}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

function OptionBullet({
    style,
    label,
    isCorrect = false,
    mcqAnswerMarker,
    editableProps
}: {
    style: OptionBulletStyle;
    label: string;
    isCorrect?: boolean;
    mcqAnswerMarker?: McqAnswerMarker;
    editableProps?: {
        contentEditable?: boolean;
        suppressContentEditableWarning?: boolean;
    }
}) {
    const isCorrectAndCircledStyle = isCorrect && mcqAnswerMarker === "circle";
    if (style === "none") {
        return <p {...editableProps} className={clsx(isCorrectAndCircledStyle && "bg-black text-white")}>{label})</p>;
    }

    if (style === "paren") {
        return <p {...editableProps} className={clsx(isCorrectAndCircledStyle && "bg-black text-white")}>({label})</p>;
    }

    if (style === "dot") {
        return (
            <p {...editableProps} className={clsx(
                "flex h-4 w-4 shrink-0 items-center justify-center mt-0.5",
                isCorrectAndCircledStyle && "bg-black text-white"
            )}>
                {label}.
            </p>
        );
    }

    if (style === "circle") {
        return (
            <span
                {...editableProps}
                className={clsx(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black/60 mt-0.5",
                    isCorrectAndCircledStyle && "bg-black text-white"
                )}
            >
                {label}
            </span>
        );
    }

    return (
        <p {...editableProps} className={clsx(isCorrectAndCircledStyle && "bg-black text-white")}>
            {label}
        </p>
    );
}
// hover-triggered floating toolbar
function ColumnOverrideToolbar({
    current,
    isOverridden,
    onSelect,
    onReset,
}: {
    current: number;
    isOverridden: boolean;
    onSelect: (n: number) => void;
    onReset: () => void;
}) {
    return (
        <div
            className={clsx(
                "print:hidden no-print absolute -top-6 left-0 z-20",
                "flex items-center gap-1 rounded-md border bg-white px-1.5 py-1 shadow-md",
                "opacity-0 pointer-events-none",
                "group-hover/options:opacity-100 group-hover/options:pointer-events-auto",
                "transition-opacity duration-150"
            )}
            // stop hover-losing flicker when moving from grid to toolbar itself
            onMouseEnter={(e) => e.stopPropagation()}
        >
            <Columns3 size={12} className="text-muted-foreground mr-1" />
            {[1, 2, 3, 4].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onSelect(n)}
                    className={clsx(
                        "h-5 w-5 rounded text-[11px] leading-none flex items-center justify-center",
                        current === n
                            ? "bg-primary text-white"
                            : "hover:bg-muted text-ink-soft"
                    )}
                >
                    {n}
                </button>
            ))}
            {isOverridden && (
                <button
                    type="button"
                    onClick={onReset}
                    title="Reset to default"
                    className="ml-1 h-5 px-1 rounded text-[10px] text-red-500 hover:bg-red-50"
                >
                    reset
                </button>
            )}
        </div>
    );
}