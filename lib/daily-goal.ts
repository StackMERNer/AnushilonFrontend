"use client";
import { useSyncExternalStore } from "react";
import { getProfileIdClient } from "./profile-cookie";

const KEY = () => `anushilon:daily-goal:${getProfileIdClient() ?? "default"}`;

interface Daily {
  date: string; // Asia/Dhaka calendar day
  ids: string[];
  celebrated: boolean;
}

const EMPTY: Daily = { date: "", ids: [], celebrated: false };
const today = () =>
  new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10); // UTC+6

let cache: { raw: string | null; date: string; value: Daily } | null = null;
const listeners = new Set<() => void>();

function read(): Daily {
  if (typeof window === "undefined") return EMPTY;
  const t = today();
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY());
  } catch {}
  if (cache && cache.raw === raw && cache.date === t) return cache.value;

  let value: Daily = { date: t, ids: [], celebrated: false };
  if (raw) {
    try {
      const p = JSON.parse(raw) as Daily;
      if (p.date === t) value = p;
    } catch {}
  }
  cache = { raw, date: t, value };
  return value;
}

function write(value: Daily) {
  const raw = JSON.stringify(value);
  try {
    localStorage.setItem(KEY(), raw);
  } catch {}
  cache = { raw, date: value.date, value };
  listeners.forEach((l) => l());
}

/** Counts a question as practiced today (once per question). */
export function touchToday(id: string) {
  const d = read();
  if (d.ids.includes(id)) return;
  write({ ...d, ids: [...d.ids, id].slice(-500) });
}

export const markGoalCelebrated = () => write({ ...read(), celebrated: true });

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useDailyProgress() {
  const d = useSyncExternalStore(subscribe, read, () => EMPTY);
  return { count: d.ids.length, celebrated: d.celebrated };
}
