export const PROFILE_COOKIE = "profileId";
const MAX_AGE = 60 * 60 * 24 * 365;

const read = (name: string) => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([a-f\\d]{24})`, "i"),
  );
  return m ? m[1] : null;
};
const write = (name: string, value: string | null) => {
  document.cookie = value
    ? `${name}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax`
    : `${name}=; path=/; max-age=0`;
};

export const getProfileIdClient = () => read("profileId");
export const setProfileIdClient = (id: string) => write("profileId", id);
export const getTrackIdClient = () => read("trackId");
export const setTrackIdClient = (id: string | null) => write("trackId", id);

// remember the last track used per profile (device-local), so switching back restores it
const lastKey = (profileId: string) => `anushilon:lastTrack:${profileId}`;
export const rememberTrack = (profileId: string, trackId: string) => {
  try {
    localStorage.setItem(lastKey(profileId), trackId);
  } catch {}
};
export const recallTrack = (profileId: string) => {
  try {
    return localStorage.getItem(lastKey(profileId));
  } catch {
    return null;
  }
};
