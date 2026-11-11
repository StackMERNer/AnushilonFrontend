'use client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDashboardSubjects, useDashboardSummary } from '@/hooks/use-study-dashboard';
import { useState } from 'react';
import InstituteInfoModal from './InstituteInfoModal';
import ms from 'ms';
import { TodayCard } from '@/components/dashboard/today-card';
import { StatsRow } from '@/components/dashboard/stats-row';
import { SubjectsGrid } from '@/components/dashboard/subjects-grid';
import { WeeklyActivity } from '@/components/dashboard/weekly-activity';

const INSTITUTE_SKIP_KEY = 'institute-info-modal-skipped';
const SKIP_DURATION = ms('3h');


const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse rounded-3xl bg-muted ${className}`} />
);

const StudentDashboard = () => {
    const { data: user, isLoading: userLoading } = useUserProfile();
    const summaryQ = useDashboardSummary();
    const subjectsQ = useDashboardSubjects();

    const [isSkipped, setIsSkipped] = useState(() => {
        if (typeof window === 'undefined') return false;
        const skippedAt = localStorage.getItem(INSTITUTE_SKIP_KEY);
        if (!skippedAt) return false;
        const timestamp = Number(skippedAt);
        if (!Number.isFinite(timestamp)) {
            localStorage.removeItem(INSTITUTE_SKIP_KEY);
            return false;
        }
        const isStillValid = Date.now() - timestamp < SKIP_DURATION;
        if (!isStillValid) localStorage.removeItem(INSTITUTE_SKIP_KEY);
        return isStillValid;
    });

    const handleSkip = () => {
        localStorage.setItem(INSTITUTE_SKIP_KEY, Date.now().toString());
        setIsSkipped(true);
    };
    const handleCompleted = () => {
        localStorage.removeItem(INSTITUTE_SKIP_KEY);
        setIsSkipped(true);
    };

    const showInstituteModal = !userLoading && !!user && !user.institute?.name && !isSkipped;

    const summary = summaryQ.data;
    const isNew = !!summary && summary.totalStudied === 0;
    const firstName = user?.name?.trim().split(' ')[0];

    return (
        <div className="flex-1 space-y-6 p-4 sm:p-8 lg:p-[20px_40px_50px]">
            {/* <header>
                {user ? (
                    <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                        {greeting()}
                        {firstName ? `, ${firstName}` : ''}
                    </h1>
                ) : (
                    <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
                )}
            </header> */}

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

            <InstituteInfoModal
                open={showInstituteModal}
                onCompleted={handleCompleted}
                onSkip={handleSkip}
            />
        </div>
    );
};

export default StudentDashboard;