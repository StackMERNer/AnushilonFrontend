import { getClassNameBn } from "@/lib/constants";
import { ITrack } from "@/types/profile";

const STREAM_BN = {
  science: "বিজ্ঞান",
  commerce: "ব্যবসায় শিক্ষা",
  humanities: "মানবিক",
} as const;
export const VERSION_BN: Record<string, string> = {
  bangla: "বাংলা",
  english: "English",
};

export function trackLabel(t: ITrack) {
  if (t.name) return t.name;
  if (t.subjects?.length) return `${t.subjects.length} টি বিষয়`;
  return [
    t.class ? getClassNameBn(t.class.name) : "",
    t.stream ? STREAM_BN[t.stream] : "",
    t.version ? (VERSION_BN[t.version] ?? t.version) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
