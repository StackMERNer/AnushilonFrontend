"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsMutating } from "@tanstack/react-query";
import { IStudyItem, Rating } from "@/types/study";
import { useSubmitReview } from "@/hooks/use-submit-review";
import { toBnDigits } from "@/lib/helpers";
import QuestionCard from "@/components/QuestionCard";

const PRIMARY_BTN =
    "inline-flex items-center justify-center rounded-2xl bg-gold px-6 py-3.5 font-bold text-brand-dark shadow-[0_4px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-50";
const SECONDARY_BTN =
    "inline-flex items-center justify-center rounded-2xl border border-line bg-card px-6 py-3.5 font-semibold text-foreground transition hover:bg-accent";

const RATINGS: { value: Rating; label: string; cls: string }[] = [
    { value: 1, label: "আবার", cls: "bg-red-500" },
    { value: 2, label: "কঠিন", cls: "bg-orange-500" },
    { value: 3, label: "ভালো", cls: "bg-emerald-500" },
    { value: 4, label: "সহজ", cls: "bg-brand" },
];
const AUTO_KEY = "srs:autoRateMcq";

// ---- localStorage-backed "auto rate" preference (external store) ----
const autoListeners = new Set<() => void>();

function subscribeAuto(cb: () => void) {
    autoListeners.add(cb);
    window.addEventListener("storage", cb);
    return () => {
        autoListeners.delete(cb);
        window.removeEventListener("storage", cb);
    };
}

function getAutoSnapshot(): boolean {
    try {
        const v = localStorage.getItem(AUTO_KEY);
        return v === null ? true : v === "1";
    } catch {
        return true;
    }
}

const getAutoServerSnapshot = () => true;

function setAutoPref(v: boolean) {
    try {
        localStorage.setItem(AUTO_KEY, v ? "1" : "0");
    } catch { }
    autoListeners.forEach((l) => l());
}

interface Props {
    items: IStudyItem[];
    totalDue: number;
    homeHref?: string;
}

export default function StudySession({ items, totalDue, homeHref = "/dashboard" }: Props) {
    const router = useRouter();
    const pending = useIsMutating();
    const { mutate } = useSubmitReview();

    const [queue, setQueue] = useState(items);
    const [revealed, setRevealed] = useState(false);
    const [picked, setPicked] = useState<number | null>(null);
    const [againCount, setAgainCount] = useState(0);
    const [saveFailed, setSaveFailed] = useState(false);
    const shownAt = useRef(0);

    const autoRate = useSyncExternalStore(subscribeAuto, getAutoSnapshot, getAutoServerSnapshot);

    const total = items.length;
    const current = queue[0];
    const q = current?.question;
    const remainingUnique = new Set(queue.map((i) => i.question._id)).size;
    const done = total - remainingUnique;

    const isAuto = q?.studyMode === "auto";
    const useAuto = isAuto && autoRate;
    const correct = q?.correctMcq ?? -1;
    const autoRating: Rating = picked === correct ? 3 : 1;

    useEffect(() => {
        shownAt.current = Date.now();
    }, [current?.question._id]);

    const toggleAuto = (v: boolean) => setAutoPref(v);

    const submit = (rating: Rating, auto: boolean) => {
        if (!current) return;
        mutate(
            {
                questionId: current.question._id,
                rating,
                auto,
                timeTakenMs: Date.now() - shownAt.current,
            },
            { onError: () => setSaveFailed(true) },
        );
    };

    const advance = (rating: Rating) => {
        if (rating === 1) setAgainCount((c) => c + 1);
        setQueue((prev) => {
            const [head, ...rest] = prev;
            if (rating === 1) rest.splice(Math.min(3, rest.length), 0, head);
            return rest;
        });
        setRevealed(false);
        setPicked(null);
    };

    const rate = (r: Rating) => {
        submit(r, false);
        advance(r);
    };

    const pick = (i: number) => {
        if (!isAuto || picked !== null) return;
        setPicked(i);
        setRevealed(true);
        if (useAuto) submit(i === correct ? 3 : 1, true);
    };

    // keyboard shortcuts (handler kept in a ref so it always sees fresh state)
    const keyHandler = useRef<(e: KeyboardEvent) => void>(() => { });

    // runs after every render, so the ref always holds the latest closure
    useEffect(() => {
        keyHandler.current = (e) => {
            if (!current) return;
            const confirm = e.key === " " || e.key === "Enter";
            const num = Number(e.key);

            if (!revealed) {
                if (isAuto && num >= 1 && num <= (q?.options?.length ?? 0)) pick(num - 1);
                else if (!useAuto && confirm) {
                    e.preventDefault();
                    setRevealed(true);
                }
                return;
            }
            if (useAuto) {
                if (confirm) {
                    e.preventDefault();
                    advance(autoRating);
                }
            } else if (num >= 1 && num <= 4) rate(num as Rating);
        };
    });

    useEffect(() => {
        const f = (e: KeyboardEvent) => keyHandler.current(e);
        window.addEventListener("keydown", f);
        return () => window.removeEventListener("keydown", f);
    }, []);
    // ---- empty / finished ----
    if (total === 0) {
        return (
            <div className="mx-auto max-w-md px-4 py-16">
                <div className="rounded-3xl border border-line bg-card p-8 text-center shadow-sm">
                    <p className="text-lg font-semibold text-foreground">
                        এখন রিভিউ করার মতো কোনো প্রশ্ন নেই 🎉
                    </p>
                    <Link href={homeHref} className={`${PRIMARY_BTN} mt-6`}>
                        নতুন প্রশ্ন অনুশীলন করো
                    </Link>
                </div>
            </div>
        );
    }

    if (!current) {
        const more = totalDue > total;
        return (
            <div className="mx-auto max-w-md px-4 py-16">
                <div className="rounded-3xl border border-line bg-card p-8 text-center shadow-sm">
                    <p className="font-display text-2xl font-bold text-foreground">দারুণ! সেশন শেষ!🎉</p>
                    <p className="mt-2 text-muted-foreground">
                        {toBnDigits(total)}টি প্রশ্ন রিভিউ হয়েছে
                        {againCount > 0 && `, ${toBnDigits(againCount)}বার "আবার" দিয়েছ`}
                    </p>
                    {saveFailed && (
                        <p className="mt-3 text-sm text-red">কিছু রিভিউ সেভ হয়নি। ইন্টারনেট চেক করো।</p>
                    )}
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {more && (
                            <button
                                disabled={pending > 0}
                                onClick={() => router.refresh()}
                                className={PRIMARY_BTN}
                            >
                                আরও রিভিউ করো ({toBnDigits(totalDue - total)})
                            </button>
                        )}
                        <Link href={homeHref} className={SECONDARY_BTN}>
                            নতুন প্রশ্ন অনুশীলন শুরু করো
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---- card ----
    return (
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
            <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">
                    {toBnDigits(done)} / {toBnDigits(total)}
                </span>

                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={autoRate}
                        onChange={(e) => toggleAuto(e.target.checked)}
                    />
                    <span className="relative h-5 w-9 shrink-0 rounded-full bg-muted transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40" />
                    MCQ নিজে থেকে মূল্যায়ন
                </label>
            </div>

            <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-linear-to-r from-gold to-brand-light transition-all duration-500"
                    style={{ width: `${(done / total) * 100}%` }}
                />
            </div>

            {saveFailed && (
                <p className="mb-3 rounded-xl bg-red-tint px-3 py-2 text-sm text-red">
                    কিছু রিভিউ সেভ হয়নি। ইন্টারনেট চেক করো।
                </p>
            )}

            <QuestionCard
                key={q._id}
                question={q}
                badges={
                    current.card.state === "learning" && (
                        <span className="rounded-full bg-gold/20 px-2.5 py-1 font-medium text-foreground">
                            শিখছ
                        </span>
                    )
                }
                study={{ revealed, selected: picked, selectable: isAuto, onSelect: pick }}
            />

            {/* actions */}
            <div className="mt-4">
                {!revealed && !useAuto && (
                    <button onClick={() => setRevealed(true)} className={`${PRIMARY_BTN} w-full`}>
                        উত্তর দেখো
                    </button>
                )}

                {revealed && useAuto && (
                    <button onClick={() => advance(autoRating)} className={`${PRIMARY_BTN} w-full`}>
                        {picked === correct ? "সঠিক! পরবর্তী" : "ভুল হয়েছে — পরবর্তী"}
                    </button>
                )}

                {revealed && !useAuto && (
                    <div className="grid grid-cols-4 gap-2">
                        {RATINGS.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => rate(r.value)}
                                className={`flex flex-col items-center gap-0.5 rounded-2xl py-3 font-bold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-0.5 active:shadow-none ${r.cls}`}
                            >
                                <span>{r.label}</span>
                                <span className="hidden text-[10px] font-medium opacity-80 sm:block">
                                    {toBnDigits(r.value)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}