export default function QuestionListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-8 w-full bg-slate-200 rounded animate-pulse mb-6" />
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-lg animate-pulse" />
            ))}
        </div>
    );
}