// _components/summary-cards.tsx
"use client";
import type { QuestionAnalyticsSummary } from "@/types/analytics/question-analytics";
import { CARD, fmt } from "./shared";

function Card({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <div className={`${CARD} p-4`}>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub && (
        <div className={`mt-0.5 text-xs ${tone === "good" ? "text-green-600" : tone === "bad" ? "text-red-600" : "text-neutral-500"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function SummaryCards({ s }: { s: QuestionAnalyticsSummary }) {
  const g = s.growth;
  const growth =
    g.percentageChange == null
      ? `prev period: ${fmt(g.previousPeriodCount)}`
      : `${g.percentageChange > 0 ? "+" : ""}${g.percentageChange}% vs previous period`;
  const answerPct = s.totalQuestions ? Math.round((s.questionsWithAnswers / s.totalQuestions) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
      <Card label="Total questions" value={fmt(s.totalQuestions)} sub={`${fmt(s.classesRepresented)} classes · ${fmt(s.subjectsRepresented)} subjects`} />
      <Card label="Added in period" value={fmt(s.addedInPeriod)} sub={growth} tone={g.absoluteChange >= 0 ? "good" : "bad"} />
      <Card label="Updated in period" value={fmt(s.updatedInPeriod)} sub="period = added-date filter, else last 30 days" />
      <Card label="Chapters / topics" value={`${fmt(s.chaptersRepresented)} / ${fmt(s.topicsRepresented)}`} sub={`${fmt(s.questionsWithoutTopic)} questions without topic`} tone={s.questionsWithoutTopic ? "bad" : undefined} />
      <Card label="With answers" value={`${answerPct}%`} sub={`${fmt(s.questionsWithoutAnswers)} without`} tone={s.questionsWithoutAnswers ? "bad" : "good"} />
      <Card label="Avg rating" value={s.averageRating == null ? "—" : String(s.averageRating)} sub={`board ${fmt(s.questionsWithBoards)} · school ${fmt(s.questionsWithSchools)} · uni ${fmt(s.questionsWithUniversities)}`} />
    </div>
  );
}
