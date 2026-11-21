// hooks/use-active-track.ts
"use client";
import { usePersistentString } from "@/hooks/use-persistent-flag";
import { useUserProfile } from "@/hooks/useUserProfile";

/** "" = all tracks. A stale id (track removed) quietly becomes "all". */
export function useActiveTrack() {
  const { data: user } = useUserProfile();
  const profile = user?.profile;
  const [stored, setStored] = usePersistentString(
    `anushilon:track:${profile?._id ?? "none"}`,
    "",
  );
  const tracks = profile?.tracks ?? [];
  const active = tracks.some((t) => t._id === stored) ? stored : "";
  return [active, setStored, tracks] as const;
}
