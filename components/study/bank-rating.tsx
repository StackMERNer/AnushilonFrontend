"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { useSubmitReview } from "@/hooks/use-submit-review";
import { formatInterval } from "@/lib/format-interval";
import { ICardState, Rating, RatingIntervals } from "@/types/study";
import RatingBar from "./rating-bar";
import { addRetry, currentHref, removeRetry } from "@/lib/bank-session";

export default function BankRating({
    questionId,
    card: initialCard,
    intervals: initialIntervals,
    canRate,
    suggested,
    questionNo
}: {
    questionId: string;
    card?: ICardState | null;
    intervals: RatingIntervals;
    canRate: boolean;
    suggested?: Rating;
    questionNo?: number
}) {
    const { mutate, isPending } = useSubmitReview();
    const [card, setCard] = useState<ICardState | null>(initialCard ?? null);
    const [intervals, setIntervals] = useState(initialIntervals);
    const [forceRate, setForceRate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isDue = !card || card.dueInMs <= 0;
    const showBar = isDue || forceRate;

    const rate = (r: Rating) => {
        setError(null);
        mutate(
            { questionId, rating: r },
            {
                onSuccess: (res) => {
                    setCard({
                        state: res.state,
                        interval: res.interval,
                        mastered: res.mastered,
                        dueInMs: res.dueInMs,
                    });
                    setIntervals(res.intervals);
                    setForceRate(false);
                    if (r === 1) addRetry({ id: questionId, href: currentHref(), no: questionNo });
                    else removeRetry(questionId);
                },
                onError: (e) => setError((e as Error).message),
            },
        );
    };

    return (
        <div className="mt-4 border-t border-line pt-3">
            {card && !showBar && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <CheckCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                        পরবর্তী রিভিউ{" "}
                        <b className="text-foreground">{formatInterval(card.dueInMs)}</b> পরে
                        {card.mastered && " · আয়ত্তে"}
                    </span>
                    <button
                        type="button"
                        onClick={() => setForceRate(true)}
                        className="text-xs font-semibold text-brand underline-offset-2 hover:underline"
                    >
                        আবার মূল্যায়ন করো
                    </button>
                </div>
            )}

            {showBar && canRate && (
                <>
                    <p className="mb-2 text-xs text-muted-foreground">
                        {!card
                            ? "মূল্যায়ন করলে প্রশ্নটি রিভিউতে যুক্ত হবে"
                            : isDue
                                ? "রিভিউ বাকি আছে — কেমন মনে আছে?"
                                : "কেমন মনে আছে?"}
                    </p>
                    <RatingBar
                        intervals={intervals}
                        onRate={rate}
                        disabled={isPending}
                        suggested={suggested}
                    />
                </>
            )}

            {showBar && !canRate && (
                <p className="text-xs text-muted-foreground">উত্তর দেখার পর মূল্যায়ন করতে পারবে</p>
            )}

            {error && <p className="mt-2 text-xs text-red">{error}</p>}
        </div>
    );
}