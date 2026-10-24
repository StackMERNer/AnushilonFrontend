// _components/quality-panel.tsx
"use client";
import type { QuestionAnalyticsDataQualityIssue, QuestionAnalyticsFilters } from "@/types/analytics/question-analytics";
import { useQuestionAnalyticsQuality } from "@/hooks/useQuestionAnalytics";
import { useState } from "react";
import { CARD, ISSUE_OPTIONS, Pager, Section, fmt, fmtDate } from "./shared";

const LABEL = Object.fromEntries(ISSUE_OPTIONS.map((i) => [i.id, i.name]));

export function QualityPanel({ filters }: { filters: QuestionAnalyticsFilters }) {
  const [issues, setIssues] = useState<QuestionAnalyticsDataQualityIssue[]>([]);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuestionAnalyticsQuality({
    filters,
    issues,
    pagination: { page, limit: 25 },
    sort: { field: "createdAt", direction: "desc" },
  });

  if (isLoading) return <div className={`${CARD} p-8 text-center text-sm text-neutral-400`}>Loading…</div>;
  if (isError || !data) return <div className={`${CARD} p-8 text-center text-sm text-red-600`}>Failed to load data quality report.</div>;

  const { summary, affectedQuestions: list } = data;
  const peak = Math.max(...summary.issues.map((i) => i.count), 1);
  const toggle = (id: QuestionAnalyticsDataQualityIssue) => {
    setPage(1);
    setIssues((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Questions checked", summary.totalQuestions],
          ["No issues detected", summary.questionsWithNoDetectedIssues],
          ["With 1+ issues", summary.questionsWithOneOrMoreIssues],
          ["Possible duplicates", summary.possibleDuplicateQuestions],
        ].map(([l, v]) => (
          <div key={l as string} className={`${CARD} p-4`}>
            <div className="text-xs text-neutral-500">{l}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{fmt(v as number)}</div>
          </div>
        ))}
      </div>

      <Section
        title="Issues (click to filter the list below)"
        actions={issues.length > 0 && <button className="text-xs text-blue-600" onClick={() => { setIssues([]); setPage(1); }}>Clear</button>}
      >
        <ul className="grid gap-2 md:grid-cols-2">
          {summary.issues.map((i) => (
            <li key={i.issue}>
              <button onClick={() => toggle(i.issue)} className={`w-full rounded-lg border p-2 text-left ${issues.includes(i.issue) ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50"}`}>
                <div className="flex justify-between text-xs">
                  <span>{i.label}</span>
                  <span className="tabular-nums text-neutral-500">{fmt(i.count)} · {i.percentage}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded bg-neutral-100 dark:bg-neutral-800">
                  <div className={`h-1.5 rounded ${i.count ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${(i.count / peak) * 100}%` }} />
                </div>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-neutral-400">Duplicate detection is a heuristic (same type, question and context text, 15+ characters) and is cached for 5 minutes.</p>
      </Section>

      <Section title={`Affected questions (${fmt(list.pagination.total)})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 dark:border-neutral-800">
                <th className="px-2 py-2 font-medium">refId</th>
                <th className="px-2 py-2 font-medium">Type</th>
                <th className="px-2 py-2 font-medium">Preview</th>
                <th className="px-2 py-2 font-medium">Issues</th>
                <th className="px-2 py-2 text-right font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((r) => (
                <tr key={r.questionId} className="border-b border-neutral-100 align-top dark:border-neutral-800/60">
                  <td className="whitespace-nowrap px-2 py-2 font-mono text-xs">{r.refId ?? "—"}</td>
                  <td className="px-2 py-2 uppercase text-neutral-500">{r.type}</td>
                  <td className="max-w-md px-2 py-2">{r.questionPreview || <span className="text-neutral-400">(empty)</span>}</td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.issues.map((i) => (
                        <span key={i} className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">{LABEL[i] ?? i}</span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right text-neutral-500">{fmtDate(r.createdAt)}</td>
                </tr>
              ))}
              {!list.items.length && (
                <tr><td colSpan={5} className="px-2 py-8 text-center text-neutral-400">No questions with these issues.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={list.pagination.page} totalPages={list.pagination.totalPages} total={list.pagination.total} onPage={setPage} />
      </Section>
    </div>
  );
}
