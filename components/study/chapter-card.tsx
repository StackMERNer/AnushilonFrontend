"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDown, Play } from "lucide-react";
import { startNewCardsAction } from "@/app/actions/study";
import { QUESTION_TYPE_LABEL_MAP } from "@/lib/constants";
import { toBnDigits } from "@/lib/helpers";
import { IChapterProgress, ITypeProgress } from "@/types/study";

/* -------- merge types that share a label (gap_filling + ssc_gap_filling) -------- */
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

const fresh = (g: Group) => g.total - g.studied;
const PRESETS = [5, 10, 20, 50];

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            disabled={disabled || pending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-brand-dark shadow-[0_3px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-40"
        >
            <Play className="size-4 fill-current" />
            {pending ? "শুরু হচ্ছে…" : "শুরু করো"}
        </button>
    );
}

export default function ChapterCard({ chapter: r, subjectId }: { chapter: IChapterProgress; subjectId: string }) {
    const groups = useMemo(() => groupTypes(r.types), [r.types]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [picked, setPicked] = useState<string[]>([]); // labels; empty = all types
    const [count, setCount] = useState(10);

    const studiedPct = r.total ? (r.studied / r.total) * 100 : 0;
    const masteredPct = r.total ? (r.mastered / r.total) * 100 : 0;
    const learning = r.studied - r.mastered;
    const totalFresh = r.total - r.studied;

    const chosen = picked.length ? groups.filter((g) => picked.includes(g.label)) : groups;
    const available = chosen.reduce((a, g) => a + fresh(g), 0);
    const options = [...PRESETS.filter((n) => n < available), Math.min(available, 100)].filter((n) => n > 0);
    const value = Math.min(count, available);

    const toggle = (label: string) =>
        setPicked((p) => (p.includes(label) ? p.filter((x) => x !== label) : [...p, label]));

    return (
        <div className="rounded-2xl border border-line bg-card p-4">
            {/* header */}
            <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">{r.name}</h3>
                <span className="text-sm text-muted-foreground">{toBnDigits(Math.round(studiedPct))}%</span>
            </div>

            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="absolute h-full bg-brand-light/50" style={{ width: `${studiedPct}%` }} />
                <div className="absolute h-full bg-emerald-500" style={{ width: `${masteredPct}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
                মোট {toBnDigits(r.total)} · আয়ত্তে {toBnDigits(r.mastered)} · শিখছ {toBnDigits(learning)} · নতুন{" "}
                {toBnDigits(totalFresh)}
            </p>

            {/* actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.due > 0 && (
                    <Link
                        href={`/review?chapter=${r.chapterId}&subject=${subjectId}`}
                        className="rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        রিভিউ ({toBnDigits(r.due)})
                    </Link>
                )}
                <button
                    type="button"
                    disabled={totalFresh <= 0}
                    onClick={() => setPanelOpen((v) => !v)}
                    aria-expanded={panelOpen}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                >
                    {totalFresh <= 0 ? "সব প্রশ্ন শুরু করা হয়েছে" : "নতুন প্রশ্ন অনুশীলন শুরু করো"}
                    {totalFresh > 0 && (
                        <ChevronDown className={clsx("size-4 transition-transform", panelOpen && "rotate-180")} />
                    )}
                </button>
            </div>

            {/* start panel */}
            {panelOpen && totalFresh > 0 && (
                <form
                    action={startNewCardsAction}
                    className="mt-3 space-y-4 rounded-xl border border-line bg-muted/40 p-3 sm:p-4"
                >
                    <input type="hidden" name="chapterId" value={r.chapterId} />
                    <input type="hidden" name="count" value={value} />
                    <input type="hidden" name="subjectId" value={subjectId} />
                    {picked.length > 0 &&
                        chosen.flatMap((g) => g.types).map((t) => (
                            <input key={t} type="hidden" name="types" value={t} />
                        ))}

                    <div>
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">প্রশ্নের ধরন</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setPicked([])}
                                className={clsx(
                                    "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                                    picked.length === 0
                                        ? "border-brand bg-brand text-white"
                                        : "border-line bg-card text-foreground hover:border-brand/40",
                                )}
                            >
                                সব ধরন
                            </button>
                            {groups.map((g) => {
                                const on = picked.includes(g.label);
                                const none = fresh(g) <= 0;
                                return (
                                    <button
                                        key={g.label}
                                        type="button"
                                        disabled={none}
                                        onClick={() => toggle(g.label)}
                                        className={clsx(
                                            "rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
                                            on
                                                ? "border-brand bg-brand text-white"
                                                : "border-line bg-card text-foreground hover:border-brand/40",
                                        )}
                                    >
                                        {g.label}
                                        <span className={clsx("ml-1.5 text-xs", on ? "text-white/80" : "text-muted-foreground")}>
                                            নতুন {toBnDigits(fresh(g))}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">কতটি প্রশ্ন?</p>
                        <div className="flex flex-wrap gap-2">
                            {options.map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setCount(n)}
                                    className={clsx(
                                        "min-w-12 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                                        value === n
                                            ? "border-gold bg-gold text-brand-dark"
                                            : "border-line bg-card text-foreground hover:border-gold/60",
                                    )}
                                >
                                    {toBnDigits(n)}টি
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                            {available > 0
                                ? `মোট ${toBnDigits(available)}টি নতুন প্রশ্ন আছে`
                                : "এই ধরনের সব প্রশ্ন শুরু করা হয়েছে"}
                        </p>
                        <SubmitButton disabled={available <= 0 || value <= 0} />
                    </div>
                </form>
            )}

            {/* per-type breakdown */}
            {groups.length > 0 && (
                <details className="group mt-3 border-t border-line pt-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                        ধরন অনুযায়ী অগ্রগতি
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
                                        <span className="text-xs text-muted-foreground">{toBnDigits(g.total)}টি</span>
                                    </div>
                                    <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full bg-emerald-500" style={{ width: `${pct(g.mastered)}%` }} />
                                        <div className="h-full bg-brand-light/50" style={{ width: `${pct(lrn)}%` }} />
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