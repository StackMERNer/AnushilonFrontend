import { AxiosError, AxiosInstance } from "axios";

export function createQuestionFeedbackService(client: AxiosInstance) {
  const run = async <T>(p: Promise<{ data: T }>) => {
    try {
      return (await p).data;
    } catch (e) {
      throw new Error(
        (e as AxiosError<{ message: string }>).response?.data?.message ??
          (e as Error).message,
      );
    }
  };
  return {
    addBookmark: (questionId: string) =>
      run<{ isBookmarked: true }>(client.post("/bookmarks", { questionId })),
    removeBookmark: (questionId: string) =>
      run<{ isBookmarked: false }>(client.delete(`/bookmarks/${questionId}`)),
    reportQuestion: (body: {
      questionId: string;
      reasons: string[];
      message?: string;
    }) => run<{ ok: true }>(client.post("/reports", body)),
  };
}
