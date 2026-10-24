// _components/sources-panel.tsx
"use client";
import type { QuestionAnalyticsExamSourceRow, QuestionAnalyticsFilters } from "@/types/analytics/question-analytics";
import { useQuestionAnalyticsExamCoverage } from "@/hooks/useQuestionAnalytics";
import { useState } from "react";
import { Column, DataTable } from "./data-table";
import { CARD, Section, TypeBadges, fmt, fmtDate } from "./shared";

export function SourcesPanel({
  filters,
  onDrill,
}: {
  filters: QuestionAnalyticsFilters;
  onDrill: (key: "boardIds" | "schoolIds" | "universityIds" | "examYears", id: string) => void;
}) {
  const { data, isLoading, isError } = useQuestionAnalyticsExamCoverage({ filters });
  const [src, setSrc] = useState<"boards" | "schools" | "universities">("boards");

  if (isLoading) return <div className={`${CARD} p-8 text-center text-sm text-neutral-400`}>Loading…</div>;
  if (isError || !data) return <div className={`${CARD} p-8 text-center text-sm text-red-600`}>Failed to load exam coverage.</div>;

  const cols: Column<QuestionAnalyticsExamSourceRow>[] = [
    { key: "name", header: "Name", render: (r) => r.sourceName, sort: (r) => r.sourceName },
    { key: "unique", header: "Questions", align: "right", render: (r) => fmt(r.uniqueQuestionCount), sort: (r) => r.uniqueQuestionCount },
    { key: "assoc", header: "Appearances", align: "right", render: (r) => fmt(r.associationCount), sort: (r) => r.associationCount },
    { key: "latest", header: "Latest year", align: "right", render: (r) => r.latestExamYear ?? "—", sort: (r) => r.latestExamYear },
    {
      key: "years", header: "Years covered",
      render: (r) => (
        <span className="text-xs text-neutral-500">
          {r.availableYears.slice(0, 12).join(", ")}
          {r.availableYears.length > 12 && ` +${r.availableYears.length - 12}`}
        </span>
      ),
    },
    { key: "added", header: "Added (period)", align: "right", render: (r) => fmt(r.questionsAddedInPeriod), sort: (r) => r.questionsAddedInPeriod },
    { key: "last", header: "Last added", align: "right", render: (r) => fmtDate(r.latestQuestionCreatedAt), sort: (r) => r.latestQuestionCreatedAt },
  ];

  const idKey = src === "boards" ? "boardIds" : src === "schools" ? "schoolIds" : "universityIds";

  return (
    <div className="grid gap-4">
      <Section title="Exam-year coverage">
        <DataTable
          rows={data.years}
          defaultSort={{ key: "year", dir: "desc" }}
          onRowClick={(r) => onDrill("examYears", String(r.year))}
          columns={[
            { key: "year", header: "Year", render: (r) => r.year, sort: (r) => r.year },
            { key: "unique", header: "Questions", align: "right", render: (r) => fmt(r.uniqueQuestionCount), sort: (r) => r.uniqueQuestionCount },
            { key: "b", header: "Board", align: "right", render: (r) => fmt(r.boardCount), sort: (r) => r.boardCount },
            { key: "s", header: "School", align: "right", render: (r) => fmt(r.schoolCount), sort: (r) => r.schoolCount },
            { key: "u", header: "University", align: "right", render: (r) => fmt(r.universityCount), sort: (r) => r.universityCount },
            { key: "t", header: "By type", render: (r) => <TypeBadges counts={r.typeCounts} /> },
          ]}
        />
      </Section>

      <Section
        title="Boards, schools & universities"
        actions={
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
            {(["boards", "schools", "universities"] as const).map((s) => (
              <button key={s} onClick={() => setSrc(s)}
                className={`rounded-md px-3 py-1 text-xs capitalize ${src === s ? "bg-white shadow-sm dark:bg-neutral-950" : "text-neutral-500"}`}>
                {s} <span className="text-neutral-400">{data[s].length}</span>
              </button>
            ))}
          </div>
        }
      >
        <DataTable
          rows={data[src]}
          columns={cols}
          defaultSort={{ key: "unique", dir: "desc" }}
          searchText={(r) => r.sourceName}
          onRowClick={(r) => r.sourceId && onDrill(idKey, r.sourceId)}
        />
      </Section>
    </div>
  );
}
