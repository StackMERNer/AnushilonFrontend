import { apiClient } from "@/lib/api/api-client";
import { createUserService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";
export interface IDashboardRecentPaper {
    _id: string;
    title: string;
    totalMarks: number;
    duration: number;
    createdAt: string;

    class?: {
        _id: string;
        name: string;
    };

    subjects: {
        subject: {
            _id: string;
            name: string;
        };
        chapters: string[];
    }[];
}

export interface IDashboardData {
    totalPapers: number;
    thisMonthPapers: number;
    lastMonthPapers: number;
    recentPapers: IDashboardRecentPaper[];
}
export function useDashboard() {
    const userService = createUserService(apiClient);
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            return (await userService.getDashboard()).data;
        },
    });
}