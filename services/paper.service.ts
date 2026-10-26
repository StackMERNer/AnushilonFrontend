import { PaginatedResponse } from "@/types/pagination";
import {
  IFilterdPaper,
  IPopulatedQuestionPaper,
  IQuestionPaper,
} from "@/types/question-paper";
import { AxiosInstance } from "axios";

export function createPaperService(client: AxiosInstance) {
  const baseUrl = "/question-papers";
  return {
    getPaginatedPapers: async ({
      page,
      class: classId,
      subject,
      chapter,
    }: {
      page: number;
      class?: string;
      subject?: string;
      chapter?: string;
    }) => {
      const params = new URLSearchParams();
      params.append("page", String(page));

      if (classId) params.append("class", classId);
      if (subject) params.append("subject", subject);
      if (chapter && chapter.length > 0) {
        params.append("chapter", chapter);
      }

      const r = await client.get<PaginatedResponse<IFilterdPaper>>(
        `${baseUrl}?${params.toString()}`,
      );
      return r.data;
    },
    getPaperById: (id: string) =>
      client
        .get<IPopulatedQuestionPaper>(`${baseUrl}/${id}`)
        .then((r) => r.data),
    createPaper: (data: IQuestionPaper) =>
      client.post<IQuestionPaper>(`${baseUrl}/`, data).then((r) => r.data),
    updatePaperInfo: (id: string, data: Partial<IQuestionPaper>) =>
      client
        .patch<IQuestionPaper>(`${baseUrl}/${id}`, data)
        .then((r) => r.data),
    deletePaper: (id: string) => client.delete(`${baseUrl}/${id}`),
    updatePaperQuestions: (id: string, questions: string[]) =>
      client.patch(`${baseUrl}/${id}/questions`, questions),

    // Add or remove a single question dynamically
    toggleQuestionInPaper: async (paperId: string, questionId: string) => {
      const { data } = await client.patch(
        `${baseUrl}/${paperId}/toggle-question`,
        {
          questionId,
        },
      );
      return data;
    },
  };
}
