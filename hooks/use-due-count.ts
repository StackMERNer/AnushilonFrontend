import { apiClient } from "@/lib/api/api-client";
import { createStudyService } from "@/services/study.service";
import { useQuery } from "@tanstack/react-query";

export function useDueCount() {
  const study = createStudyService(apiClient);
  return useQuery({
    queryKey: ["due-count"],
    queryFn: study.getDueCount,
    retry: 2,
  });
}
