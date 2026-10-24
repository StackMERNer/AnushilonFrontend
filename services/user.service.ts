import { IDashboardData } from "@/hooks/use-dashboard";
import { PaginatedResponse } from "@/types/pagination";
import { IUser } from "@/types/user";
import { AxiosInstance } from "axios";

export function createUserService(client: AxiosInstance) {
  return {
    getMe: () => client.get<IUser>("/auth/me").then((r) => r.data),
    updateProfile: (data: Partial<IUser>) =>
      client.patch<IUser>("/auth/me", data).then((r) => r.data),
    getDashboard: () =>
      client.get<{ data: IDashboardData }>("/dashboard").then((r) => r.data),
    getUsers: (page = 1, limit = 20) =>
      client
        .get<PaginatedResponse<IUser>>("/users", {
          params: { page, limit },
        })
        .then((r) => r.data),
    getUserByEmailOrId: (emailOrId: string) =>
      client.get<IUser>(`/users/${emailOrId}`).then((r) => r.data),
  };
}
