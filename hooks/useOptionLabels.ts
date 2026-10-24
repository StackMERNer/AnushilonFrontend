import { usePrintSettingsStore } from "@/store/print-settings-store";

export const LABEL_SETS = {
  "bn-letter": ["ক", "খ", "গ", "ঘ", "ঙ", "চ"],
  "en-letter": ["a", "b", "c", "d", "e", "f"],
  "bn-number": ["১", "২", "৩", "৪", "৫", "৬"],
  "en-number": ["1", "2", "3", "4", "5", "6"],
  roman: ["i", "ii", "iii", "iv", "v", "vi"],
} as const;

export function useOptionLabels() {
  const style = usePrintSettingsStore(
    (s) => s.settings.questionFormat.optionLabelStyle,
  );
  return LABEL_SETS[style];
}
