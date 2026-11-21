import { AxiosError, AxiosInstance } from "axios";
import {
  IChapterProgress,
  IReviewResult,
  IStudyQueue,
  ITopicProgress,
  Rating,
} from "@/types/study";

const msg = (e: unknown) =>
  (e as AxiosError<{ message: string }>).response?.data?.message ??
  (e as Error).message;

export function createStudyService(client: AxiosInstance) {
  const base = "/study";
  const run = async <T>(p: Promise<{ data: T }>) => {
    try {
      return (await p).data;
    } catch (e) {
      throw new Error(msg(e));
    }
  };
  return {
    getQueue: (params?: {
      limit?: number;
      chapter?: string;
      topic?: string;
      types?: string;
      scope?: string;
    }) => run<IStudyQueue>(client.get(`${base}/queue`, { params })),
    startNew: (body: {
      chapterId: string;
      topicId?: string;
      count: number;
      types?: string[];
    }) => run<{ created: number }>(client.post(`${base}/new`, body)),
    getDueCount: () => run<{ count: number }>(client.get(`${base}/count`)),
    submitReview: (body: {
      questionId: string;
      rating: Rating;
      auto?: boolean;
      timeTakenMs?: number;
    }) => run<IReviewResult>(client.post(`${base}/review`, body)),
    getSubjectProgress: (subjectId: string) =>
      run<IChapterProgress[]>(
        client.get(`${base}/progress/subject/${subjectId}`),
      ),
    getChapterProgress: (chapterId: string) =>
      run<ITopicProgress[]>(
        client.get(`${base}/progress/chapter/${chapterId}`),
      ),
  };
}
