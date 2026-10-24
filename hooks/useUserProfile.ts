"use client";
import { apiClient } from "@/lib/api/api-client";
import { createUserService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";
import ms from "ms";
export function useUserProfile() {
  const userService = createUserService(apiClient);
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      return await userService.getMe();
    },
    staleTime: ms("5m"),
    gcTime: ms("1h"),
    refetchOnWindowFocus: false,
  });
}
