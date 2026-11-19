"use client";
import { useCallback, useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();

function useStored<T extends boolean | number>(
  key: string,
  initial: T,
  parse: (raw: string, initial: T) => T,
  format: (v: T) => string,
) {
  const subscribe = useCallback(
    (cb: () => void) => {
      let set = listeners.get(key);
      if (!set) listeners.set(key, (set = new Set()));
      set.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        set!.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? initial : parse(raw, initial);
      } catch {
        return initial;
      }
    },
    () => initial,
  );

  const set = useCallback(
    (v: T) => {
      try {
        localStorage.setItem(key, format(v));
      } catch {}
      listeners.get(key)?.forEach((l) => l());
    },
    [key, format],
  );

  return [value, set] as const;
}

const parseFlag = (r: string) => r === "1";
const formatFlag = (v: boolean) => (v ? "1" : "0");
const parseNum = (r: string, d: number) =>
  Number.isFinite(Number(r)) ? Number(r) : d;
const formatNum = (v: number) => String(v);

export const usePersistentFlag = (key: string, initial = false) =>
  useStored<boolean>(key, initial, parseFlag, formatFlag);

export const usePersistentNumber = (key: string, initial: number) =>
  useStored<number>(key, initial, parseNum, formatNum);
