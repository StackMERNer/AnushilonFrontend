import { toBnDigits } from "@/lib/helpers";
import RichTextRenderer from "./RichTextRenderer";
import { IFilterdQuestion } from "@/types/question";
import { Check, Loader2 } from "lucide-react";
import { QUESTION_TYPE_LABEL_MAP } from "@/lib/constants";
import clsx from "clsx";
import { questionLevelMap } from "@/lib/question-paper";

const QuestionCard = ({
    question,
    questionNo,
    isSelected,
    isPending,
    toggleSelect,
}: {
    question: IFilterdQuestion;
    questionNo: number;
    isSelected: boolean;
    isPending: boolean;
    toggleSelect: (id: string) => void;
}) => {
    const typeLabel = QUESTION_TYPE_LABEL_MAP[question.type] ?? question.type;
    const sources = [
        ...(question.boards ?? []).map((board) => ({
            name: board.board.acronym || board.board.name,
            year: board.year,
        })),
        ...(question.schools ?? []).map((school) => ({
            name: school.school.name,
            year: school.year,
        })),
    ];
    const optionGridCols = question.options.some((opt) => (opt ?? "").length > 20)
        ? "grid-cols-1" : "grid-cols-2";
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSelect(question._id)}
            onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                toggleSelect(question._id)
            }
            className={`question-card relative p-5 rounded-lg border bg-white cursor-pointer select-none transition-all duration-200 ${isSelected
                ? "border-primary ring-2 ring-primary/20 shadow-sm"
                : "border-slate-200 hover:border-slate-300"
                }`}
        >

            {/* Question metadata */}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">


                <span className="rounded-md bg-neutral-100 text-neutral-700 px-2 py-1">
                    {typeLabel}
                </span>
                {/* Question sources */}
                {sources.length > 0 && (
                    <div className="font-semibold items-center bg-yellow-300 p-1 rounded-md">
                        [{sources.map((source, index) => (
                            <span
                                key={`${source.name}-${source.year}-${index}`}

                            >
                                {index > 0 && (
                                    <span className="mr-2">,</span>
                                )}

                                <span>
                                    {source.name}
                                </span>

                                {source.year && (
                                    <>
                                        <span className="mx-0.5">:</span>
                                        <span className="">
                                            {toBnDigits(source.year)}
                                        </span>
                                    </>
                                )}
                            </span>
                        ))}]
                    </div>
                )}
                {/* Level */}
                {question.level && (
                    <span className="rounded-md bg-yellow-100 text-yellow-700 px-2 py-1">
                        {questionLevelMap[question.level] ?? question.level}
                    </span>
                )}

                {/* Difficulty */}
                {/* {question.difficulty && (
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">
                        {question.difficulty}
                    </span>
                )} */}
            </div>

            <div className="flex items-start gap-3">
                <p className="font-semibold text-slate-700">
                    {toBnDigits(questionNo)}.
                </p>

                <div className="space-y-2 flex-1 min-w-0">
                    {question.context && (
                        <RichTextRenderer
                            content={question.context}
                            className="font-semibold wrap-break-word pr-16"
                        />
                    )}

                    {question.question && (
                        <RichTextRenderer
                            content={question.question}
                            className="font-semibold wrap-break-word pr-16"
                        />
                    )}



                    {/* MCQ options */}
                    {question.type === "mcq" &&
                        question.options?.length > 0 && (
                            <ul className={clsx("grid  gap-x-4 gap-y-2 pl-1 pt-1", optionGridCols)}>
                                {question.options.map(
                                    (opt: string, i: number) => {
                                        const isCorrect =
                                            question.correctMcq === i;

                                        return (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-slate-700 wrap-break-word"
                                            >
                                                <span
                                                    className={`flex items-start justify-center w-5 h-5 rounded-full border font-semibold shrink-0 transition-colors ${isCorrect
                                                        ? "bg-black text-white border-black"
                                                        : "border-slate-300 text-slate-600 bg-slate-50"
                                                        }`}
                                                >
                                                    {String.fromCharCode(
                                                        2453 + i
                                                    )}
                                                </span>

                                                <div
                                                    className={`flex-1 ${isCorrect
                                                        ? "font-medium text-slate-900"
                                                        : ""
                                                        }`}
                                                >
                                                    <RichTextRenderer
                                                        content={opt}
                                                    />
                                                </div>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        )}

                    {/* CQ sub-questions */}
                    {question.type === "cq" &&
                        (question.questions?.length ?? 0) > 0 && (
                            <ul>
                                {question.questions?.map(
                                    (subQ, i: number) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 wrap-break-word mt-1"
                                        >
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full border shrink-0 border-gray-800">
                                                {String.fromCharCode(
                                                    2453 + i
                                                )}
                                            </span>

                                            <div className="flex-1">
                                                <RichTextRenderer
                                                    content={subQ.question}
                                                />
                                            </div>
                                        </li>
                                    )
                                )}
                            </ul>
                        )}
                </div>
            </div>

            {/* Selection status */}
            <div className="absolute right-3 bottom-1">
                {isPending ? (
                    <span className="inline-flex items-center gap-1 px-1 py-1 rounded-full bg-slate-100 text-slate-600 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    </span>
                ) : isSelected ? (
                    <span className="inline-flex items-center gap-1 font-medium px-1 py-1 rounded-full bg-primary text-white transition-all scale-100">
                        <Check className="w-3.5 h-3.5 stroke-3" />
                    </span>
                ) : null}
            </div>
        </div>
    );
};

export default QuestionCard;