import { clearProfileCookies } from "@/lib/profile-cookie";

const LOCAL_PREFIXES = [
  "anushilon:daily", // daily-goal progress (also matches anushilon:daily:<profileId>)
  "anushilon:lastTrack:", // last syllabus per profile
  "anushilon:track:", // older per-profile track key, if it still exists
  "celebrated:chapter:", // once-per-device chapter celebrations
  "institute-info-modal-skipped",
];
const SESSION_PREFIXES = ["anushilon:bank-session", "bank:scrollTo"];

function removeByPrefix(storage: Storage, prefixes: string[]) {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k && prefixes.some((p) => k.startsWith(p))) keys.push(k);
  }
  keys.forEach((k) => storage.removeItem(k));
}

export function clearAccountState() {
  if (typeof window === "undefined") return;
  clearProfileCookies();
  try {
    removeByPrefix(localStorage, LOCAL_PREFIXES);
  } catch {}
  try {
    removeByPrefix(sessionStorage, SESSION_PREFIXES);
  } catch {}
}
