// hooks/useQuestionAnalytics.ts
import { apiClient } from "@/lib/api/api-client";
import { getQuestionAnalyticsService } from "@/services/question-analytics.service";
import type {
  QuestionAnalyticsBreakdownRequest,
  QuestionAnalyticsDashboardRequest,
  QuestionAnalyticsFilterOptionsRequest,
  QuestionAnalyticsQualityRequest,
} from "@/types/analytics/question-analytics";
import type { QuestionAnalyticsExamCoverageRequest } from "@/types/analytics/question-analytics.extra.types";
import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import { useEffect, useState } from "react";

const service = getQuestionAnalyticsService(apiClient);
const staleTime = ms("2m");
// keep showing the previous result while new filters load (no flicker)
const keep = (prev: any) => prev;

export function useDebounced<T>(value: T, delay = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function useQuestionAnalyticsDashboard(
  req: QuestionAnalyticsDashboardRequest,
) {
  return useQuery({
    queryKey: ["question-analytics", "dashboard", req],
    queryFn: ({ signal }) => service.getDashboard(req, signal),
    staleTime,
    placeholderData: keep,
  });
}

export function useQuestionAnalyticsFilterOptions(
  req: QuestionAnalyticsFilterOptionsRequest,
) {
  return useQuery({
    queryKey: ["question-analytics", "filter-options", req],
    queryFn: ({ signal }) => service.getFilterOptions(req, signal),
    staleTime,
    placeholderData: keep,
  });
}

export function useQuestionAnalyticsBreakdown(
  req: QuestionAnalyticsBreakdownRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: ["question-analytics", "breakdown", req],
    queryFn: ({ signal }) => service.getBreakdown(req, signal),
    staleTime,
    enabled,
    placeholderData: keep,
  });
}

export function useQuestionAnalyticsQuality(
  req: QuestionAnalyticsQualityRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: ["question-analytics", "quality", req],
    queryFn: ({ signal }) => service.getQuality(req, signal),
    staleTime,
    enabled,
    placeholderData: keep,
  });
}

export function useQuestionAnalyticsExamCoverage(
  req: QuestionAnalyticsExamCoverageRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: ["question-analytics", "exam-coverage", req],
    queryFn: ({ signal }) => service.getExamCoverage(req, signal),
    staleTime,
    enabled,
    placeholderData: keep,
  });
}
