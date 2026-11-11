import { createStudyService } from "@/services/study.service";
import { createServerApiClient } from "@/lib/api/api-server";
import ChapterCard from "./chapter-card";

export default async function ChapterProgressList({ subjectId }: { subjectId: string }) {
    const rows = await createStudyService(createServerApiClient()).getSubjectProgress(subjectId);
    return (
        <ul className="space-y-3 px-5 pb-5">
            {rows.map((r) => (
                <li key={r.chapterId}>
                    <ChapterCard subjectId={subjectId} chapter={r} />
                </li>
            ))}
        </ul>
    );
}