import { createStudyService } from "@/services/study.service";
import StudySession from "@/components/study/study-session";
import { createServerApiClient } from "@/lib/api/api-server";

export default async function ReviewPage({
    searchParams,
}: {
    searchParams: Promise<{ chapter?: string; topic?: string }>;
}) {
    const { chapter, topic } = await searchParams;
    const study = createStudyService(createServerApiClient());
    const queue = await study.getQueue({ limit: 30, chapter, topic });

    return <StudySession
        key={queue.items[0]?.question._id ?? "empty"}
        items={queue.items}
        totalDue={queue.totalDue}
    />;

}