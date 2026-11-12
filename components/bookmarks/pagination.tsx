import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toBnDigits } from "@/lib/helpers";

function pageList(current: number, total: number): (number | "…")[] {
    const keep = [...new Set([1, total, current - 1, current, current + 1])]
        .filter((p) => p >= 1 && p <= total)
        .sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    let prev = 0;
    for (const p of keep) {
        if (p - prev > 1) out.push("…");
        out.push(p);
        prev = p;
    }
    return out;
}

const base =
    "grid h-9 min-w-9 place-items-center rounded-xl border px-2 text-sm font-medium transition";

export default function Pagination({
    basePath,
    current,
    total,
}: {
    basePath: string;
    current: number;
    total: number;
}) {
    if (total <= 1) return null;
    const href = (p: number) => `${basePath}?page=${p}`;

    return (
        <nav aria-label="পৃষ্ঠা" className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {current > 1 ? (
                <Link href={href(current - 1)} aria-label="আগের পৃষ্ঠা" className={clsx(base, "border-line bg-card hover:bg-accent")}>
                    <ChevronLeft className="size-4" />
                </Link>
            ) : (
                <span className={clsx(base, "border-line opacity-40")}>
                    <ChevronLeft className="size-4" />
                </span>
            )}

            {pageList(current, total).map((p, i) =>
                p === "…" ? (
                    <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                        …
                    </span>
                ) : (
                    <Link
                        key={p}
                        href={href(p)}
                        aria-current={p === current ? "page" : undefined}
                        className={clsx(
                            base,
                            p === current
                                ? "border-brand bg-brand text-white"
                                : "border-line bg-card hover:bg-accent",
                        )}
                    >
                        {toBnDigits(p)}
                    </Link>
                ),
            )}

            {current < total ? (
                <Link href={href(current + 1)} aria-label="পরের পৃষ্ঠা" className={clsx(base, "border-line bg-card hover:bg-accent")}>
                    <ChevronRight className="size-4" />
                </Link>
            ) : (
                <span className={clsx(base, "border-line opacity-40")}>
                    <ChevronRight className="size-4" />
                </span>
            )}
        </nav>
    );
}