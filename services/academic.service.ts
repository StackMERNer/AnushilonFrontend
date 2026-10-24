import {
  IBoard,
  IClass,
  ISchool,
  ISubject,
  PopulatedSubject,
} from "@/types/academic";
import { AxiosInstance } from "axios";

interface IAcademicTreeRespponse {
  items: PopulatedSubject[];
}

export function getAcademicService(client: AxiosInstance) {
  const baseUrl = "/academic";
  return {
    getClasses: async () => {
      const r = await client.get<IClass[]>(`${baseUrl}/classes`);
      return r.data;
    },
    getAcademicTree: async ({
      classId,
      upto = "chapter",
      paperId,
      status = "active",
    }: {
      classId?: string;
      upto?: "subject" | "chapter" | "topic";
      paperId?: string;
      status?: "active" | "all";
    }) => {
      const r = await client.get<IAcademicTreeRespponse>(
        `${baseUrl}/academic-tree`,
        {
          params: { classId, upto, paperId, status },
        },
      );
      return r.data.items;
    },
    updateSubject: async (id: string, payload: Partial<any>) => {
      const r = await client.patch(`${baseUrl}/subjects/${id}`, payload);
      return r.data;
    },
    updateChapter: async (id: string, payload: Partial<any>) => {
      const r = await client.patch(`${baseUrl}/chapters/${id}`, payload);
      return r.data;
    },
    updateTopic: async (id: string, payload: Partial<any>) => {
      const r = await client.patch(`${baseUrl}/topics/${id}`, payload);
      return r.data;
    },
    getQuestionSources: async ({
      classId,
      subjectId,
      chapterId,
      questionType,
    }: {
      classId?: string;
      subjectId?: string;
      chapterId?: string;
      questionType?: string | null;
    }) => {
      const r = await client.get<{
        boards: IBoard[];
        schools: ISchool[];
        boardYears: number[];
      }>(
        `${baseUrl}/sources?classId=${classId}&subjectId=${subjectId}&chapterId=${chapterId}&questionType=${questionType}`,
      );
      return r.data;
    },
    getQuestionTypesByChapter: async (chapterId: string) => {
      const r = await client.get<{ types: { label: string; value: string }[] }>(
        `${baseUrl}/question-types-by-chapter`,
        { params: { chapterId } },
      );
      return r.data;
    },
    reorderAcademic: async ({
      type,
      parentId,
      orderedIds,
    }: {
      type: "subject" | "chapter" | "topic";
      parentId: string;
      orderedIds: string[];
    }) => {
      const r = await client.patch(`${baseUrl}/reorder`, {
        type,
        parentId,
        orderedIds,
      });

      return r.data;
    },
  };
}
