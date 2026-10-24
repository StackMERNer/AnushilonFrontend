// lib/fonts.ts
import { FontFamily } from "@/types/print-settings";

export function getFontFamilyValue(family: FontFamily): string | undefined {
  switch (family) {
    case "kalpurush":
      return "'Kalpurush', 'Noto Serif Bengali', serif";
    case "arial":
      return "Arial, Helvetica, 'Noto Serif Bengali', sans-serif";
    case "bangla-default":
    default:
      return undefined; // don't override — let it inherit whatever the app already sets globally
  }
}
