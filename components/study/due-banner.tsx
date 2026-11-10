"use client";
import { useDueCount } from "@/hooks/use-due-count";
import { toBnDigits } from "@/lib/helpers";
import Link from "next/link";

export default function DueBanner() {
    const { data: countData } = useDueCount();
    const totalDue = countData?.count ?? 0;
    return (
        <Link
            href="/review"
            className="flex items-center justify-between rounded-xl p-4 max-w-50 bg-primary flex-col text-primary-foreground"
        >
            <p className="text-sm opacity-90">আজকের রিভিউ</p>
            <p className="text-2xl font-semibold">
                {totalDue > 0 ? `${toBnDigits(totalDue)}টি প্রশ্ন বাকি` : "সব শেষ! 🎉"}
            </p>
        </Link>
    );
}