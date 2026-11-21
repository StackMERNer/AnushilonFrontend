"use client";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  recallTrack,
  rememberTrack,
  setProfileIdClient,
  setTrackIdClient,
} from "@/lib/profile-cookie";

export function useProfileSwitching() {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const switchProfile = (profileId: string) => {
    setProfileIdClient(profileId);
    setTrackIdClient(recallTrack(profileId)); // null clears it: the server falls back to the first track
    window.location.assign("/dashboard"); // full reload resets caches and per-profile local stores
  };

  const switchTrack = (profileId: string, trackId: string) => {
    setTrackIdClient(trackId);
    rememberTrack(profileId, trackId);
    // new keys for track-dependent queries -> they refetch with the new header
    qc.setQueryData(["user-profile"], (old: any) =>
      old ? { ...old, activeTrackId: trackId } : old,
    );
    qc.invalidateQueries({ queryKey: ["user-profile"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    if (pathname.startsWith("/browse/")) router.push("/browse"); // that subject may not be in the new track
    router.refresh();
  };

  return { switchProfile, switchTrack };
}
