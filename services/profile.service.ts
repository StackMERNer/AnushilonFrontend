// services/profile.service.ts
import { AxiosError, AxiosInstance } from "axios";
import { IProfile } from "@/types/profile";

export type TrackInput = {
  name?: string;
  class?: string;
  stream?: string;
  version?: string;
  subjects?: string[];
};

export function createProfileService(client: AxiosInstance) {
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
  //   type TrackInput = {
  //     name?: string;
  //     class?: string;
  //     stream?: string;
  //     version?: string;
  //     subjects?: string[];
  //   };
  return {
    list: () =>
      run<{ items: IProfile[]; maxProfiles: number }>(client.get("/profiles")),
    options: () =>
      run<{
        classes: { _id: string; name: string }[];
        streams: string[];
        versions: string[];
        subjects: {
          _id: string;
          name: string;
          classId: string;
          className: string;
          classOrder: number;
          stream?: string;
          version?: string[];
        }[];
      }>(client.get("/profiles/options")),
    create: (body: { name: string; track: TrackInput }) =>
      run<IProfile>(client.post("/profiles", body)),
    rename: (id: string, name: string) =>
      run<IProfile>(client.patch(`/profiles/${id}`, { name })),
    archive: (id: string) =>
      run<{ ok: true }>(client.delete(`/profiles/${id}`)),
    addTrack: (id: string, t: TrackInput) =>
      run<IProfile>(client.post(`/profiles/${id}/tracks`, t)),
    updateTrack: (id: string, trackId: string, t: TrackInput) =>
      run<IProfile>(client.patch(`/profiles/${id}/tracks/${trackId}`, t)),
    removeTrack: (id: string, trackId: string) =>
      run<IProfile>(client.delete(`/profiles/${id}/tracks/${trackId}`)),
  };
}
