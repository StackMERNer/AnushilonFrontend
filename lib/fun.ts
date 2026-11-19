import { toBnDigits } from "@/lib/helpers";
import {
  CHAPTER_DONE,
  FunEffect,
  GOAL_DONE,
  STREAK_BREAK,
  getMilestone,
} from "./fun-messages";

export const FUN_MODE_KEY = "bank:funMode";

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function isFunMode() {
  try {
    return localStorage.getItem(FUN_MODE_KEY) !== "0"; // default on
  } catch {
    return true;
  }
}

export function showToast(text: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("fun:toast", { detail: { text } }));
}

export async function fireConfetti(effect: FunEffect) {
  if (effect === "none" || typeof window === "undefined") return;
  try {
    const { default: confetti } = await import("canvas-confetti");
    const base = { zIndex: 60, disableForReducedMotion: true };

    if (effect === "small") {
      confetti({ ...base, particleCount: 70, spread: 70, origin: { y: 0.7 } });
    } else if (effect === "big") {
      confetti({
        ...base,
        particleCount: 100,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.75 },
      });
      confetti({
        ...base,
        particleCount: 100,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.75 },
      });
    } else if (effect === "fireworks") {
      const end = Date.now() + 2000;
      const id = setInterval(() => {
        if (Date.now() > end) return clearInterval(id);
        confetti({
          ...base,
          particleCount: 40,
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
        });
      }, 250);
    } else if (effect === "rain") {
      const end = Date.now() + 3000;
      const frame = () => {
        confetti({
          ...base,
          particleCount: 4,
          angle: 90,
          spread: 120,
          startVelocity: 20,
          gravity: 0.8,
          origin: { x: Math.random(), y: -0.1 },
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  } catch {}
}

export function celebrateStreak(streak: number, prevStreak: number) {
  if (!isFunMode()) return;
  const m = getMilestone(streak);
  if (m) {
    showToast(pick(m.messages).replace("{n}", toBnDigits(streak)));
    void fireConfetti(m.effect);
  } else if (streak === 0 && prevStreak >= 5) {
    showToast(pick(STREAK_BREAK));
  }
}

export function celebrateGoal() {
  if (!isFunMode()) return;
  showToast(pick(GOAL_DONE));
  void fireConfetti("big");
}

export function celebrateChapter(chapterId: string, name: string) {
  if (!isFunMode()) return;
  const key = `celebrated:chapter:${chapterId}`;
  try {
    if (localStorage.getItem(key)) return; // once per device
    localStorage.setItem(key, "1");
  } catch {}
  showToast(pick(CHAPTER_DONE).replace("{name}", name));
  void fireConfetti("fireworks");
}
