"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { QUESTION_TYPE_LABEL_MAP } from "@/lib/constants";
import { toBnDigits } from "@/lib/helpers";
import type { IChapterProgress, ITypeProgress } from "@/types/study";

/* merge types that share a label (gap_filling + ssc_gap_filling) */
interface Group {
    label: string;
    types: string[];
    total: number;
    studied: number;
    mastered: number;
}

function groupTypes(rows: ITypeProgress[]): Group[] {
    const map = new Map<string, Group>();
    for (const r of rows) {
        const label = QUESTION_TYPE_LABEL_MAP[r.type] ?? r.type;
        const g = map.get(label) ?? { label, types: [], total: 0, studied: 0, mastered: 0 };
        g.types.push(r.type);
        g.total += r.total;
        g.studied += r.studied;
        g.mastered += r.mastered;
        map.set(label, g);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
}

const fresh = (g: { total: number; studied: number }) => g.total - g.studied;

export default function BankChapterCard({
    chapter: r,
    subjectId,
}: {
    chapter: IChapterProgress;
    subjectId: string;
}) {
    const groups = useMemo(() => groupTypes(r.types), [r.types]);

    // Default: the MCQ group if present, otherwise the largest group
    const [selected, setSelected] = useState<string | undefined>(() => {
        const mcq = groups.find((g) => g.types.some((t) => t.toLowerCase() === "mcq"));
        return (mcq ?? groups[0])?.label;
    });

    const selectedGroup = groups.find((g) => g.label === selected);

    // A merged group sends all its types, comma-separated (see note below)
    const href =
        `/question-bank/questions/${subjectId}?chapter=${r.chapterId}` +
        (selectedGroup
            ? `&type=${encodeURIComponent(selectedGroup.types.join(","))}`
            : "");

    const studiedPct = r.total ? (r.studied / r.total) * 100 : 0;
    const masteredPct = r.total ? (r.mastered / r.total) * 100 : 0;
    const learning = r.studied - r.mastered;

    return (
        <div className="flex flex-col rounded-2xl border border-line bg-card p-4">
            {/* header */}
            <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">{r.name}</h3>
                <span className="text-sm text-muted-foreground">
                    {toBnDigits(Math.round(studiedPct))}%
                </span>
            </div>

            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="absolute h-full bg-brand-light/50"
                    style={{ width: `${studiedPct}%` }}
                />
                <div
                    className="absolute h-full bg-emerald-500"
                    style={{ width: `${masteredPct}%` }}
                />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
                মোট {toBnDigits(r.total)} · আয়ত্তে {toBnDigits(r.mastered)} · শিখছ{" "}
                {toBnDigits(learning)} · নতুন {toBnDigits(r.total - r.studied)}
            </p>

            {/* type picker */}
            {groups.length > 0 && (
                <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                        প্রশ্নের ধরন
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {groups.map((g) => {
                            const on = g.label === selected;
                            return (
                                <button
                                    key={g.label}
                                    type="button"
                                    onClick={() => setSelected(g.label)}
                                    aria-pressed={on}
                                    className={clsx(
                                        "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                                        on
                                            ? "border-brand bg-brand text-white"
                                            : "border-line bg-card text-foreground hover:border-brand/40",
                                    )}
                                >
                                    {g.label}
                                    <span
                                        className={clsx(
                                            "ml-1.5 text-xs",
                                            on ? "text-white/80" : "text-muted-foreground",
                                        )}
                                    >
                                        {toBnDigits(g.total)}টি
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* action */}
            <Link
                href={href}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-brand-dark shadow-[0_3px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-0.5 active:shadow-none"
            >
                এগিয়ে যাও
            </Link>

            {/* per-type breakdown */}
            {groups.length > 0 && (
                <details className="group mt-3 border-t border-line pt-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                        টাইপ ভিত্তিক প্রোগ্রেস দেখো
                        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>

                    <ul className="mt-3 space-y-3">
                        {groups.map((g) => {
                            const pct = (n: number) => (g.total ? (n / g.total) * 100 : 0);
                            const lrn = g.studied - g.mastered;
                            return (
                                <li key={g.label}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-foreground">{g.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {toBnDigits(g.total)}টি
                                        </span>
                                    </div>
                                    <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${pct(g.mastered)}%` }}
                                        />
                                        <div
                                            className="h-full bg-brand-light/50"
                                            style={{ width: `${pct(lrn)}%` }}
                                        />
                                    </div>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                            আয়ত্তে {toBnDigits(g.mastered)}
                                        </span>{" "}
                                        · শিখছ {toBnDigits(lrn)} · নতুন {toBnDigits(fresh(g))}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </details>
            )}
        </div>
    );
}