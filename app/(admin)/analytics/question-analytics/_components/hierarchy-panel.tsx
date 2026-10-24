// _components/hierarchy-panel.tsx
"use client";
import type {
  QuestionAnalyticsChapterRow,
  QuestionAnalyticsClassRow,
  QuestionAnalyticsDashboardResponse,
  QuestionAnalyticsSubjectRow,
  QuestionAnalyticsTopicRow,
} from "@/types/analytics/question-analytics";
import { useState } from "react";
import { Column, DataTable } from "./data-table";
import { CARD, TypeBadges, fmt, fmtDate } from "./shared";

type Level = "class" | "subject" | "chapter" | "topic";

export function HierarchyPanel({
  data,
  onDrill,
}: {
  data: QuestionAnalyticsDashboardResponse;
  /** clicking a row narrows the filters to that entity */
  onDrill: (key: "classIds" | "subjectIds" | "chapterIds" | "topicIds", id: string) => void;
}) {
  const [level, setLevel] = useState<Level>("class");

  const latest = <T extends { latestExamYear: number | null; latestQuestionCreatedAt: string | null }>(): Column<T>[] => [
    { key: "year", header: "Latest exam year", align: "right", render: (r) => r.latestExamYear ?? "—", sort: (r) => r.latestExamYear },
    { key: "added", header: "Last added", align: "right", render: (r) => fmtDate(r.latestQuestionCreatedAt), sort: (r) => r.latestQuestionCreatedAt },
  ];
  const total = <T extends { totalQuestions: number }>(): Column<T> => ({
    key: "total", header: "Questions", align: "right", render: (r) => fmt(r.totalQuestions), sort: (r) => r.totalQuestions,
  });
  const types = <T extends { typeCounts: Record<string, number> }>(): Column<T> => ({
    key: "types", header: "By type", render: (r) => <TypeBadges counts={r.typeCounts} />,
  });

  const classCols: Column<QuestionAnalyticsClassRow>[] = [
    { key: "name", header: "Class", render: (r) => r.className, sort: (r) => r.className },
    total(), types(),
    { key: "subjects", header: "Subjects", align: "right", render: (r) => r.subjectCount, sort: (r) => r.subjectCount },
    { key: "chapters", header: "Chapters", align: "right", render: (r) => r.chapterCount, sort: (r) => r.chapterCount },
    ...latest<QuestionAnalyticsClassRow>(),
  ];
  const subjectCols: Column<QuestionAnalyticsSubjectRow>[] = [
    { key: "name", header: "Subject", render: (r) => r.subjectName, sort: (r) => r.subjectName },
    { key: "class", header: "Class", render: (r) => r.className, sort: (r) => r.className },
    total(), types(),
    { key: "chapters", header: "Chapters", align: "right", render: (r) => r.chapterCount, sort: (r) => r.chapterCount },
    { key: "topics", header: "Topics", align: "right", render: (r) => r.topicCount, sort: (r) => r.topicCount },
    ...latest<QuestionAnalyticsSubjectRow>(),
  ];
  const chapterCols: Column<QuestionAnalyticsChapterRow>[] = [
    { key: "name", header: "Chapter", render: (r) => r.chapterName, sort: (r) => r.chapterName },
    { key: "subject", header: "Subject · Class", render: (r) => `${r.subjectName} · ${r.className}`, sort: (r) => r.subjectName },
    total(), types(),
    { key: "period", header: "Added (period)", align: "right", render: (r) => fmt(r.questionsAddedInPeriod), sort: (r) => r.questionsAddedInPeriod },
    { key: "noans", header: "No answer", align: "right", render: (r) => fmt(r.questionsWithoutAnswers), sort: (r) => r.questionsWithoutAnswers },
    { key: "notopic", header: "No topic", align: "right", render: (r) => fmt(r.questionsWithoutTopic), sort: (r) => r.questionsWithoutTopic },
    ...latest<QuestionAnalyticsChapterRow>(),
  ];
  const topicCols: Column<QuestionAnalyticsTopicRow>[] = [
    { key: "name", header: "Topic", render: (r) => r.topicName, sort: (r) => r.topicName },
    { key: "chapter", header: "Chapter · Subject · Class", render: (r) => `${r.chapterName} · ${r.subjectName} · ${r.className}`, sort: (r) => r.chapterName },
    total(), types(),
    ...latest<QuestionAnalyticsTopicRow>(),
  ];

  const tabs: { id: Level; label: string; n: number }[] = [
    { id: "class", label: "Classes", n: data.byClass.length },
    { id: "subject", label: "Subjects", n: data.bySubject.length },
    { id: "chapter", label: "Chapters", n: data.byChapter.length },
    { id: "topic", label: "Topics", n: data.byTopic.length },
  ];

  return (
    <div className={`${CARD} p-4`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setLevel(t.id)}
              className={`rounded-md px-3 py-1 text-sm ${level === t.id ? "bg-white shadow-sm dark:bg-neutral-950" : "text-neutral-500"}`}
            >
              {t.label} <span className="text-xs text-neutral-400">{t.n}</span>
            </button>
          ))}
        </div>
        <span className="text-xs text-neutral-400">Click a row to filter by it</span>
      </div>

      {level === "class" && (
        <DataTable rows={data.byClass} columns={classCols} defaultSort={{ key: "total", dir: "desc" }}
          searchText={(r) => r.className} onRowClick={(r) => r.classId && onDrill("classIds", r.classId)} />
      )}
      {level === "subject" && (
        <DataTable rows={data.bySubject} columns={subjectCols} defaultSort={{ key: "total", dir: "desc" }}
          searchText={(r) => `${r.subjectName} ${r.className}`} onRowClick={(r) => r.subjectId && onDrill("subjectIds", r.subjectId)} />
      )}
      {level === "chapter" && (
        <DataTable rows={data.byChapter} columns={chapterCols} defaultSort={{ key: "total", dir: "desc" }}
          searchText={(r) => `${r.chapterName} ${r.subjectName} ${r.className}`} onRowClick={(r) => r.chapterId && onDrill("chapterIds", r.chapterId)} />
      )}
      {level === "topic" && (
        <>
          <DataTable rows={data.byTopic} columns={topicCols} defaultSort={{ key: "total", dir: "desc" }}
            searchText={(r) => `${r.topicName} ${r.chapterName} ${r.subjectName}`} onRowClick={(r) => r.topicId && onDrill("topicIds", r.topicId)} />
          <p className="mt-2 text-xs text-neutral-400">Shows the top 300 topics by question count; use the Explorer tab for the full list.</p>
        </>
      )}
    </div>
  );
}
