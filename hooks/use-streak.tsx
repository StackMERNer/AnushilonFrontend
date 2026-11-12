"use client";
import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import { apiClient } from "@/lib/api/api-client";
import { createDashboardService } from "@/services/dashboard.service";

const service = createDashboardService(apiClient);

export function useStreak() {
    return useQuery({
        queryKey: ["dashboard", "summary"], // shared with useDashboardSummary
        queryFn: service.getSummary,
        staleTime: ms("5m"),
        refetchOnWindowFocus: false,
        select: (d) => ({ streak: d.streak, doneToday: d.reviewedToday > 0 }),
    });
}