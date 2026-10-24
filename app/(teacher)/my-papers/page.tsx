import FilterDrawerWrapper, { FilterDrawerContent } from "@/components/FilterDrawerWrapper";
import PaperFilterSidebar from "@/components/PaperFilterSidebar";
import QuestionPaperList from "@/components/PaperList";
import QuestionListSkeleton from "@/components/QuestionListSkeleton";
import { createServerApiClient } from "@/lib/api/api-server";
import { createPaperService } from "@/services/paper.service";
import { IFilterdPaper } from "@/types/question-paper";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "আমার প্রশ্নপত্র",
};

const QuestionPapersLoader = async (props: {
    subjectId: string;
    chapterId: string;
    year?: number;
    type?: string;
    page: number;
    classId?: string;
}) => {
    let papers: IFilterdPaper[] = [];
    const serverApi = createServerApiClient();
    const paperService = createPaperService(serverApi);
    const response = await paperService.getPaginatedPapers({ page: props.page, chapter: props.chapterId, subject: props.subjectId, class: props.classId });
    papers = response?.items || [];

    return (
        <QuestionPaperList papers={papers} currentPage={response.currentPage} total={response.totalItems} totalPages={response.totalPages} />
    );
};

interface SearchParams {
    class?: string;
    subject?: string;
    chapter?: string;
    topics?: string;
    boards?: string;
    year?: string;
    type?: string;
    page?: string;
}
interface PageProps {
    searchParams: Promise<SearchParams>;
    params: Promise<{
        paperId: string;
    }>;
}

const MyPapersPage = async ({ searchParams, params }: PageProps) => {
    const resolvedSearchParams = await searchParams;
    const { paperId } = await params;
    const classId = resolvedSearchParams.class;
    const subjectId = resolvedSearchParams.subject ?? '';
    const chapterId = resolvedSearchParams.chapter ?? '';
    const topicIds = resolvedSearchParams.topics?.split(",").filter(Boolean) ?? [];
    const boardIds = resolvedSearchParams.boards?.split(",").filter(Boolean) ?? [];
    const year = resolvedSearchParams.year ? Number(resolvedSearchParams.year) : undefined;
    const type = resolvedSearchParams.type;
    const page = Number(resolvedSearchParams.page ?? 1);
    // 3. Main content UI
    return (
        <FilterDrawerWrapper>
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Main content area */}
                <main className="flex-1 min-w-0 px-2 sm:px-4">
                    <Suspense
                        key={JSON.stringify(resolvedSearchParams)}
                        fallback={<QuestionListSkeleton />}
                    >
                        <QuestionPapersLoader
                            subjectId={subjectId}
                            chapterId={chapterId}
                            year={year}
                            type={type}
                            page={page}
                            classId={classId}
                        />
                    </Suspense>
                </main>

                {/* Desktop Sidebar / Mobile Drawer Content */}
                <FilterDrawerContent filterTitle="ফিল্টার">
                    <PaperFilterSidebar
                        boards={[]}
                        classId={classId}
                        paperId={paperId}
                        selectedSubjectId={subjectId}
                        selectedChapterId={chapterId}
                        selectedTopics={topicIds}
                        selectedBoards={boardIds}
                    />
                </FilterDrawerContent>
            </div>
        </FilterDrawerWrapper>
    );
};

export default MyPapersPage;