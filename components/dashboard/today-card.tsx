"use client";
import Link from "next/link";
import { PressButton } from "@/components/ui/press-button";
import { toBnDigits } from "@/lib/helpers";
import { IDashboardSummary } from "@/types/dashboard";

export function TodayCard({ s }: { s: IDashboardSummary }) {
    const isNew = s.totalStudied === 0;

    const content = isNew
        ? {
            eyebrow: "স্বাগতম 👋",
            title: "চলো শুরু করা যাক!",
            sub: "একটি বিষয় বেছে নাও আর প্রথম প্রশ্নগুলো শেখো।",
            cta: "বিষয় বেছে নাও",
            href: "/browse",
        }
        : s.dueCount > 0
            ? {
                eyebrow: "আজকের রিভিউ",
                title: `${toBnDigits(s.dueCount)}টি প্রশ্ন বাকি`,
                sub: "নিয়মিত রিভিউ করলে মনে থাকে অনেক বেশি।",
                cta: "রিভিউ শুরু করো",
                href: "/review",
            }
            : {
                eyebrow: "আজকের রিভিউ",
                title: "সব শেষ! 🎉",
                sub: "নতুন প্রশ্ন শেখার জন্য একটি বিষয় বেছে নাও।",
                cta: "নতুন প্রশ্ন শুরু করো",
                href: "/browse",
            };

    return (
        <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#392078] to-[#1b0851] p-5 text-white shadow-[0_20px_60px_-20px_rgba(27,8,81,0.6)] sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 -z-10 size-40 rounded-full border-2 border-dashed border-white/20" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 -z-10 size-32 rounded-full bg-gold/20 blur-2xl" />

            <p className="text-sm text-white/70">{content.eyebrow}</p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-4xl">{content.title}</h2>
            <p className="mt-2 max-w-md text-sm text-white/70 sm:text-base">{content.sub}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <PressButton variant="shine" size="lg">
                    <Link href={content.href}>{content.cta}</Link>
                </PressButton>

                {s.lastStudied && (
                    <Link
                        href={`/browse/${s.lastStudied.subjectId}`}
                        className="min-w-0 truncate text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
                    >
                        চালিয়ে যাও: {s.lastStudied.subjectName} › {s.lastStudied.chapterName} →
                    </Link>
                )}
            </div>
        </section>
    );
}