import { PaginatedResponse } from "@/types/pagination";
import { IFilterdQuestion } from "@/types/question";
import { AxiosError, AxiosInstance } from "axios";
export function createQuestionBankService(client: AxiosInstance) {
  const baseUrl = "/question-bank";
  return {
    getFilteredQuestions: async (filters: {
      page: number;
      selectedSubject: string;
      selectedChapter: string;
      selectedTopics: string;
      selectedBoards: string;
      selectedSchools: string;
      selectedUniversities: string;
      questionType?: string;
      year?: number;
      selectedOnly?: boolean;
    }) => {
      try {
        const response = await client.get<PaginatedResponse<IFilterdQuestion>>(
          `${baseUrl}/filtered`,
          {
            params: {
              page: filters.page,
              subject: filters.selectedSubject,
              chapter: filters.selectedChapter,
              topics: filters.selectedTopics,
              boards: filters.selectedBoards,
              schools: filters.selectedSchools,
              universities: filters.selectedUniversities,
              questionType: filters.questionType,
              year: filters.year,
              selectedOnly: filters.selectedOnly,
            },
          },
        );
        return response.data;
      } catch (error: any) {
        const errorMessage =
          (error as AxiosError<{ message: string }>).response?.data?.message ??
          error.message;
        throw new Error(errorMessage);
      }
    },
  };
}
