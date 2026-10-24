// types/print-settings.ts
export type FontFamily = "bangla-default" | "kalpurush" | "arial";
export type PaperSize = "A4" | "A5" | "Letter" | "Legal";
export type FileFormat =
  | "question"
  | "answer-only"
  | "question-answer"
  | "suggestion";
export type McqAnswerMarker =
  | "circle"
  | "circle-outside"
  | "answer-bn"
  | "answer-en" // ○ / (ক)  / উঃ / Ans:
  | "uttor-mala";
export type OptionLabelStyle =
  | "bn-letter"
  | "en-letter"
  | "bn-number"
  | "roman"; // ক,খ.. / a,b.. / ১,২.. / i,ii..
export type OptionBulletStyle = "circle" | "dot" | "paren" | "none";
export type ImageFit = "cover" | "contain" | "fill";

export const PAPER_DIMENSIONS = {
  A4: {
    width: "210mm",
    height: "297mm",
    cssSize: "A4",
  },
  A5: {
    width: "148mm",
    height: "210mm",
    cssSize: "A5",
  },
  Letter: {
    width: "8.5in",
    height: "11in",
    cssSize: "Letter",
  },
  Legal: {
    width: "8.5in",
    height: "14in",
    cssSize: "Legal",
  },
} as const;

export const SHEET_THEMES = [
  // dark header, white text
  { id: "blue", bg: "#1e3a8a", fg: "#ffffff" },
  { id: "green", bg: "#065f46", fg: "#ffffff" },
  { id: "purple", bg: "#4c1d95", fg: "#ffffff" },
  { id: "maroon", bg: "#7f1d1d", fg: "#ffffff" },
  { id: "navy", bg: "#111827", fg: "#ffffff" },
  { id: "brown", bg: "#92400e", fg: "#ffffff" },
  // light header, dark text
  { id: "blue-light", bg: "#dbeafe", fg: "#1e3a8a" },
  { id: "green-light", bg: "#d1fae5", fg: "#065f46" },
  { id: "purple-light", bg: "#ede9fe", fg: "#4c1d95" },
  { id: "maroon-light", bg: "#fee2e2", fg: "#7f1d1d" },
  { id: "navy-light", bg: "#f3f4f6", fg: "#111827" },
  { id: "brown-light", bg: "#fef3c7", fg: "#92400e" },
] as const;

export type SheetThemeId = (typeof SHEET_THEMES)[number]["id"];

export const getSheetTheme = (id: SheetThemeId) =>
  SHEET_THEMES.find((t) => t.id === id) ?? SHEET_THEMES[0];

export interface PrintSettings {
  // পেজ সেটিংস
  paperSize: PaperSize;
  pageMargin: number; // mm

  // বেসিক সেটিংস
  fileFormat: FileFormat;
  mcqAnswerMarker: McqAnswerMarker;
  editingMode: boolean;
  // watermarkText: string;

  // কনটেন্ট ডিসপ্লে
  content: {
    title: boolean;
    address: boolean;
    className: boolean;
    subjectName: boolean;
    chapterName: boolean;
    instructions: boolean;
    examineeInfo: boolean;
    questionInfo: boolean;
    mcqMarks: boolean;
    writtenMarks: boolean;
    omrIncluded: boolean;
    columnDivider: boolean;
    subjectCode: boolean;
    marksBox: boolean;
    setCode: boolean;
    pageNumber: boolean;
  };

  // প্রশ্ন ফরম্যাট
  questionFormat: {
    columnCount: 1 | 2 | 3;
    optionBulletStyle: OptionBulletStyle;
    optionLabelStyle: OptionLabelStyle;
    optionColumnCount: 1 | 2 | 3 | 4;
    rowGap: number; // 0–100 slider
    columnGap: number; // 0–100 slider
  };

  // ফন্ট সেটিংস
  font: {
    family: FontFamily;
    size: number; // px
  };

  // ব্র্যান্ডিং সেটিংস
  branding: {
    enabled: boolean;
    watermarkText: string;
    watermarkIconUrl?: string;
    size: number; // px
    opacity: number; // 0–100
    repeat: boolean;
  };

  // হেডার ইমেজ সেটিংস
  headerImage: {
    enabled: boolean;
    url?: string;
    fit: ImageFit;
  };

  // লেকচার শীট সেটিংস
  sheet: {
    enabled: boolean; // "শীট তৈরী করুন" mode
    showInstructor: boolean;
    showLectureNumber: boolean;
    showLectureTopic: boolean;
    showDate: boolean;
    coloredBackground: boolean;
    themeId: SheetThemeId;
  };
}

export const defaultPrintSettings: PrintSettings = {
  paperSize: "A4",
  pageMargin: 10,
  fileFormat: "question",
  mcqAnswerMarker: "circle",
  editingMode: false,
  content: {
    title: true,
    address: true,
    className: true,
    subjectName: true,
    chapterName: true,
    instructions: true,
    examineeInfo: false,
    questionInfo: false,
    mcqMarks: true,
    writtenMarks: true,
    omrIncluded: true,
    columnDivider: true,
    subjectCode: true,
    marksBox: false,
    setCode: true,
    pageNumber: false,
  },
  questionFormat: {
    columnCount: 2,
    optionBulletStyle: "paren",
    optionLabelStyle: "bn-letter",
    optionColumnCount: 2,
    rowGap: 40,
    columnGap: 40,
  },
  font: {
    family: "bangla-default",
    size: 16,
  },
  branding: {
    enabled: false,
    watermarkText: "",
    size: 70,
    opacity: 30,
    repeat: false,
  },
  headerImage: {
    enabled: false,
    fit: "cover",
  },

  sheet: {
    enabled: false,
    showInstructor: true,
    showLectureNumber: true,
    showLectureTopic: true,
    showDate: true,
    coloredBackground: false,
    themeId: "green",
  },
};
