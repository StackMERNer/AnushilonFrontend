import { apiClient } from "@/lib/api/api-client";
import { createStudyService } from "@/services/study.service";
import { useQuery } from "@tanstack/react-query";

// export function useDueCount() {
//   const study = createStudyService(apiClient);
//   return useQuery({
//     queryKey: ["due-count"],
//     queryFn: study.getDueCount,
//     retry: 2,
//   });
// }

import { createDashboardService } from "@/services/dashboard.service";
import ms from "ms";

const service = createDashboardService(apiClient);

export function useDueCount() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: service.getSummary,
    staleTime: ms("1m"),
    select: (d) => ({ count: d.dueCount }), // same shape the Sidebar already reads
  });
}
