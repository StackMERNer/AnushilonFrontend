import { PaginatedResponse } from "@/types/pagination";
import { AxiosInstance } from "axios";
import { IContentNode } from "./content-node.service";
export type tagType =
  | "guide"
  | "main_book"
  | "lecture_sheet"
  | "main_book_solved"
  | "others";
export interface IContent {
  _id?: string;
  title?: string;
  description?: string;
  url: string;
  contentNode: string;
  type: "pdf" | "docx";
  tags: tagType[];
}
export interface IFilteredContent extends Omit<IContent, "contentNode"> {
  contentNode: IContentNode;
}

export const createContentService = (apiClient: AxiosInstance) => ({
  async getFilesByNodeId(
    nodeId: string,
    page = 1,
  ): Promise<PaginatedResponse<IFilteredContent>> {
    const response = await apiClient.get(`/contents/${nodeId}?page=${page}`);
    return response.data;
  },

  async createContent(data: Omit<IContent, "_id">): Promise<IFilteredContent> {
    const response = await apiClient.post("/contents", data);
    return response.data;
  },
});
