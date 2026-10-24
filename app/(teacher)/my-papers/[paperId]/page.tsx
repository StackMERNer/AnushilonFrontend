import FilterDrawerWrapper, { FilterDrawerContent } from "@/components/FilterDrawerWrapper";
import PrintPaperRenderer from "@/components/PrintPaperRenderer";
import PrintQuestionSidebar from "@/components/PrintQuestionSidebar";
import QuestionListSkeleton from "@/components/QuestionListSkeleton";
import { createServerApiClient } from "@/lib/api/api-server";
import { createPaperService } from "@/services/paper.service";
import { Suspense } from "react";

interface SearchParams {
    class?: string;
}
interface PageProps {
    searchParams: Promise<SearchParams>;
    params: Promise<{
        paperId: string;
    }>;
}

const QuestionPaperLoader = async (props: {
    paperId: string;
}) => {
    const serverApi = createServerApiClient();
    const paperService = createPaperService(serverApi);
    const paperResponse = await paperService.getPaperById(props.paperId);
    return <>
        <PrintPaperRenderer paper={paperResponse} />
    </>
}

const ViewPaperPage = async ({ params }: PageProps) => {
    const resolvedParams = await params;
    const { paperId } = resolvedParams;
    return (
        <>
            <FilterDrawerWrapper>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    <main className="flex-1 min-w-0">
                        <Suspense key={JSON.stringify(resolvedParams)} fallback={<QuestionListSkeleton />}>
                            <QuestionPaperLoader paperId={paperId} />
                        </Suspense>
                    </main>
                    <FilterDrawerContent filterTitle="">
                        <PrintQuestionSidebar />
                    </FilterDrawerContent>
                </div>
            </FilterDrawerWrapper>
        </>
    )
}

export default ViewPaperPage