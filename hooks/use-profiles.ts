"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ms from "ms";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/api-client";
import { createProfileService, TrackInput } from "@/services/profile.service";

export const profileService = createProfileService(apiClient);

export const useProfiles = () =>
  useQuery({
    queryKey: ["profiles"],
    queryFn: profileService.list,
    staleTime: ms("5m"),
  });

export const useProfileOptions = () =>
  useQuery({
    queryKey: ["profile-options"],
    queryFn: profileService.options,
    staleTime: ms("30m"),
  });

export function useProfileActions() {
  const qc = useQueryClient();
  const o = {
    onSuccess: () =>
      Promise.all(
        ["profiles", "user-profile", "academic-tree", "dashboard"].map((k) =>
          qc.invalidateQueries({ queryKey: [k] }),
        ),
      ),
    onError: (e: Error) => toast.error(e.message),
  };
  return {
    create: useMutation({
      mutationFn: (v: { name: string; track: TrackInput }) =>
        profileService.create(v),
      ...o,
    }),
    rename: useMutation({
      mutationFn: (v: { id: string; name: string }) =>
        profileService.rename(v.id, v.name),
      ...o,
    }),
    archive: useMutation({
      mutationFn: (id: string) => profileService.archive(id),
      ...o,
    }),
    addTrack: useMutation({
      mutationFn: (v: { id: string; input: TrackInput }) =>
        profileService.addTrack(v.id, v.input),
      ...o,
    }),
    updateTrack: useMutation({
      mutationFn: (v: { id: string; trackId: string; input: TrackInput }) =>
        profileService.updateTrack(v.id, v.trackId, v.input),
      ...o,
    }),
    removeTrack: useMutation({
      mutationFn: (v: { id: string; trackId: string }) =>
        profileService.removeTrack(v.id, v.trackId),
      ...o,
    }),
  };
}
