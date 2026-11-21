// types/profile.ts
export interface ITrack {
  _id: string;
  name?: string;
  class?: { _id: string; name: string; order: number };
  stream?: "science" | "commerce" | "humanities";
  version?: string;
  subjects?: { _id: string; name: string }[];
}
export interface IProfile {
  _id: string;
  name: string;
  isDefault: boolean;
  tracks: ITrack[];
}
