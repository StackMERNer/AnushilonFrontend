import { apiClient } from "@/lib/api/api-client";
import { getAcademicService } from "@/services/academic.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const academicService = getAcademicService(apiClient);

export const useClasses = () => {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const data = await academicService.getClasses();
      return data; // Array of IClass
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching
  });
};

export const useAcademicTree = ({
  classId,
  upto = "chapter",
  paperId,
  status,
}: {
  classId?: string;
  upto?: "subject" | "chapter" | "topic";
  paperId?: string;
  status?: "active" | "all";
}) => {
  return useQuery({
    queryKey: ["academic-tree", classId, upto, paperId, status],
    queryFn: async () => {
      const data = await academicService.getAcademicTree({
        classId,
        upto,
        paperId,
        status,
      });
      return data;
    },
    enabled: !!classId, // Only fetch once class is selected
    staleTime: 1000 * 60 * 30, // 30 mins caching
  });
};

export const useSources = ({
  chapterId,
  subjectId,
  questionType,
}: {
  subjectId?: string;
  chapterId?: string;
  questionType?: string | null;
}) => {
  return useQuery({
    queryKey: ["sources", chapterId, subjectId, questionType],
    queryFn: async () => {
      const data = await academicService.getQuestionSources({
        chapterId,
        subjectId,
        questionType,
      });
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
};

// --- MUTATION HOOKS ---

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<any> }) =>
      academicService.updateSubject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-tree"] });
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<any> }) =>
      academicService.updateChapter(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-tree"] });
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<any> }) =>
      academicService.updateTopic(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-tree"] });
    },
  });
};

export const useReorderAcademic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: academicService.reorderAcademic,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["academic-tree"],
      });
    },
  });
};
