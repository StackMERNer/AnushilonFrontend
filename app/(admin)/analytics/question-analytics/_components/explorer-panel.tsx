// _components/explorer-panel.tsx
"use client";
import type { QuestionAnalyticsFilters, QuestionAnalyticsGroupBy } from "@/types/analytics/question-analytics";
import { useQuestionAnalyticsBreakdown } from "@/hooks/useQuestionAnalytics";
import { useState } from "react";
import { CARD, INPUT, Pager, TypeBadges, fmt, fmtDate } from "./shared";

const GROUPS: { id: QuestionAnalyticsGroupBy; label: string }[] = [
  { id: "class", label: "Class" },
  { id: "subject", label: "Subject" },
  { id: "chapter", label: "Chapter" },
  { id: "topic", label: "Topic" },
  { id: "type", label: "Question type" },
  { id: "board", label: "Board" },
  { id: "school", label: "School" },
  { id: "university", label: "University" },
  { id: "examYear", label: "Exam year" },
  { id: "difficulty", label: "Difficulty" },
  { id: "level", label: "Level" },
  { id: "tag", label: "Tag" },
  { id: "createdAt", label: "Month added" },
  { id: "updatedAt", label: "Month updated" },
];

const SORTS = [
  { id: "count", label: "Questions" },
  { id: "label", label: "Name" },
  { id: "latestExamYear", label: "Latest exam year" },
  { id: "latestQuestionCreatedAt", label: "Last added" },
];

export function ExplorerPanel({ filters }: { filters: QuestionAnalyticsFilters }) {
  const [groupBy, setGroupBy] = useState<QuestionAnalyticsGroupBy>("chapter");
  const [sortField, setSortField] = useState("count");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useQuestionAnalyticsBreakdown({
    filters,
    groupBy,
    sort: { field: sortField, direction: dir },
    pagination: { page, limit: 25 },
  });

  const peak = Math.max(...(data?.items.map((i) => i.count) ?? [1]), 1);

  return (
    <div className={`${CARD} p-4`}>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Group by
          <select className={INPUT} value={groupBy} onChange={(e) => { setGroupBy(e.target.value as QuestionAnalyticsGroupBy); setPage(1); }}>
            {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Sort by
          <select className={INPUT} value={sortField} onChange={(e) => { setSortField(e.target.value); setPage(1); }}>
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <button className={`${INPUT} px-3`} onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}>
          {dir === "asc" ? "▲ Ascending" : "▼ Descending"}
        </button>
        {isFetching && <span className="text-xs text-neutral-400">updating…</span>}
      </div>

      {isLoading && <div className="py-8 text-center text-sm text-neutral-400">Loading…</div>}
      {isError && <div className="py-8 text-center text-sm text-red-600">Failed to load breakdown.</div>}

      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 dark:border-neutral-800">
                  <th className="px-2 py-2 font-medium">{GROUPS.find((g) => g.id === groupBy)?.label}</th>
                  <th className="px-2 py-2 font-medium">Share</th>
                  <th className="px-2 py-2 text-right font-medium">Questions</th>
                  <th className="px-2 py-2 font-medium">By type</th>
                  <th className="px-2 py-2 text-right font-medium">Latest exam year</th>
                  <th className="px-2 py-2 text-right font-medium">Last added</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r, i) => (
                  <tr key={`${r.key}-${i}`} className="border-b border-neutral-100 align-top dark:border-neutral-800/60">
                    <td className="px-2 py-2">
                      <div>{r.label}</div>
                      {r.parentLabel && <div className="text-xs text-neutral-400">{r.parentLabel}</div>}
                    </td>
                    <td className="w-40 px-2 py-2">
                      <div className="h-2 rounded bg-neutral-100 dark:bg-neutral-800">
                        <div className="h-2 rounded bg-blue-600" style={{ width: `${(r.count / peak) * 100}%` }} />
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-400">{r.percentage}%</div>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">{fmt(r.count)}</td>
                    <td className="px-2 py-2"><TypeBadges counts={r.typeCounts} /></td>
                    <td className="px-2 py-2 text-right tabular-nums">{r.latestExamYear ?? "—"}</td>
                    <td className="px-2 py-2 text-right text-neutral-500">{fmtDate(r.latestQuestionCreatedAt)}</td>
                  </tr>
                ))}
                {!data.items.length && (
                  <tr><td colSpan={6} className="px-2 py-8 text-center text-neutral-400">No data for the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pager page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onPage={setPage} />
          <p className="mt-2 text-xs text-neutral-400">
            Share = % of the {fmt(data.totalQuestions)} matching questions. Tags and sources can overlap, so shares may add up to more than 100%.
          </p>
        </>
      )}
    </div>
  );
}
