import { toBnDigits } from "@/lib/helpers";
import RichTextRenderer from "./RichTextRenderer";
import { IFilterdQuestion } from "@/types/question";
import { QUESTION_TYPE_LABEL_MAP } from "@/lib/constants";
import clsx from "clsx";
import { questionLevelMap } from "@/lib/question-paper";

const QuestionCard = ({
    question,
    questionNo,
    showQuestionLabel = true,
}: {
    question: IFilterdQuestion;
    questionNo: number;
    showQuestionLabel?: boolean;
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
            className="question-card relative p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 cursor-pointer select-none transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700"
        >
            {/* Question metadata */}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                {showQuestionLabel && (
                    <span className="rounded-full bg-blue-500 text-white px-2 py-1 font-medium">
                        {typeLabel}
                    </span>
                )}

                {/* Level */}
                {question.level && (
                    <span className="rounded-md bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 px-2 py-1 font-medium">
                        {questionLevelMap[question.level] ?? question.level}
                    </span>
                )}

                {/* Difficulty */}
                {question.difficulty && (
                    <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-1 text-amber-800 dark:text-amber-300 font-medium">
                        {question.difficulty}
                    </span>
                )}
            </div>

            <div className="flex items-start gap-3">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
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

                    {/* Question sources */}
                    <div className="w-full flex justify-end">
                        {sources.length > 0 && (
                            <div className="font-semibold items-center bg-yellow-300 dark:bg-yellow-500/20 text-slate-900 dark:text-yellow-300 border border-yellow-400/30 p-1 rounded-full text-xs">
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
                                                <span>
                                                    {toBnDigits(source.year)}
                                                </span>
                                            </>
                                        )}
                                    </span>
                                ))}]
                            </div>
                        )}
                    </div>

                    {/* MCQ options */}
                    {question.type === "mcq" &&
                        question.options?.length > 0 && (
                            <ul className={clsx("grid gap-x-4 gap-y-2 pl-1 pt-1", optionGridCols)}>
                                {question.options.map(
                                    (opt: string, i: number) => {
                                        const isCorrect =
                                            question.correctMcq === i;

                                        return (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-slate-700 dark:text-slate-300 wrap-break-word"
                                            >
                                                <span
                                                    className={clsx(
                                                        "flex items-start justify-center w-5 h-5 rounded-full border font-semibold shrink-0 transition-colors",
                                                        isCorrect
                                                            ? "bg-black dark:bg-white text-white dark:text-slate-900 border-black dark:border-white"
                                                            : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
                                                    )}
                                                >
                                                    {String.fromCharCode(
                                                        2453 + i
                                                    )}
                                                </span>

                                                <div
                                                    className={clsx(
                                                        "flex-1",
                                                        isCorrect
                                                            ? "font-medium text-slate-900 dark:text-white"
                                                            : ""
                                                    )}
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
                                            className="flex items-start gap-2 wrap-break-word mt-1 text-slate-700 dark:text-slate-300"
                                        >
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full border shrink-0 border-gray-800 dark:border-gray-200">
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
        </div>
    );
};

export default QuestionCard;