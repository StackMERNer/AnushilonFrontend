import { AxiosError, AxiosInstance } from "axios";
import {
  IChapterProgress,
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
    getQueue: (params?: { limit?: number; chapter?: string; topic?: string }) =>
      run<IStudyQueue>(client.get(`${base}/queue`, { params })),
    startNew: (body: { chapterId: string; topicId?: string; count: number }) =>
      run<{ created: number }>(client.post(`${base}/new`, body)),
    submitReview: (body: {
      questionId: string;
      rating: Rating;
      auto?: boolean;
      timeTakenMs?: number;
    }) =>
      run<{ dueAt: string; interval: number; state: string }>(
        client.post(`${base}/review`, body),
      ),
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
