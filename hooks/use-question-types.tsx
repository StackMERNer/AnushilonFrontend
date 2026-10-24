import { apiClient } from "@/lib/api/api-client";
import { getAcademicService } from "@/services/academic.service";
import { useQuery } from "@tanstack/react-query";
import ms from "ms";

const academicService = getAcademicService(apiClient);
export function useQuestionTypes(chapterId?: string) {
    return useQuery({
        queryKey: ["question-types", chapterId],
        queryFn: async () => {
            if (!chapterId) return [] as { label: string; value: string }[];
            const data = await academicService.getQuestionTypesByChapter(chapterId);
            return data.types;
        },
        staleTime: ms('2h'),
        enabled: !!chapterId
    });
}