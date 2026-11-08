import type {
    ChapterNode,
    IExamConfig,
    IExamConfigSubject,
    SubjectDraft,
    SubjectNode,
} from "../../../../types/mock-exam";

export const bn = (n: number) => n.toLocaleString("bn-BD");

export function selectedTopicCount(draft?: SubjectDraft) {
    if (!draft) return 0;
    return Object.values(draft.selected).reduce((s, t) => s + t.length, 0);
}

/** A chapter with no topics counts as selected when its key exists. */
export function isChapterFull(chapter: ChapterNode, draft?: SubjectDraft) {
    const sel = draft?.selected[chapter._id];
    if (!sel) return false;
    const total = chapter.topics?.length ?? 0;
    return total === 0 ? true : sel.length === total;
}

export function isSubjectFull(subject: SubjectNode, draft?: SubjectDraft) {
    const chapters = subject.chapters ?? [];
    return chapters.length > 0 && chapters.every((c) => isChapterFull(c, draft));
}

export function hasAnySelection(draft?: SubjectDraft) {
    return !!draft && Object.keys(draft.selected).length > 0;
}

/**
 * All chapters + topics selected  -> chapters: []  (nothing embedded)
 * Otherwise                       -> only the chosen chapters, with their topic ids
 */
export function buildExamConfig(
    drafts: Record<string, SubjectDraft>,
    subjects: SubjectNode[],
    standards: string[],
    settings: { duration: number; negativeMarking: boolean }
): IExamConfig {
    const questionType = standards.join(",");

    const configSubjects: IExamConfigSubject[] = Object.values(drafts)
        .filter(hasAnySelection)
        .map((draft) => {
            const subject = subjects.find((s) => s._id === draft.subjectId);
            const full = subject ? isSubjectFull(subject, draft) : false;

            return {
                name: draft.name,
                subject: draft.subjectId,
                questionCount: draft.questionCount,
                questionType,
                chapters: full
                    ? []
                    : Object.entries(draft.selected).map(([chapter, topics]) => ({
                        chapter,
                        topics,
                    })),
            };
        });

    return {
        name: configSubjects.map((s) => s.name).join(", "),
        duration: settings.duration,
        negativeMarking: settings.negativeMarking,
        subjects: configSubjects,
    };
}