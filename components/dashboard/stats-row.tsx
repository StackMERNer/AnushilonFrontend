"use client";
import { CheckCheck, Flame, Trophy } from "lucide-react";
import { ReactNode } from "react";
import { toBnDigits } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { IDashboardSummary } from "@/types/dashboard";

const tones = {
    red: "bg-red-tint text-red",
    gold: "bg-gold/20 text-gold",
    brand: "bg-brand-soft text-brand",
} as const;

function Stat({ icon, tone, value, label }: { icon: ReactNode; tone: keyof typeof tones; value: string; label: string }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-card p-3 sm:p-4">
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-full sm:size-12", tones[tone])}>
                {icon}
            </span>
            <div className="min-w-0 leading-tight">
                <p className="truncate text-lg font-bold text-foreground sm:text-xl">{value}</p>
                <p className="truncate text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

export function StatsRow({ s }: { s: IDashboardSummary }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
                tone="red"
                icon={<Flame className="size-5 fill-current" />}
                value={`${toBnDigits(s.streak)} দিন`}
                label={s.streak > 0 ? "স্ট্রিক চলছে" : "আজ রিভিউ করে স্ট্রিক শুরু করো"}
            />
            <Stat
                tone="gold"
                icon={<CheckCheck className="size-5" />}
                value={toBnDigits(s.reviewedToday)}
                label="আজ রিভিউ করেছ"
            />
            <Stat
                tone="brand"
                icon={<Trophy className="size-5 fill-current" />}
                value={toBnDigits(s.mastered)}
                label="প্রশ্ন আয়ত্তে"
            />
        </div>
    );
}