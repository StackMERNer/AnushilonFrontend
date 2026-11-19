"use client";
import clsx from "clsx";
import { formatInterval } from "@/lib/format-interval";
import { Rating, RatingIntervals } from "@/types/study";

const RATINGS: { value: Rating; label: string; cls: string }[] = [
    { value: 1, label: "আবার", cls: "bg-red-500" },
    { value: 2, label: "কঠিন", cls: "bg-orange-500" },
    { value: 3, label: "ভালো", cls: "bg-emerald-500" },
    { value: 4, label: "সহজ", cls: "bg-brand" },
];

export default function RatingBar({
    intervals,
    onRate,
    disabled,
    suggested,
}: {
    intervals?: RatingIntervals | null;
    onRate: (r: Rating) => void;
    disabled?: boolean;
    suggested?: Rating;
}) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
                <button
                    key={r.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onRate(r.value)}
                    className={clsx(
                        "flex flex-col items-center gap-0.5 rounded-2xl py-2.5 font-bold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-50",
                        r.cls,
                        suggested === r.value && "ring-2 ring-gold ring-offset-2 ring-offset-card",
                    )}
                >
                    <span>{r.label}</span>
                    <span className="text-[11px] font-medium opacity-85">
                        {intervals ? formatInterval(intervals[r.value]) : "\u00A0"}
                    </span>
                </button>
            ))}
        </div>
    );
}