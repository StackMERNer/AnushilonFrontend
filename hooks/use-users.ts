import { apiClient } from "@/lib/api/api-client";
import { createUserService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export function useUsers(page = 1, limit = 20) {
  const userService = createUserService(apiClient);

  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => userService.getUsers(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useUserByEmailOrId(emailOrId: string) {
  const userService = createUserService(apiClient);

  return useQuery({
    queryKey: ["user", emailOrId],
    queryFn: () => userService.getUserByEmailOrId(emailOrId),
    placeholderData: (previousData) => previousData,
  });
}
