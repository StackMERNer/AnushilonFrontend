"use client";
import { toBnDigits } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { IDashboardSummary } from "@/types/dashboard";

const WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

export function WeeklyActivity({ days }: { days: IDashboardSummary["last7Days"] }) {
    const max = Math.max(1, ...days.map((d) => d.count));
    const total = days.reduce((a, d) => a + d.count, 0);

    return (
        <section className="rounded-2xl border border-line bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-baseline justify-between">
                <h3 className="font-display text-lg font-bold text-foreground">এই সপ্তাহের অনুশীলন</h3>
                <span className="text-sm text-muted-foreground">মোট {toBnDigits(total)}টি</span>
            </div>

            <div className="flex h-32 items-end gap-2 sm:gap-3">
                {days.map((d, i) => {
                    const isToday = i === days.length - 1;
                    const weekday = WEEKDAYS[new Date(`${d.date}T00:00:00Z`).getUTCDay()];
                    return (
                        <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                            <span className="text-[11px] text-muted-foreground">{d.count ? toBnDigits(d.count) : ""}</span>
                            <div
                                title={`${toBnDigits(d.count)}টি`}
                                className={cn(
                                    "w-full max-w-10 rounded-t-lg transition-all",
                                    d.count === 0 ? "bg-muted" : isToday ? "bg-gold" : "bg-brand-light/60",
                                )}
                                style={{ height: `${d.count === 0 ? 6 : Math.max(10, (d.count / max) * 70)}%` }}
                            />
                            <span className={cn("text-[11px]", isToday ? "font-bold text-foreground" : "text-muted-foreground")}>
                                {weekday}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}