"use client";
import { useSyncExternalStore } from "react";
import { getProfileIdClient } from "./profile-cookie";

const KEY = () => `anushilon:bank-session:${getProfileIdClient() ?? "default"}`;
const IDLE_MS = 2 * 60 * 60 * 1000;
const MAX_RETRY = 50;
const MAX_PICKED = 400;

export interface RetryItem {
  id: string;
  href: string; // page the question was on (path + query)
  no?: number; // question number in that list
}

export interface BankSession {
  streak: number;
  bestStreak: number;
  answered: number;
  correct: number;
  picked: string[];
  retry: RetryItem[];
  updatedAt: number;
}

const EMPTY: BankSession = {
  streak: 0,
  bestStreak: 0,
  answered: 0,
  correct: 0,
  picked: [],
  retry: [],
  updatedAt: 0,
};

let cache: { raw: string | null; value: BankSession } = {
  raw: null,
  value: EMPTY,
};
const listeners = new Set<() => void>();

export const currentHref = () =>
  typeof window === "undefined"
    ? ""
    : window.location.pathname + window.location.search;

function read(): BankSession {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KEY());
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.value;
  let value = EMPTY;
  if (raw) {
    try {
      const p = JSON.parse(raw) as BankSession;
      if (Date.now() - p.updatedAt < IDLE_MS) value = { ...EMPTY, ...p };
    } catch {}
  }
  cache = { raw, value };
  return value;
}

function write(next: BankSession) {
  const value = { ...next, updatedAt: Date.now() };
  const raw = JSON.stringify(value);
  try {
    sessionStorage.setItem(KEY(), raw);
  } catch {}
  cache = { raw, value };
  listeners.forEach((l) => l());
}

// a tab left open for hours starts a fresh session on the next action
function base(): BankSession {
  const cur = read();
  return cur.updatedAt && Date.now() - cur.updatedAt > IDLE_MS ? EMPTY : cur;
}

/** Records the student's first pick of an MCQ in this session. */
export function recordMcqPick(id: string, correct: boolean) {
  const s = base();
  if (s.picked.includes(id))
    return { counted: false, streak: s.streak, prevStreak: s.streak };
  const streak = correct ? s.streak + 1 : 0;
  write({
    ...s,
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    answered: s.answered + 1,
    correct: s.correct + (correct ? 1 : 0),
    picked: [...s.picked, id].slice(-MAX_PICKED),
  });
  return { counted: true, streak, prevStreak: s.streak };
}

export function addRetry(item: RetryItem) {
  const s = base();
  const rest = s.retry.filter((r) => r.id !== item.id);
  write({ ...s, retry: [...rest, item].slice(-MAX_RETRY) });
}

export function removeRetry(id: string) {
  const s = base();
  if (!s.retry.some((r) => r.id === id)) return;
  write({ ...s, retry: s.retry.filter((r) => r.id !== id) });
}

export const resetBankSession = () => write({ ...EMPTY });

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export const useBankSession = () =>
  useSyncExternalStore(subscribe, read, () => EMPTY);
