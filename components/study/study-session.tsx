"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsMutating } from "@tanstack/react-query";
import { IStudyItem, Rating } from "@/types/study";
import { useSubmitReview } from "@/hooks/use-submit-review";
import RichTextRenderer from "../RichTextRenderer";
import { QUESTION_TYPE_LABEL_MAP } from "@/lib/constants";
import { toBnDigits } from "@/lib/helpers";

const AUTO_KEY = "srs:autoRateMcq";
const BN_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ"];
const EN_LETTERS = ["A", "B", "C", "D", "E", "F"];

const RATINGS: { value: Rating; label: string; cls: string }[] = [
    { value: 1, label: "আবার", cls: "bg-red-600 hover:bg-red-700" },
    { value: 2, label: "কঠিন", cls: "bg-orange-500 hover:bg-orange-600" },
    { value: 3, label: "ভালো", cls: "bg-green-600 hover:bg-green-700" },
    { value: 4, label: "সহজ", cls: "bg-blue-600 hover:bg-blue-700" },
];

interface Props {
    items: IStudyItem[];
    totalDue: number;
    homeHref?: string;
}

export default function StudySession({ items, totalDue, homeHref = "/" }: Props) {
    const router = useRouter();
    const pending = useIsMutating();
    const { mutate } = useSubmitReview();

    const [queue, setQueue] = useState(items);
    const [revealed, setRevealed] = useState(false);
    const [picked, setPicked] = useState<number | null>(null);
    const [autoRate, setAutoRate] = useState(true);
    const [againCount, setAgainCount] = useState(0);
    const [saveFailed, setSaveFailed] = useState(false);
    const shownAt = useRef(0);

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
        try {
            const v = localStorage.getItem(AUTO_KEY);
            if (v !== null) setAutoRate(v === "1");
        } catch { }
    }, []);

    useEffect(() => {
        shownAt.current = Date.now();
    }, [current?.question._id]);

    const toggleAuto = (v: boolean) => {
        setAutoRate(v);
        try {
            localStorage.setItem(AUTO_KEY, v ? "1" : "0");
        } catch { }
    };

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
    keyHandler.current = (e) => {
        if (!current) return;
        const confirm = e.key === " " || e.key === "Enter";
        const num = Number(e.key);

        if (!revealed) {
            if (isAuto && num >= 1 && num <= (q.options?.length ?? 0)) pick(num - 1);
            else if (!isAuto && confirm) {
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
    useEffect(() => {
        const f = (e: KeyboardEvent) => keyHandler.current(e);
        window.addEventListener("keydown", f);
        return () => window.removeEventListener("keydown", f);
    }, []);

    // ---- empty / finished ----
    if (total === 0) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-lg font-medium">এখন রিভিউ করার মতো কোনো প্রশ্ন নেই 🎉</p>
                <Link href={homeHref} className="mt-6 inline-block rounded-xl bg-gray-900 px-5 py-2.5 text-white">
                    ফিরে যাও
                </Link>
            </div>
        );
    }

    if (!current) {
        const more = totalDue > total;
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-xl font-semibold">দারুণ! সেশন শেষ ✅</p>
                <p className="mt-2 text-gray-600">
                    {toBnDigits(total)}টি প্রশ্ন রিভিউ হয়েছে
                    {againCount > 0 && `, ${toBnDigits(againCount)}বার "আবার" দিয়েছ`}
                </p>
                {saveFailed && <p className="mt-3 text-sm text-red-600">কিছু রিভিউ সেভ হয়নি। ইন্টারনেট চেক করো।</p>}
                <div className="mt-6 flex justify-center gap-3">
                    {more && (
                        <button
                            disabled={pending > 0}
                            onClick={() => router.refresh()}
                            className="rounded-xl bg-green-600 px-5 py-2.5 text-white disabled:opacity-50"
                        >
                            আরও রিভিউ করো ({toBnDigits(totalDue - total)})
                        </button>
                    )}
                    <Link href={homeHref} className="rounded-xl border px-5 py-2.5">
                        ফিরে যাও
                    </Link>
                </div>
            </div>
        );
    }

    // ---- card ----
    const letters = q.type === "mcq_english" ? EN_LETTERS : BN_LETTERS;
    const tags = [
        ...(q.boards ?? []).map(
            (b) => `${b.board?.name ?? ""} ${toBnDigits(b.year)}`
        ),
        ...(q.schools ?? []).map(
            (s) => `${s.school?.name ?? ""}${s.year ? ` ${toBnDigits(s.year)}` : ""}`
        ),
        ...(q.universities ?? []).map(
            (u) => `${u.university?.name ?? ""}${u.year ? ` ${toBnDigits(u.year)}` : ""}`
        ),
    ].slice(0, 4);

    return (
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">
                    {toBnDigits(done)} / {toBnDigits(total)}
                </span>
                <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                    <input type="checkbox" checked={autoRate} onChange={(e) => toggleAuto(e.target.checked)} />
                    MCQ নিজে থেকে মূল্যায়ন
                </label>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(done / total) * 100}%` }}
                />
            </div>

            {saveFailed && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    কিছু রিভিউ সেভ হয়নি। ইন্টারনেট চেক করো।
                </p>
            )}

            <article className="rounded-2xl border p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1">
                        {QUESTION_TYPE_LABEL_MAP[q.type] ?? q.type}
                    </span>
                    {current.card.state === "learning" && (
                        <span className="rounded-full bg-amber-50 dark:bg-amber-800 px-2.5 py-1 text-amber-700">শিখছ</span>
                    )}
                    {tags.map((t) => (
                        <span key={t} className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                            {t}
                        </span>
                    ))}
                </div>

                {q.context && <RichTextRenderer content={q.context} className="mb-3 rounded-lg bg-gray-50 p-3" />}
                <RichTextRenderer content={q.question} className="text-lg leading-relaxed" />

                {/* options */}
                {!!q.options?.length && (
                    <ul className="mt-4 space-y-2">
                        {q.options.map((opt, i) => {
                            const state =
                                picked === null
                                    ? ""
                                    : i === correct
                                        ? "border-green-500 bg-green-50"
                                        : i === picked
                                            ? "border-red-500 bg-red-50"
                                            : "opacity-60";
                            return (
                                <li key={i}>
                                    <button
                                        type="button"
                                        disabled={!isAuto || picked !== null}
                                        onClick={() => pick(i)}
                                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${state} ${isAuto && picked === null ? "hover:bg-neutral-50 dark:hover:bg-neutral-800" : ""
                                            }`}
                                    >
                                        <span className="font-medium">{letters[i]}.</span>
                                        <RichTextRenderer content={opt} />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* CQ-style sub questions */}
                {!!q.questions?.length && (
                    <ol className="mt-4 space-y-4">
                        {q.questions.map((sq, i) => (
                            <li key={i}>
                                <div className="flex gap-2">
                                    <span className="font-medium">{BN_LETTERS[i]}.</span>
                                    <RichTextRenderer content={sq.question} />
                                </div>
                                {revealed && (
                                    <RichTextRenderer
                                        content={sq.answer}
                                        className="mt-2 rounded-lg border-l-4 border-green-500 bg-green-50 p-3"
                                    />
                                )}
                            </li>
                        ))}
                    </ol>
                )}

                {/* general answer / explanation */}
                {revealed && q.answer && (
                    <RichTextRenderer
                        content={q.answer}
                        className="mt-4 rounded-lg border-l-4 border-green-500 bg-green-50 p-3"
                    />
                )}

                {/* actions */}
                <div className="mt-6">
                    {!revealed && !isAuto && (
                        <button
                            onClick={() => setRevealed(true)}
                            className="w-full rounded-xl bg-gray-900 py-3 text-white"
                        >
                            উত্তর দেখো
                        </button>
                    )}
                    {revealed && useAuto && (
                        <button
                            onClick={() => advance(autoRating)}
                            className="w-full rounded-xl bg-gray-900 py-3 text-white"
                        >
                            {picked === correct ? "সঠিক! পরবর্তী" : "ভুল হয়েছে — পরবর্তী"}
                        </button>
                    )}
                    {revealed && !useAuto && (
                        <div className="grid grid-cols-4 gap-2">
                            {RATINGS.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => rate(r.value)}
                                    className={`rounded-xl py-3 text-white ${r.cls}`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
}