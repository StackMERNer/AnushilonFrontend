import { createStudyService } from "@/services/study.service";
import StudySession from "@/components/study/study-session";
import { createServerApiClient } from "@/lib/api/api-server";
import FunLayer from "@/components/fun/fun-layer";
import ReviewScopeBar from "@/components/study/review-scope-bar";

export default async function ReviewPage({
    searchParams,
}: {
    searchParams: Promise<{ subject?: string; chapter?: string; topic?: string, types?: string, scope: string, }>;
}) {
    const { subject, chapter, topic, types, scope } = await searchParams;
    const study = createStudyService(createServerApiClient());
    const all = scope === "all";
    const queue = await study.getQueue({ limit: 30, chapter, topic, types, scope: all ? "all" : undefined });

    return <>
        <ReviewScopeBar
            scope={all ? "all" : "track"}
            totalDue={queue.totalDue}
            totalDueAll={queue.totalDueAll}
            explicit={!!(chapter || topic)}
        />
        <StudySession
            key={queue.items[0]?.question._id ?? "empty"}
            items={queue.items}
            totalDue={queue.totalDue}
            homeHref={subject ? `/browse/${subject}` : "/browse"}
        />
        <FunLayer />
    </>;

}