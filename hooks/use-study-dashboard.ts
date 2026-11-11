"use client";
import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import { apiClient } from "@/lib/api/api-client";
import { createDashboardService } from "@/services/dashboard.service";

const service = createDashboardService(apiClient);

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: service.getSummary,
    staleTime: ms("30s"),
  });

export const useDashboardSubjects = () =>
  useQuery({
    queryKey: ["dashboard", "subjects"],
    queryFn: service.getSubjects,
    staleTime: ms("30s"),
  });
