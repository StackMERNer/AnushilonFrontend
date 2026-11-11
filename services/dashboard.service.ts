import { AxiosError, AxiosInstance } from "axios";
import { IDashboardSubject, IDashboardSummary } from "@/types/dashboard";

export function createDashboardService(client: AxiosInstance) {
  const base = "/dashboard";
  const run = async <T>(p: Promise<{ data: T }>) => {
    try {
      return (await p).data;
    } catch (e) {
      throw new Error(
        (e as AxiosError<{ message: string }>).response?.data?.message ??
          (e as Error).message,
      );
    }
  };
  return {
    getSummary: () => run<IDashboardSummary>(client.get(`${base}/summary`)),
    getSubjects: () => run<IDashboardSubject[]>(client.get(`${base}/subjects`)),
  };
}
