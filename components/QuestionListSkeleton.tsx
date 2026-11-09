export default function QuestionListSkeleton() {
    return (
        <div className="space-y-4 mt-4">
            <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-6" />
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
        </div>
    );
}