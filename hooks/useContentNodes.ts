import { apiClient } from "@/lib/api/api-client";
import { createContentNodeService } from "@/services/content-node.service";
import { useQuery } from "@tanstack/react-query";

const contentService = createContentNodeService(apiClient);

export const useContentNodes = () => {
  return useQuery({
    queryKey: ["content-nodes"],
    queryFn: async () => {
      return await contentService.getContentNodes();
    },
    staleTime: 1000 * 60 * 30, // 30 mins caching
  });
};
