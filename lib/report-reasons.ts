export const REPORT_REASONS = [
  { key: "spelling", label: "বানান ভুল" },
  { key: "wrong_question", label: "প্রশ্নে ভুল আছে" },
  { key: "wrong_answer", label: "উত্তর ভুল" },
  { key: "wrong_explanation", label: "ব্যাখ্যা / সমাধান ভুল" },
  { key: "display_issue", label: "গণিত বা ছবি ঠিকমতো দেখাচ্ছে না" },
  { key: "wrong_chapter", label: "ভুল অধ্যায়ে আছে" },
  { key: "duplicate", label: "একই প্রশ্ন বারবার এসেছে" },
  { key: "other", label: "অন্যান্য" },
] as const;
