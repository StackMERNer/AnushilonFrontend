"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { Check, Flag, X } from "lucide-react";
import { apiClient } from "@/lib/api/api-client";
import { createQuestionFeedbackService } from "@/services/question-feedback.service";
import { REPORT_REASONS } from "@/lib/report-reasons";
import { toBnDigits } from "@/lib/helpers";

const service = createQuestionFeedbackService(apiClient);
const MAX = 500;

export default function ReportQuestionModal({
    questionId,
    onClose,
}: {
    questionId: string;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const [reasons, setReasons] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        ref.current?.showModal();
    }, []);

    const close = () => ref.current?.close(); // fires onClose below

    const m = useMutation({
        mutationFn: service.reportQuestion,
        onSuccess: () => setDone(true),
    });

    const needsMessage = reasons.includes("other");
    const valid = reasons.length > 0 && (!needsMessage || message.trim().length >= 3);

    const toggle = (key: string) =>
        setReasons((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

    const submit = () => {
        if (!valid || m.isPending) return;
        m.mutate({ questionId, reasons, message: message.trim() || undefined });
    };

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === e.currentTarget) close(); // backdrop click
            }}
            className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md select-text overflow-y-auto rounded-3xl border border-line bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
        >
            <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="grid size-9 place-items-center rounded-full bg-red-tint text-red">
                            <Flag className="size-4.5" />
                        </span>
                        <div>
                            <h2 className="font-display text-lg font-bold leading-tight">
                                প্রশ্নে সমস্যা জানাও
                            </h2>
                            <p className="text-xs text-muted-foreground">তোমার রিপোর্ট আমাদের প্রশ্ন ঠিক করতে সাহায্য করে</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="বন্ধ করো"
                        className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {done ? (
                    <div className="py-8 text-center">
                        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <Check className="size-7" strokeWidth={3} />
                        </span>
                        <p className="mt-3 font-semibold">ধন্যবাদ! রিপোর্ট পাঠানো হয়েছে</p>
                        <p className="mt-1 text-sm text-muted-foreground">আমরা শীঘ্রই প্রশ্নটি যাচাই করব।</p>
                        <button
                            type="button"
                            onClick={close}
                            className="mt-5 rounded-xl border border-line bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-accent"
                        >
                            বন্ধ করো
                        </button>
                    </div>
                ) : (
                    <>
                        <fieldset className="mt-5">
                            <legend className="mb-2 text-xs font-semibold text-muted-foreground">
                                কী সমস্যা? (একাধিক বেছে নিতে পারো)
                            </legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {REPORT_REASONS.map((r) => {
                                    const on = reasons.includes(r.key);
                                    return (
                                        <label
                                            key={r.key}
                                            className={clsx(
                                                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40",
                                                on ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40",
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={on}
                                                onChange={() => toggle(r.key)}
                                            />
                                            <span
                                                className={clsx(
                                                    "grid size-5 shrink-0 place-items-center rounded-md border",
                                                    on ? "border-brand bg-brand text-white" : "border-line bg-card",
                                                )}
                                            >
                                                {on && <Check className="size-3.5" strokeWidth={3} />}
                                            </span>
                                            {r.label}
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <div className="mt-4">
                            <label htmlFor="report-message" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                                {needsMessage ? "সমস্যাটি লেখো" : "আরও কিছু বলতে চাইলে লেখো (ঐচ্ছিক)"}
                            </label>
                            <textarea
                                id="report-message"
                                value={message}
                                maxLength={MAX}
                                rows={3}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="যেমন: সঠিক উত্তর হবে (খ)..."
                                className="w-full resize-none rounded-xl border border-line bg-muted/40 p-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                            <p className="mt-1 text-right text-[11px] text-muted-foreground">
                                {toBnDigits(message.length)}/{toBnDigits(MAX)}
                            </p>
                        </div>

                        {m.isError && (
                            <p className="mt-2 rounded-lg bg-red-tint px-3 py-2 text-sm text-red">
                                {(m.error as Error).message}
                            </p>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={close}
                                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold transition hover:bg-accent"
                            >
                                বাতিল
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={!valid || m.isPending}
                                className="rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-brand-dark shadow-[0_3px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-40"
                            >
                                {m.isPending ? "পাঠানো হচ্ছে…" : "রিপোর্ট পাঠাও"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </dialog>
    );
}