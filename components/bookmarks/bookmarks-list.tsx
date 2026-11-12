"use client";

import { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import { IFilterdQuestion } from "@/types/question";

export default function BookmarksList({
    items,
    startNo,
}: {
    items: IFilterdQuestion[];
    startNo: number;
}) {
    const [showAnswers, setShowAnswers] = useState(false);
    const hasMcq = items.some((q) => q.type === "mcq" || q.type === "mcq_english");

    return (
        <section className="space-y-3">
            {hasMcq && (
                <button
                    type="button"
                    onClick={() => setShowAnswers((v) => !v)}
                    aria-pressed={showAnswers}
                    className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all active:scale-95",
                        showAnswers
                            ? "border-line bg-muted text-muted-foreground hover:text-foreground"
                            : "border-brand/25 bg-brand-soft text-brand hover:border-brand/50 hover:bg-brand/10",
                    )}
                >
                    {showAnswers ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    {showAnswers ? "MCQ-র উত্তর লুকাও" : "MCQ-র উত্তর দেখো"}
                </button>
            )}

            <ul className="space-y-3">
                {items.map((q, i) => (
                    <li key={q._id}>
                        <QuestionCard question={q} questionNo={startNo + i} showMcqAnswer={showAnswers} />
                    </li>
                ))}
            </ul>
        </section>
    );
}