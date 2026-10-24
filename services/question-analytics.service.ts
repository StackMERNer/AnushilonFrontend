// services/question-analytics.service.ts
import type {
  QuestionAnalyticsApiResponse,
  QuestionAnalyticsBreakdownRequest,
  QuestionAnalyticsDashboardRequest,
  QuestionAnalyticsDashboardResponse,
  QuestionAnalyticsFilterOptions,
  QuestionAnalyticsFilterOptionsRequest,
  QuestionAnalyticsQualityReport,
  QuestionAnalyticsQualityRequest,
} from "@/types/analytics/question-analytics";
import type {
  QuestionAnalyticsBreakdownResponse,
  QuestionAnalyticsExamCoverageRequest,
  QuestionAnalyticsExamCoverageResponse,
} from "@/types/analytics/question-analytics.extra.types";
import { AxiosInstance } from "axios";

export function getQuestionAnalyticsService(client: AxiosInstance) {
  const baseUrl = "/analytics/question-analytics";

  const post = async <T>(path: string, body: unknown, signal?: AbortSignal) => {
    const r = await client.post<QuestionAnalyticsApiResponse<T>>(
      `${baseUrl}${path}`,
      body,
      {
        signal,
      },
    );
    return r.data.data;
  };

  return {
    getDashboard: (
      req: QuestionAnalyticsDashboardRequest,
      signal?: AbortSignal,
    ) => post<QuestionAnalyticsDashboardResponse>("/dashboard", req, signal),
    getFilterOptions: (
      req: QuestionAnalyticsFilterOptionsRequest,
      signal?: AbortSignal,
    ) => post<QuestionAnalyticsFilterOptions>("/filter-options", req, signal),
    getBreakdown: (
      req: QuestionAnalyticsBreakdownRequest,
      signal?: AbortSignal,
    ) => post<QuestionAnalyticsBreakdownResponse>("/breakdown", req, signal),
    getQuality: (req: QuestionAnalyticsQualityRequest, signal?: AbortSignal) =>
      post<QuestionAnalyticsQualityReport>("/quality", req, signal),
    getExamCoverage: (
      req: QuestionAnalyticsExamCoverageRequest,
      signal?: AbortSignal,
    ) =>
      post<QuestionAnalyticsExamCoverageResponse>(
        "/exam-coverage",
        req,
        signal,
      ),
  };
}
