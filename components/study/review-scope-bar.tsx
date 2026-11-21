import Link from "next/link";
import { toBnDigits } from "@/lib/helpers";

export default function ReviewScopeBar({
    scope,
    totalDue,
    totalDueAll,
    explicit,
}: {
    scope: "track" | "all";
    totalDue: number;
    totalDueAll: number;
    explicit: boolean;
}) {
    if (explicit) return null; // a chapter/topic review has its own scope
    const other = totalDueAll - totalDue;
    if (scope === "track" && other <= 0) return null; // nothing hidden, nothing to show

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-2 px-4 pt-4 text-sm">
            <span className="text-muted-foreground">
                {scope === "all" ? "সব ট্র্যাকের রিভিউ" : "এই ট্র্যাকের রিভিউ"}
            </span>
            {scope === "all" ? (
                <Link href="/review" className="font-semibold text-brand underline-offset-2 hover:underline">
                    শুধু এই ট্র্যাক
                </Link>
            ) : (
                <Link href="/review?scope=all" className="font-semibold text-brand underline-offset-2 hover:underline">
                    সব ট্র্যাকের রিভিউ (+{toBnDigits(other)})
                </Link>
            )}
        </div>
    );
}