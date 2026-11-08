// ---- Shapes returned by useAcademicTree({ upto: "topic" }) ----
// Adjust field names here if your API differs (e.g. `chapters` -> `children`).
export interface TopicNode {
    _id: string;
    name: string;
    questionCount?: number;
}

export interface ChapterNode {
    _id: string;
    name: string;
    questionCount?: number;
    topics?: TopicNode[];
}

export interface SubjectNode {
    _id: string;
    name: string;
    chapters?: ChapterNode[];
}

// ---- Exam config (matches your backend-facing interfaces) ----
export interface IExamConfigSubjectChapter {
    chapter: string; // chapterId
    topics: string[]; // topicIds
    questionCount?: number;
    questionType?: string;
}

export interface IExamConfigSubject {
    name: string;
    subject: string; // subjectId
    chapters: IExamConfigSubjectChapter[]; // empty => everything selected
    questionCount: number;
    questionType: string;
}

export interface IExamConfig {
    _id?: string;
    name: string;
    duration: number;
    negativeMarking: boolean;
    subjects: IExamConfigSubject[];
    startedAt?: Date;
    submittedAt?: Date;
}

// ---- UI draft state ----
export type Step = "subject" | "topics" | "standard" | "settings";

export interface SubjectDraft {
    subjectId: string;
    name: string;
    /** chapterId -> selected topicIds */
    selected: Record<string, string[]>;
    questionCount: number;
}

export const QUESTION_STANDARDS = [
    "Engineering",
    "Varsity",
    "Medical",
    "Academic",
    "Main Book",
] as const;