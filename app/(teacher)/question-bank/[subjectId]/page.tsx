import { Suspense } from "react";
import QuestionFilterSidebar from "@/components/QuestionFilterSidebar";
import FilterDrawerWrapper, { FilterDrawerContent } from "@/components/FilterDrawerWrapper";
import QuestionList from "@/components/QuestionList";
import QuestionListSkeleton from "@/components/QuestionListSkeleton";
import { createQuestionBankService } from "@/services/question-bank.service";
import { createServerApiClient } from "@/lib/api/api-server";
import FreshDataGate from "@/components/FreshDataGate";


interface SearchParams {
    chapter?: string;
    topics?: string;
    boards?: string;
    schools?: string;
    year?: string;
    type?: string;
    page?: string;
    selectedOnly?: string;
}

interface PageProps {
    searchParams: Promise<SearchParams>;
    params: Promise<{
        subjectId: string;
    }>;
}

async function QuestionListLoader(props: {
    subjectId: string;
    chapterId: string;
    topicIds: string[];
    boardIds: string[];
    schoolIds: string[];
    year?: number;
    type?: string;
    selectedOnly?: string;
    page: number;
}) {
    const serverClient = createServerApiClient();
    const questionBankService = createQuestionBankService(serverClient);

    // Fetch both questions and current paper state concurrently
    const [questionsResponse] = await Promise.all([
        questionBankService.getFilteredQuestions({
            page: props.page,
            questionType: props.type || undefined,
            selectedSubject: props.subjectId,
            selectedChapter: props.chapterId,
            selectedTopics: props.topicIds.join(","),
            selectedBoards: props.boardIds.join(","),
            selectedSchools: props.schoolIds.join(","),
            selectedUniversities: "",
            year: props.year,
            selectedOnly: props.selectedOnly === "true",
        }),
        // paperService.getPaperById(props.paperId).catch(() => ({ sections: [] } as Partial<IPopulatedQuestionPaper>)),
    ]);

    return (
        <FreshDataGate>
            <QuestionList
                questions={questionsResponse.items}
                total={questionsResponse.totalItems}
                totalPages={questionsResponse.totalPages}
                questionType={props.type}
                currentPage={props.page}
                resetParams={{
                    subjectId: props.subjectId,
                    chapterId: props.chapterId,
                }}
            />
        </FreshDataGate>
    );
}

export default async function CreateQuestionPaperPage({ searchParams, params }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const { subjectId } = await params;
    const selectedChapterId = resolvedSearchParams.chapter || "";
    const topicIds = resolvedSearchParams.topics?.split(",").filter(Boolean) ?? [];
    const boardIds = resolvedSearchParams.boards?.split(",").filter(Boolean) ?? [];
    const schoolIds = resolvedSearchParams.schools?.split(",").filter(Boolean) ?? [];
    const year = resolvedSearchParams.year ? Number(resolvedSearchParams.year) : undefined;
    const type = resolvedSearchParams.type;
    const page = Number(resolvedSearchParams.page ?? 1);
    const selectedOnly = resolvedSearchParams.selectedOnly;

    return (
        <FilterDrawerWrapper>
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Main content area */}
                <main className="flex-1 min-w-0 px-2 sm:px-4">
                    <Suspense
                        key={JSON.stringify(resolvedSearchParams)}
                        fallback={<QuestionListSkeleton />}
                    >
                        <QuestionListLoader
                            subjectId={subjectId}
                            chapterId={selectedChapterId}
                            topicIds={topicIds}
                            boardIds={boardIds}
                            schoolIds={schoolIds}
                            year={year}
                            type={type}
                            page={page}
                            selectedOnly={selectedOnly}
                        />
                    </Suspense>
                </main>

                {/* Desktop Sidebar / Mobile Drawer Content */}
                <FilterDrawerContent filterTitle="ফিল্টার করুন">
                    <QuestionFilterSidebar
                        boards={[]}
                        selectedSubject={subjectId}
                        selectedChapter={selectedChapterId}
                        selectedTopics={topicIds}
                        selectedBoards={boardIds}
                        selectedSchools={schoolIds}
                        selectedYear={year}
                    />
                </FilterDrawerContent>
            </div>
        </FilterDrawerWrapper>
    );
}