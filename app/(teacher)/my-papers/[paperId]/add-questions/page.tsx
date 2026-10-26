import { Suspense } from "react";
import QuestionFilterSidebar from "@/components/QuestionFilterSidebar";
import FilterDrawerWrapper, { FilterDrawerContent } from "@/components/FilterDrawerWrapper";
import QuestionList from "@/components/QuestionList";
import QuestionListSkeleton from "@/components/QuestionListSkeleton";
import { createQuestionBankService } from "@/services/question-bank.service";
import { createServerApiClient } from "@/lib/api/api-server";
import { createPaperService } from "@/services/paper.service";
import { IPopulatedQuestionPaper } from "@/types/question-paper";
import FreshDataGate from "@/components/FreshDataGate";


interface SearchParams {
    class?: string;
    subject?: string;
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
        paperId: string;
    }>;
}

async function QuestionListLoader(props: {
    paperId: string;
    subjectId: string;
    chapterId: string;
    topicIds: string[];
    boardIds: string[];
    schoolIds: string[];
    year?: number;
    type?: string;
    selectedOnly?: string;
    page: number;
    classId: string;
}) {
    const serverClient = createServerApiClient();
    const questionService = createQuestionBankService(serverClient);
    const paperService = createPaperService(serverClient);

    // Fetch both questions and current paper state concurrently
    const [questionsResponse, paperData] = await Promise.all([
        questionService.getFilteredQuestions({
            page: props.page,
            paper: props.paperId,
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
        paperService.getPaperById(props.paperId).catch(() => ({ sections: [] } as Partial<IPopulatedQuestionPaper>)),
    ]);

    // Normalize initial selected IDs (handles string IDs or populated objects)
    const initialSelectedIds = paperData.sections?.map((section) =>
        section.items
            .filter((item) => item.type === "question")
            .map((item) => (item).question?._id)
    ).flat().filter(Boolean) as string[];


    return (
        <FreshDataGate>
            <QuestionList
                key={paperData.updatedAt?.toString()}
                paperId={props.paperId}
                initialSelectedIds={initialSelectedIds}
                questions={questionsResponse.items}
                total={questionsResponse.totalItems}
                totalPages={questionsResponse.totalPages}
                currentPage={props.page}
                resetParams={{
                    subjectId: props.subjectId,
                    chapterId: props.chapterId,
                    classId: props.classId,
                }}
            /></FreshDataGate>
    );
}

export default async function CreateQuestionPaperPage({ searchParams, params }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const { paperId } = await params;
    const classId = resolvedSearchParams.class ?? "";

    const selectedCubjectId = resolvedSearchParams.subject || "";
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
                            paperId={paperId}
                            subjectId={selectedCubjectId}
                            chapterId={selectedChapterId}
                            topicIds={topicIds}
                            boardIds={boardIds}
                            schoolIds={schoolIds}
                            year={year}
                            type={type}
                            page={page}
                            classId={classId}
                            selectedOnly={selectedOnly}
                        />
                    </Suspense>
                </main>

                {/* Desktop Sidebar / Mobile Drawer Content */}
                <FilterDrawerContent filterTitle="ফিল্টার করুন">
                    <QuestionFilterSidebar
                        classId={classId}
                        boards={[]}
                        paperId={paperId}
                        selectedSubject={selectedCubjectId}
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