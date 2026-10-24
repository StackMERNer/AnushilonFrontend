import QuestionListSkeleton from "@/components/QuestionListSkeleton";

export default function Loading() {
    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Same wrapper classes as the real <main> */}
            <main className="flex-1 min-w-0 px-2 sm:px-4">
                <QuestionListSkeleton />
            </main>

            {/* Placeholder for the filter sidebar (desktop only) */}
            <aside className="hidden md:block w-72 shrink-0 border-l p-4 space-y-4">
                <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
            </aside>
        </div>
    );
}