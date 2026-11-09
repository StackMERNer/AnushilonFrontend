"use client";

import { useState } from "react";
import clsx from "clsx";
import { toBnDigits } from "@/lib/helpers";
import RichTextRenderer from "./RichTextRenderer";
import { IFilterdQuestion } from "@/types/question";
import { QUESTION_TYPE_LABEL_MAP } from "@/lib/constants";
import { questionLevelMap } from "@/lib/question-paper";

const BN_LETTER_BASE = 2453; // ক

const AnswerBox = ({ html, label = "উত্তর" }: { html: string; label?: string }) => (
    <div className="mt-2 rounded-md  bg-green-50 dark:bg-green-950/30 p-3">
        <p className="mb-1 text-xs font-semibold text-green-700 dark:text-green-400">
            {label}
        </p>
        <RichTextRenderer content={html} />
    </div>
);

const ToggleButton = ({
    open,
    onClick,
    openLabel = "উত্তর লুকাও",
    closedLabel = "উত্তর দেখো",
}: {
    open: boolean;
    onClick: () => void;
    openLabel?: string;
    closedLabel?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        className="rounded-md border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
    >
        {open ? openLabel : closedLabel}
    </button>
);

const QuestionCard = ({
    question,
    questionNo,
    showQuestionLabel = true,
    showMcqAnswer = false,
}: {
    question: IFilterdQuestion;
    questionNo: number;
    showQuestionLabel?: boolean;
    /** When true, MCQ correct answer + solution are shown without clicking. */
    showMcqAnswer?: boolean;
}) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [openSubAnswers, setOpenSubAnswers] = useState<Record<number, boolean>>({});

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
        ? "grid-cols-1"
        : "grid-cols-2";

    const isMcq =
        (question.type === "mcq" || question.type === "mcq_english") &&
        question.options?.length > 0;
    const hasSubQuestions = (question.questions?.length ?? 0) > 0;

    const revealed = showMcqAnswer || selected !== null;
    const letter = (i: number) =>
        question.type === "mcq_english"
            ? String.fromCharCode(65 + i)
            : String.fromCharCode(BN_LETTER_BASE + i);

    const toggleSub = (i: number) =>
        setOpenSubAnswers((prev) => ({ ...prev, [i]: !prev[i] }));

    return (
        <div className="question-card relative p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 select-none transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
            {/* Question metadata */}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                {showQuestionLabel && (
                    <span className="rounded-full bg-blue-500 text-white px-2 py-1 font-medium">
                        {typeLabel}
                    </span>
                )}

                {question.level && (
                    <span className="rounded-md bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 px-2 py-1 font-medium">
                        {questionLevelMap[question.level] ?? question.level}
                    </span>
                )}

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
                                    <span key={`${source.name}-${source.year}-${index}`}>
                                        {index > 0 && <span className="mr-2">,</span>}
                                        <span>{source.name}</span>
                                        {source.year && (
                                            <>
                                                <span className="mx-0.5">:</span>
                                                <span>{toBnDigits(source.year)}</span>
                                            </>
                                        )}
                                    </span>
                                ))}]
                            </div>
                        )}
                    </div>

                    {/* MCQ options (click to answer) */}
                    {isMcq && (
                        <>
                            <ul className={clsx("grid gap-x-4 gap-y-2 pt-1", optionGridCols)}>
                                {question.options.map((opt: string, i: number) => {
                                    const isCorrect = question.correctMcq === i;
                                    const isWrongPick = selected === i && !isCorrect;

                                    return (
                                        <li key={i}>
                                            <button
                                                type="button"
                                                disabled={revealed}
                                                onClick={() => setSelected(i)}
                                                className={clsx(
                                                    "flex w-full items-start gap-2 rounded-lg border p-2 text-left wrap-break-word transition-colors",
                                                    !revealed &&
                                                    "border-transparent hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800",
                                                    revealed &&
                                                    isCorrect &&
                                                    "border-green-500 bg-green-50 dark:bg-green-950/30",
                                                    revealed &&
                                                    isWrongPick &&
                                                    "border-red-500 bg-red-50 dark:bg-red-950/30",
                                                    revealed &&
                                                    !isCorrect &&
                                                    !isWrongPick &&
                                                    "border-transparent opacity-60"
                                                )}
                                            >
                                                <span
                                                    className={clsx(
                                                        "flex items-start justify-center w-5 h-5 rounded-full border font-semibold shrink-0 transition-colors",
                                                        revealed && isCorrect
                                                            ? "bg-green-600 text-white border-green-600"
                                                            : revealed && isWrongPick
                                                                ? "bg-red-600 text-white border-red-600"
                                                                : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
                                                    )}
                                                >
                                                    {letter(i)}
                                                </span>

                                                <div
                                                    className={clsx(
                                                        "flex-1 min-w-0 text-slate-700 dark:text-slate-300",
                                                        revealed &&
                                                        isCorrect &&
                                                        "font-medium text-slate-900 dark:text-white"
                                                    )}
                                                >
                                                    <RichTextRenderer content={opt} />
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Result + retry (only when the user picked it themselves) */}
                            {selected !== null && !showMcqAnswer && (
                                <div className="flex items-center gap-3 pt-1 text-sm">
                                    {question.correctMcq != null && (
                                        <span
                                            className={clsx(
                                                "font-semibold",
                                                selected === question.correctMcq
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                            )}
                                        >
                                            {selected === question.correctMcq
                                                ? "সঠিক উত্তর!"
                                                : "ভুল উত্তর"}
                                        </span>
                                    )}
                                    {/* <button
                                        type="button"
                                        onClick={() => setSelected(null)}
                                        className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-800 dark:hover:text-slate-200"
                                    >
                                        আবার চেষ্টা করো
                                    </button> */}
                                </div>
                            )}

                            {/* Solution / explanation */}
                            {revealed && question.answer && (
                                <AnswerBox html={question.answer} label="সমাধান" />
                            )}
                        </>
                    )}

                    {/* CQ sub-questions with per-question answer toggle */}
                    {hasSubQuestions && (
                        <ul className="space-y-3">
                            {question.questions?.map((subQ, i: number) => (
                                <li
                                    key={i}
                                    className="wrap-break-word text-slate-700 dark:text-slate-300"
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full border shrink-0 border-gray-800 dark:border-gray-200">
                                            {String.fromCharCode(BN_LETTER_BASE + i)}
                                        </span>

                                        <div className="flex-1 min-w-0">
                                            <RichTextRenderer content={subQ.question} />

                                            {subQ.answer && (
                                                <div className="mt-2">
                                                    <ToggleButton
                                                        open={!!openSubAnswers[i]}
                                                        onClick={() => toggleSub(i)}
                                                    />
                                                </div>
                                            )}

                                            {openSubAnswers[i] && subQ.answer && (
                                                <AnswerBox html={subQ.answer} />
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Every other type: single show-answer button */}
                    {!isMcq && !hasSubQuestions && question.answer && (
                        <div>
                            <ToggleButton
                                open={showAnswer}
                                onClick={() => setShowAnswer((v) => !v)}
                            />
                            {showAnswer && <AnswerBox html={question.answer} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;