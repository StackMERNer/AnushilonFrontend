// lib/auth/session-sync.ts
"use client";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";

const LAST_SYNCED_KEY = "session_last_synced";
const RESYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // re-exchange at most once/day

async function exchangeSession(idToken: string, uid: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  localStorage.setItem(
    LAST_SYNCED_KEY,
    JSON.stringify({ uid, ts: Date.now() }),
  );
}

export function initSessionSync() {
  onIdTokenChanged(auth, async (user) => {
    if (!user) return;
    const raw = localStorage.getItem(LAST_SYNCED_KEY);
    const last = raw ? JSON.parse(raw) : null;
    const uidChanged = !last || last.uid !== user.uid;
    const isStale = !last || Date.now() - last.ts > RESYNC_INTERVAL_MS;

    if (uidChanged || isStale) {
      const idToken = await user.getIdToken();
      await exchangeSession(idToken, user.uid);
    }
  });
}
