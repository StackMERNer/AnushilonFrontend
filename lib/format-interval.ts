import { toBnDigits } from "@/lib/helpers";

const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function formatInterval(ms: number) {
  if (ms <= 0) return "এখন";
  if (ms < HOUR) return `${toBnDigits(Math.max(1, Math.round(ms / MIN)))} মি`;
  if (ms < DAY) return `${toBnDigits(Math.round(ms / HOUR))} ঘণ্টা`;
  const days = Math.round(ms / DAY);
  if (days < 30) return `${toBnDigits(days)} দিন`;
  if (days < 365) return `${toBnDigits(Math.round(days / 30))} মাস`;
  return `${toBnDigits(Math.round(days / 365))} বছর`;
}
