export interface IDashboardSummary {
  dueCount: number;
  totalStudied: number;
  mastered: number;
  reviewedToday: number;
  streak: number;
  last7Days: { date: string; count: number }[]; // oldest -> today
  lastStudied: {
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
  } | null;
}

export interface IDashboardSubject {
  subjectId: string;
  name: string;
  subjectCode: string;
  total: number;
  studied: number;
  mastered: number;
  due: number;
}
