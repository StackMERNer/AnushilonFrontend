"use client";

import { useRef } from "react";
import clsx from "clsx";
import { usePersistentNumber } from "@/hooks/use-persistent-flag";
import { useDailyProgress } from "@/lib/daily-goal";
import { toBnDigits } from "@/lib/helpers";

const GOALS = [10, 20, 50];

export default function DailyGoalRing({ size = 52 }: { size?: number }) {
    const [goal, setGoal] = usePersistentNumber("daily:goal", 20);
    const { count } = useDailyProgress();
    const ref = useRef<HTMLDetailsElement>(null);

    const stroke = 5;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.min(1, count / goal);
    const done = count >= goal;

    return (
        <details ref={ref} className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                <span className="relative grid place-items-center" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="-rotate-90">
                        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={r}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={c}
                            strokeDashoffset={c * (1 - pct)}
                            className={clsx(
                                "fill-none transition-[stroke-dashoffset] duration-500",
                                done ? "stroke-emerald-500" : "stroke-gold",
                            )}
                        />
                    </svg>
                    <span className="absolute text-xs font-bold text-foreground">
                        {done ? "✓" : toBnDigits(count)}
                    </span>
                </span>
                <span className="leading-tight">
                    <span className="block text-sm font-semibold text-foreground">আজকের লক্ষ্য</span>
                    <span className="block text-xs text-muted-foreground">
                        {toBnDigits(Math.min(count, goal))}/{toBnDigits(goal)}টি প্রশ্ন
                        {done && " · পূরণ 🎉"}
                    </span>
                </span>
            </summary>

            <div className="absolute left-0 z-20 mt-2 w-56 rounded-xl border border-line bg-card p-3 shadow-lg">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">দৈনিক লক্ষ্য বদলাও</p>
                <div className="flex gap-2">
                    {GOALS.map((g) => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => {
                                setGoal(g);
                                if (ref.current) ref.current.open = false;
                            }}
                            className={clsx(
                                "flex-1 rounded-lg border px-2 py-1.5 text-sm font-semibold transition",
                                g === goal
                                    ? "border-gold bg-gold text-brand-dark"
                                    : "border-line hover:border-gold/60",
                            )}
                        >
                            {toBnDigits(g)}টি
                        </button>
                    ))}
                </div>
            </div>
        </details>
    );
}