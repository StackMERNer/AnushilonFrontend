export default function QuestionListSkeleton({ length = 6 }: { length?: number }) {
    return (
        <div className="space-y-4 mt-4  max-w-2xl mx-auto w-full">
            <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-6" />
            {Array.from({ length: length }).map((_, i) => (
                <div key={i} className="h-48 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
        </div>
    );
}