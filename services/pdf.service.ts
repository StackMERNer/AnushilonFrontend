import { AxiosError, AxiosInstance } from "axios";
import type { CardQuestion } from "@/components/QuestionCard";
import type { PaginatedResponse } from "@/types/pagination";

export type PdfRect = { x: number; y: number; w: number; h: number };
export interface IPdfAnchor {
  _id: string;
  page: number;
  rect: PdfRect;
  count: number;
  questions?: string[]; // only present in admin responses
}
export interface IPdfBookItem {
  _id: string;
  title: string;
  createdAt: string;
  subject: { _id: string; name: string };
  chapter: { _id: string; name: string };
}
export interface IPdfBook {
  _id: string;
  title: string;
  subject: { _id: string; name: string };
  chapter: { _id: string; name: string };
  version: { _id: string; number: number; fileUrl: string };
}

const msg = (e: unknown) =>
  (e as AxiosError<{ message?: string; error?: string }>).response?.data
    ?.message ??
  (e as AxiosError<{ error?: string }>).response?.data?.error ??
  (e as Error).message;

export function createPdfService(client: AxiosInstance) {
  const run = async <T>(p: Promise<{ data: T }>) => {
    try {
      return (await p).data;
    } catch (e) {
      throw new Error(msg(e));
    }
  };
  return {
    // student
    listBooks: (params: {
      subject?: string;
      chapter?: string;
      page?: number;
      limit?: number;
    }) =>
      run<PaginatedResponse<IPdfBookItem>>(
        client.get("/pdf/books", { params }),
      ),
    getBook: (id: string) => run<IPdfBook>(client.get(`/pdf/books/${id}`)),
    getAnchors: (version: string) =>
      run<IPdfAnchor[]>(client.get("/pdf/anchors", { params: { version } })),
    getAnchorQuestions: (anchorId: string) =>
      run<{ questions: CardQuestion[] }>(
        client.get(`/pdf/anchors/${anchorId}/questions`),
      ),

    // admin
    createBook: (body: {
      title: string;
      subject: string;
      chapter: string;
      fileUrl: string;
    }) => run<{ _id: string }>(client.post("/pdf/books", body)),
    getAdminAnchors: (version: string) =>
      run<IPdfAnchor[]>(client.get("/pdf/anchors", { params: { version } })),
    getQuestions: (ids: string[]) =>
      run<{ questions: CardQuestion[] }>(
        client.post("/pdf/questions", { ids }),
      ),
    lookup: (tokens: string[]) =>
      run<{ questions: CardQuestion[]; notFound: string[] }>(
        client.post("/pdf/lookup", { tokens }),
      ),
    resolveIds: (exportId: string, text: string) =>
      run<{ questions: CardQuestion[]; unknown: number[] }>(
        client.post("/pdf/resolve-ids", { exportId, text }),
      ),
    createAnchor: (body: {
      version: string;
      page: number;
      rect: PdfRect;
      questions: string[];
    }) => run<IPdfAnchor>(client.post("/pdf/anchors", body)),
    updateAnchor: (
      id: string,
      body: { rect?: PdfRect; questions?: string[] },
    ) => run<IPdfAnchor>(client.patch(`/pdf/anchors/${id}`, body)),
    deleteAnchor: (id: string) =>
      run<{ ok: true }>(client.delete(`/pdf/anchors/${id}`)),
  };
}
