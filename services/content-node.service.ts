import { AxiosInstance } from "axios";

export interface IContentNode {
  _id?: string;
  name: string;
  parent?: string | null;
  children?: string[];
  order?: number;
  isActive?: boolean;
  creator?: string;
  descendantIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export function createContentNodeService(client: AxiosInstance) {
  const baseUrl = "/content-nodes";
  return {
    getContentNodes: async () => {
      const r = await client.get<IContentNode[]>(`${baseUrl}`);
      return r.data;
    },
    getContentNodeById: async (id: string) => {
      const r = await client.get<IContentNode>(`${baseUrl}/${id}`);
      return r.data;
    },
    createContentNode: async (data: Partial<IContentNode>) => {
      const r = await client.post<IContentNode>(`${baseUrl}`, data);
      return r.data;
    },
    updateContentNode: async (id: string, data: Partial<IContentNode>) => {
      const r = await client.patch<IContentNode>(`${baseUrl}/${id}`, data);
      return r.data;
    },
    reorderNodes: async (nodes: { _id: string; order: number }[]) => {
      const r = await client.put(`${baseUrl}/reorder`, { nodes });
      return r.data;
    },
    getRootContentNodes: async () => {
      const r = await client.get<IContentNode[]>(`${baseUrl}?parentId=null`);
      return r.data;
    },
    getContentNode: async (id: string) => {
      const r = await client.get<IContentNode>(`${baseUrl}/${id}`);
      return r.data;
    },
  };
}
