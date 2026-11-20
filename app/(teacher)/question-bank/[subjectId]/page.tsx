import { createStudyService } from "@/services/study.service";
import { createServerApiClient } from "@/lib/api/api-server";
import BankChapterCard from "@/components/bank/bank-chapter-card";

export const dynamic = "force-dynamic"; // progress must always be fresh

interface PageProps {
    params: Promise<{ subjectId: string }>;
}

export default async function SubjectChaptersPage({ params }: PageProps) {
    const { subjectId } = await params;
    const chapters = await createStudyService(
        createServerApiClient()
    ).getSubjectProgress(subjectId);

    if (!chapters?.length) {
        return (
            <p className="text-center text-neutral-500 py-16">
                এই বিষয়ে এখনো কোনো অধ্যায় নেই।
            </p>
        );
    }

    return (
        <div className="space-y-3 px-5 py-5">
            {chapters.map((chapter) => (
                <BankChapterCard
                    key={chapter.chapterId}
                    subjectId={subjectId}
                    chapter={chapter}
                />
            ))}
        </div>
    );
}