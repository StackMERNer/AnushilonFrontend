"use client";
import type {
  QuestionAnalyticsFilters,
  QuestionAnalyticsGranularity,
} from "@/types/analytics/question-analytics";
import {
  useDebounced,
  useQuestionAnalyticsDashboard,
  useQuestionAnalyticsFilterOptions,
} from "@/hooks/useQuestionAnalytics";
import { useState } from "react";
import { DistributionBars, TimeSeriesChart, TypeDonut, YearChart } from "./_components/charts";
import { ExplorerPanel } from "./_components/explorer-panel";
import { FiltersPanel } from "./_components/filters-panel";
import { HierarchyPanel } from "./_components/hierarchy-panel";
import { QualityPanel } from "./_components/quality-panel";
import { CARD, INPUT, Section, fmt } from "./_components/shared";
import { SourcesPanel } from "./_components/sources-panel";
import { SummaryCards } from "./_components/summary-cards";

type Tab = "overview" | "hierarchy" | "sources" | "quality" | "explorer";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "hierarchy", label: "Class · Subject · Chapter" },
  { id: "sources", label: "Exam years & sources" },
  { id: "quality", label: "Data quality" },
  { id: "explorer", label: "Explorer" },
];

export default function QuestionAnalyticsPage() {
  const [filters, setFilters] = useState<QuestionAnalyticsFilters>({});
  const [granularity, setGranularity] = useState<QuestionAnalyticsGranularity>("month");
  const [series, setSeries] = useState<"created" | "updated">("created");
  const [tab, setTab] = useState<Tab>("overview");

  // debounce so typing / rapid clicks don't fire a request per change
  const applied = useDebounced(filters, 400);

  const dashboard = useQuestionAnalyticsDashboard({ filters: applied, granularity });
  const options = useQuestionAnalyticsFilterOptions({ filters: applied });

  const data = dashboard.data;
  const pending = filters !== applied || dashboard.isFetching;

  /** Narrow filters to one entity (row / bar click). */
  const drill = (key: keyof QuestionAnalyticsFilters, id: string) =>
    setFilters((f) => ({ ...f, [key]: key === "examYears" ? [Number(id)] : [id] }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Question analytics</h1>
          <p className="text-sm text-neutral-500">
            {data ? `${fmt(data.summary.totalQuestions)} questions match the current filters` : "Loading…"}
            {data && ` · generated ${new Date(data.generatedAt).toLocaleTimeString()}`}
          </p>
        </div>
        <button
          className={`${INPUT} px-3`}
          onClick={() => dashboard.refetch()}
          disabled={dashboard.isFetching}
        >
          {dashboard.isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <FiltersPanel filters={filters} onChange={setFilters} options={options.data} loading={options.isFetching} />

      <nav className="flex flex-wrap gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-sm ${tab === t.id ? "bg-white font-medium shadow-sm dark:bg-neutral-950" : "text-neutral-500"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {dashboard.isError && !data && (
        <div className={`${CARD} p-8 text-center text-sm text-red-600`}>
          Failed to load analytics. Check the API route and your admin session, then press Refresh.
        </div>
      )}

      <div className={pending && data ? "opacity-70 transition-opacity" : "transition-opacity"}>
        {data && tab === "overview" && (
          <div className="space-y-4">
            <SummaryCards s={data.summary} />

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <Section
                  title={series === "created" ? "Questions added over time" : "Questions updated over time"}
                  actions={
                    <div className="flex gap-2">
                      <select className={`${INPUT} h-8 text-xs`} value={series} onChange={(e) => setSeries(e.target.value as "created" | "updated")}>
                        <option value="created">Added</option>
                        <option value="updated">Updated</option>
                      </select>
                      <select className={`${INPUT} h-8 text-xs`} value={granularity} onChange={(e) => setGranularity(e.target.value as QuestionAnalyticsGranularity)}>
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                      </select>
                    </div>
                  }
                >
                  <TimeSeriesChart
                    points={(series === "created" ? data.trends.additionsOverTime : data.trends.updatesOverTime).points}
                    granularity={granularity}
                  />
                </Section>
              </div>
              <Section title="Question types">
                <TypeDonut items={data.trends.byQuestionType} />
              </Section>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Section title="By class (click to filter)">
                <DistributionBars items={data.trends.byClass} onSelect={(i) => i.id && drill("classIds", i.id)} />
              </Section>
              <Section title="By subject (click to filter)">
                <DistributionBars items={data.trends.bySubject} onSelect={(i) => i.id && drill("subjectIds", i.id)} />
              </Section>
              <Section title="Exam year (board · school · university)">
                <YearChart data={data.trends.byExamYear} />
              </Section>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Section title="Difficulty">
                <DistributionBars items={data.trends.byDifficulty} />
              </Section>
              <Section title="Cognitive level">
                <DistributionBars items={data.trends.byLevel} />
              </Section>
            </div>
          </div>
        )}

        {data && tab === "hierarchy" && <HierarchyPanel data={data} onDrill={drill} />}
        {tab === "sources" && <SourcesPanel filters={applied} onDrill={drill} />}
        {tab === "quality" && <QualityPanel filters={applied} />}
        {tab === "explorer" && <ExplorerPanel filters={applied} />}
      </div>
    </div>
  );
}
