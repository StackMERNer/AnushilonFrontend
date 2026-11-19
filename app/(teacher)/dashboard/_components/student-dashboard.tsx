'use client';
import { StatsRow } from '@/components/dashboard/stats-row';
import { SubjectsGrid } from '@/components/dashboard/subjects-grid';
import { TodayCard } from '@/components/dashboard/today-card';
import { WeeklyActivity } from '@/components/dashboard/weekly-activity';
import DailyGoalRing from '@/components/fun/daily-goal-ring';
import { useDashboardSubjects, useDashboardSummary } from '@/hooks/use-study-dashboard';

const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse rounded-3xl bg-muted ${className}`} />
);

const StudentDashboard = () => {
    const summaryQ = useDashboardSummary();
    const subjectsQ = useDashboardSubjects();
    const summary = summaryQ.data;
    const isNew = !!summary && summary.totalStudied === 0;

    return (
        <div className="flex-1 space-y-6 p-4 sm:p-8 lg:p-[20px_40px_50px]">
            {summaryQ.isLoading && <Skeleton className="h-44" />}
            {summaryQ.isError && (
                <div className="rounded-2xl border border-line bg-card p-4 text-sm">
                    ডেটা লোড করা যায়নি।{' '}
                    <button onClick={() => summaryQ.refetch()} className="font-semibold text-brand underline">
                        আবার চেষ্টা করো
                    </button>
                </div>
            )}
            {summary && <TodayCard s={summary} />}

            {summary && !isNew && <StatsRow s={summary} />}

            <div className="rounded-2xl border border-line bg-card p-4">
                <DailyGoalRing />
            </div>

            {subjectsQ.isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                </div>
            ) : (
                subjectsQ.data && <SubjectsGrid subjects={subjectsQ.data} isNew={isNew} />
            )}

            {summary && !isNew && <WeeklyActivity days={summary.last7Days} />}
        </div>
    );
};

export default StudentDashboard;