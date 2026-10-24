// app/(admin)/admin/question-analytics/_components/shared.tsx
import type { QuestionAnalyticsDataQualityIssue } from "@/types/analytics/question-analytics";
import type { ReactNode } from "react";

export const CARD =
  "rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900";
export const INPUT =
  "h-9 rounded-lg border border-neutral-300 bg-white px-2.5 text-sm outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-950";

export const fmt = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("en-US");

export const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

/** Bucket label for the time chart; `date` is the bucket's start date (YYYY-MM-DD). */
export function fmtBucket(date: string, granularity: "day" | "week" | "month" | "year") {
  const d = new Date(`${date}T00:00:00`);
  if (granularity === "year") return String(d.getFullYear());
  if (granularity === "month")
    return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export const ISSUE_OPTIONS: { id: QuestionAnalyticsDataQualityIssue; name: string }[] = [
  { id: "missing-question", name: "No question text" },
  { id: "missing-subject", name: "Missing subject" },
  { id: "missing-chapter", name: "Missing chapter" },
  { id: "missing-topic", name: "Missing topic" },
  { id: "missing-answer", name: "Missing answer" },
  { id: "missing-mcq-options", name: "MCQ options < 2" },
  { id: "invalid-mcq-answer-index", name: "Invalid MCQ answer" },
  { id: "missing-board-year", name: "Board without year" },
  { id: "missing-school-year", name: "School without year" },
  { id: "missing-university-year", name: "University without year" },
  { id: "missing-ref-id", name: "Missing refId" },
  { id: "possible-duplicate", name: "Possible duplicate" },
  { id: "orphaned-subject", name: "Orphaned subject" },
  { id: "orphaned-chapter", name: "Orphaned chapter" },
  { id: "orphaned-topic", name: "Orphaned topic" },
];

export const PALETTE = ["#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626", "#0891b2", "#be185d", "#65a30d"];

export function TypeBadges({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <span className="text-neutral-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([t, n]) => (
        <span
          key={t}
          className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs tabular-nums dark:bg-neutral-800"
        >
          <span className="uppercase text-neutral-500">{t}</span> {fmt(n)}
        </span>
      ))}
    </div>
  );
}

export function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={`${CARD} p-4`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Pager({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
      <span>{fmt(total)} rows</span>
      <div className="flex items-center gap-2">
        <button className={`${INPUT} h-8 disabled:opacity-40`} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Prev
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button className={`${INPUT} h-8 disabled:opacity-40`} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
