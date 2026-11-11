"use client";

import { QUESTION_TYPE_LABEL_MAP } from "@/lib/constants";
import { toBnDigits } from "@/lib/helpers";
import { questionLevelMap } from "@/lib/question-paper";
import { useMathTypeset } from "@/lib/typeset-math";
import { IFilterdQuestion } from "@/types/question";
import clsx from "clsx";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { ReactNode, useRef, useState } from "react";
import RichTextRenderer from "./RichTextRenderer";

const BN_LETTER_BASE = 2453; // ক
const bnLetter = (i: number) => String.fromCharCode(BN_LETTER_BASE + i);

/** Accepts both IFilterdQuestion (question bank) and IStudyQuestion (study). */
export type CardQuestion = Omit<IFilterdQuestion, "boards" | "schools" | "universities"> & {
    boards?: any[];
    schools?: any[];
    universities?: any[];
};

export interface StudyControl {
    revealed: boolean;
    selected: number | null;
    /** MCQ options can be tapped */
    selectable: boolean;
    onSelect: (i: number) => void;
}

interface Props {
    question: CardQuestion;
    questionNo?: number;
    showQuestionLabel?: boolean;
    /** Browse: show MCQ correct answer + solution without clicking */
    showMcqAnswer?: boolean;
    /** Defaults to true in study mode, false in browse */
    hideOptionLabels?: boolean;
    /** Extra pills in the meta row (e.g. "শিখছ") */
    badges?: ReactNode;
    /** Study mode: parent controls selection and reveal */
    study?: StudyControl;
}

/* ------------------------------ small pieces ------------------------------ */

const AnswerBox = ({ html, label = "উত্তর" }: { html: string; label?: string }) => (
    <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
        <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Check className="size-3.5" strokeWidth={3} />
            {label}
        </p>
        <RichTextRenderer content={html} />
    </div>
);

const AnswerToggle = ({ open, onClick }: { open: boolean; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        className={clsx(
            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-95",
            open
                ? "border-line bg-muted text-muted-foreground hover:text-foreground"
                : "border-brand/25 bg-brand-soft text-brand hover:border-brand/50 hover:bg-brand/10",
        )}
    >
        {open ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {open ? "উত্তর লুকাও" : "উত্তর দেখো"}
    </button>
);

type Source = { name: string; year?: number | null };
const buildSources = (q: CardQuestion): Source[] => {
    const out: Source[] = [];
    q.boards?.forEach((b) => {
        const name = b.board?.acronym || b.board?.name;
        if (name) out.push({ name, year: b.year });
    });
    q.schools?.forEach((s) => {
        const name = s.school?.name;
        if (name) out.push({ name, year: s.year });
    });
    q.universities?.forEach((u) => {
        const name = u.university?.name;
        if (name) out.push({ name, year: u.year });
    });
    return out;
};

/* --------------------------------- card ---------------------------------- */

const QuestionCard = ({
    question,
    questionNo,
    showQuestionLabel = true,
    showMcqAnswer = false,
    hideOptionLabels,
    badges,
    study,
}: Props) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [localSelected, setLocalSelected] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [openSub, setOpenSub] = useState<Record<number, boolean>>({});

    const isMcq =
        (question.type === "mcq" || question.type === "mcq_english") &&
        (question.options?.length ?? 0) > 0;
    const hasSub = (question.questions?.length ?? 0) > 0;
    const correctIdx = question.correctMcq ?? -1;

    // one set of derived values for both modes
    const selected = study ? study.selected : localSelected;
    const answered = study
        ? study.revealed || study.selected !== null
        : showMcqAnswer || localSelected !== null;
    const canPick = study ? study.selectable && study.selected === null : !answered;
    const onPick = study ? study.onSelect : setLocalSelected;
    const hideLabels = hideOptionLabels ?? !!study;

    // re-typeset math whenever new content appears (next question, reveal, toggles)
    useMathTypeset(rootRef);

    const typeLabel = QUESTION_TYPE_LABEL_MAP[question.type] ?? question.type;
    const sources = buildSources(question);
    const shownSources = study ? sources.slice(0, 3) : sources;
    const hiddenSources = sources.length - shownSources.length;

    const optionLetter = (i: number) =>
        question.type === "mcq_english" ? String.fromCharCode(65 + i) : bnLetter(i);
    const gridCols = (question.options ?? []).some((o) => (o ?? "").length > 20)
        ? "grid-cols-1"
        : "grid-cols-1 sm:grid-cols-2";

    const optionState = (i: number) => {
        if (!answered) return "idle";
        if (correctIdx >= 0) {
            if (i === correctIdx) return "correct";
            if (i === selected) return "wrong";
            return "dim";
        }
        return i === selected ? "picked" : "dim"; // no correct answer stored
    };

    const questionHtml =
        questionNo != null ? `${toBnDigits(questionNo)}. ${question.question}` : question.question;

    return (
        <div
            ref={rootRef}
            className={clsx(
                "question-card relative select-none rounded-2xl border border-line bg-card p-4 text-foreground shadow-sm transition-colors sm:p-5",
                !study && "hover:border-brand/30",
            )}
        >
            {/* meta */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
                {showQuestionLabel && (
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand">
                        {typeLabel}
                    </span>
                )}
                {question.level && (
                    <span className="rounded-full bg-gold/20 px-2.5 py-1 font-medium text-foreground">
                        {questionLevelMap[question.level] ?? question.level}
                    </span>
                )}
                {question.difficulty && (
                    <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                        {question.difficulty}
                    </span>
                )}
                {badges}
                {shownSources.map((s, i) => (
                    <span
                        key={`${s.name}-${s.year}-${i}`}
                        className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-1 font-semibold text-foreground"
                    >
                        {s.name}
                        {s.year ? ` : ${toBnDigits(s.year)}` : ""}
                    </span>
                ))}
                {hiddenSources > 0 && (
                    <span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                        +{toBnDigits(hiddenSources)}
                    </span>
                )}
            </div>

            {/* context + question */}
            {question.context && (
                <RichTextRenderer
                    content={question.context}
                    className="mb-3 rounded-xl bg-muted/60 p-3 wrap-break-word"
                />
            )}
            {question.question && (
                <RichTextRenderer
                    content={questionHtml}
                    className={clsx(
                        "wrap-break-word font-semibold leading-relaxed",
                        study ? "text-lg" : "pr-16",
                    )}
                />
            )}

            {/* MCQ */}
            {isMcq && (
                <>
                    <ul className={clsx("mt-4 grid gap-2", gridCols)}>
                        {question.options.map((opt: string, i: number) => {
                            const state = optionState(i);
                            return (
                                <li key={i}>
                                    <button
                                        type="button"
                                        disabled={!canPick}
                                        onClick={() => onPick(i)}
                                        className={clsx(
                                            "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-default",
                                            state === "idle" && "border-line bg-muted/40",
                                            state === "idle" &&
                                            canPick &&
                                            "hover:border-brand/40 hover:bg-brand-soft/60",
                                            state === "picked" && "border-brand bg-brand-soft",
                                            state === "correct" && "border-emerald-500 bg-emerald-500/10",
                                            state === "wrong" && "border-red-500 bg-red-500/10",
                                            state === "dim" && "border-transparent bg-muted/30 opacity-60",
                                        )}
                                    >
                                        {!hideLabels && (
                                            <span
                                                className={clsx(
                                                    "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                                                    state === "correct"
                                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                                        : state === "wrong"
                                                            ? "border-red-500 bg-red-500 text-white"
                                                            : "border-line bg-card text-muted-foreground",
                                                )}
                                            >
                                                {optionLetter(i)}
                                            </span>
                                        )}

                                        <div
                                            className={clsx(
                                                "min-w-0 flex-1 wrap-break-word",
                                                state === "correct" && "font-medium",
                                            )}
                                        >
                                            <RichTextRenderer content={opt} />
                                        </div>

                                        {state === "correct" && (
                                            <Check className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                                        )}
                                        {state === "wrong" && (
                                            <X className="size-5 shrink-0 text-red-500" strokeWidth={3} />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* browse: verdict after the student's own pick */}
                    {!study && localSelected !== null && !showMcqAnswer && correctIdx >= 0 && (
                        <p
                            className={clsx(
                                "mt-2 text-sm font-semibold",
                                localSelected === correctIdx
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-500",
                            )}
                        >
                            {localSelected === correctIdx ? "সঠিক উত্তর!" : "ভুল উত্তর"}
                        </p>
                    )}

                    {answered && question.answer && <AnswerBox html={question.answer} label="সমাধান" />}
                </>
            )}

            {/* CQ sub-questions */}
            {hasSub && (
                <ul className="mt-4 space-y-4">
                    {question.questions!.map((subQ, i) => {
                        const open = study ? study.revealed : !!openSub[i];
                        return (
                            <li key={i} className="wrap-break-word">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                                        {bnLetter(i)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <RichTextRenderer content={subQ.question} />

                                        {!study && subQ.answer && (
                                            <div className="mt-2">
                                                <AnswerToggle
                                                    open={!!openSub[i]}
                                                    onClick={() =>
                                                        setOpenSub((p) => ({ ...p, [i]: !p[i] }))
                                                    }
                                                />
                                            </div>
                                        )}
                                        {open && subQ.answer && <AnswerBox html={subQ.answer} />}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* everything else: one answer */}
            {!isMcq &&
                question.answer &&
                (study ? (
                    study.revealed && <AnswerBox html={question.answer} />
                ) : (
                    !hasSub && (
                        <div className="mt-3">
                            <AnswerToggle open={showAnswer} onClick={() => setShowAnswer((v) => !v)} />
                            {showAnswer && <AnswerBox html={question.answer} />}
                        </div>
                    )
                ))}
        </div>
    );
};

export default QuestionCard;