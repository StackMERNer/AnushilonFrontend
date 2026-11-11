"use client";
import Link from "next/link";
import { toBnDigits } from "@/lib/helpers";
import { IDashboardSubject } from "@/types/dashboard";

export function SubjectsGrid({
    subjects,
    isNew,
}: {
    subjects: IDashboardSubject[];
    isNew: boolean;
}) {
    if (!subjects.length) {
        return (
            <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted-foreground">
                তোমার ক্লাসের কোনো বিষয় পাওয়া যায়নি। প্রোফাইল থেকে ক্লাস ও বিভাগ ঠিক আছে কিনা দেখো।
            </p>
        );
    }

    return (
        <section>
            <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                {isNew ? "কোথা থেকে শুরু করবে?" : "তোমার বিষয়সমূহ"}
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {subjects.map((s) => {
                    const studiedPct = s.total ? (s.studied / s.total) * 100 : 0;
                    const masteredPct = s.total ? (s.mastered / s.total) * 100 : 0;
                    return (
                        <Link
                            key={s.subjectId}
                            href={`/browse/${s.subjectId}`}
                            className="group rounded-2xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-foreground">{s.name}</h4>
                                {s.due > 0 && (
                                    <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-brand-dark">
                                        {toBnDigits(s.due)} রিভিউ
                                    </span>
                                )}
                            </div>

                            <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                <div className="absolute h-full bg-brand-light/50" style={{ width: `${studiedPct}%` }} />
                                <div className="absolute h-full bg-emerald-500" style={{ width: `${masteredPct}%` }} />
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                {s.total === 0
                                    ? "শীঘ্রই প্রশ্ন যুক্ত হবে"
                                    : `${toBnDigits(Math.round(studiedPct))}% শুরু · আয়ত্তে ${toBnDigits(s.mastered)}/${toBnDigits(s.total)}`}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}