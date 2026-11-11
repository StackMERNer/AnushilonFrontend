import { createStudyService } from "@/services/study.service";
import StudySession from "@/components/study/study-session";
import { createServerApiClient } from "@/lib/api/api-server";

export default async function ReviewPage({
    searchParams,
}: {
    searchParams: Promise<{ subject?: string; chapter?: string; topic?: string, types?: string }>;
}) {
    const { subject, chapter, topic, types } = await searchParams;
    const study = createStudyService(createServerApiClient());
    const queue = await study.getQueue({ limit: 30, chapter, topic, types });

    return <StudySession
        key={queue.items[0]?.question._id ?? "empty"}
        items={queue.items}
        totalDue={queue.totalDue}
        homeHref={subject ? `/browse/${subject}` : "/browse"}
    />;

}