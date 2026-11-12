"use client";
import Link from "next/link";
import clsx from "clsx";
import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/use-streak";
import { toBnDigits } from "@/lib/helpers";

export function StreakBadge() {
    const { data } = useStreak();
    if (!data) return null; // hide while loading or on error

    const { streak, doneToday } = data;
    const title = doneToday
        ? `${toBnDigits(streak)} দিনের স্ট্রিক চলছে`
        : streak > 0
            ? "আজ রিভিউ করে স্ট্রিক ধরে রাখো"
            : "রিভিউ করে স্ট্রিক শুরু করো";

    return (
        <Link
            href="/review"
            title={title}
            aria-label={title}
            className={clsx(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-bold transition hover:opacity-90",
                doneToday
                    ? "border-red/30 bg-red-tint text-red"
                    : "border-line bg-muted text-muted-foreground",
            )}
        >
            <Flame className={clsx("size-4", doneToday && "fill-current")} />
            {toBnDigits(streak)}
        </Link>
    );
}