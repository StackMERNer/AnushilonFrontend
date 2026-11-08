"use client";

import { useCallback, useState } from "react";
import type { ChapterNode, Step, SubjectDraft, SubjectNode } from "@/types/mock-exam";
import { hasAnySelection, isChapterFull, isSubjectFull } from "@/app/(teacher)/mock-exam/_components/Selection";

export function useMockExamDraft() {
    const [step, setStep] = useState<Step>("subject");
    const [direction, setDirection] = useState<"forward" | "back">("forward");
    const [activeId, setActiveId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, SubjectDraft>>({});
    const [standards, setStandards] = useState<string[]>([]);
    const [duration, setDuration] = useState(30);
    const [negativeMarking, setNegativeMarking] = useState(false);

    const goTo = useCallback((next: Step, dir: "forward" | "back" = "forward") => {
        setDirection(dir);
        setStep(next);
    }, []);

    const openSubject = (subject: SubjectNode) => {
        setDrafts((prev) =>
            prev[subject._id]
                ? prev
                : {
                    ...prev,
                    [subject._id]: {
                        subjectId: subject._id,
                        name: subject.name,
                        selected: {},
                        questionCount: 25,
                    },
                }
        );
        setActiveId(subject._id);
        goTo("topics");
    };

    /** Leaving the topics step: drop the draft if nothing was picked. */
    const backToSubjects = () => {
        if (activeId && !hasAnySelection(drafts[activeId])) {
            setDrafts((prev) => {
                const { [activeId]: _removed, ...rest } = prev;
                return rest;
            });
        }
        goTo("subject", "back");
    };

    const patch = (fn: (d: SubjectDraft) => SubjectDraft) => {
        if (!activeId) return;
        setDrafts((prev) => ({ ...prev, [activeId]: fn(prev[activeId]) }));
    };

    const toggleTopic = (chapter: ChapterNode, topicId: string) =>
        patch((d) => {
            const current = d.selected[chapter._id] ?? [];
            const next = current.includes(topicId)
                ? current.filter((t) => t !== topicId)
                : [...current, topicId];
            const selected = { ...d.selected };
            if (next.length === 0) delete selected[chapter._id];
            else selected[chapter._id] = next;
            return { ...d, selected };
        });

    const toggleChapter = (chapter: ChapterNode) =>
        patch((d) => {
            const selected = { ...d.selected };
            if (isChapterFull(chapter, d)) delete selected[chapter._id];
            else selected[chapter._id] = (chapter.topics ?? []).map((t) => t._id);
            return { ...d, selected };
        });

    const toggleAll = (subject: SubjectNode) =>
        patch((d) => {
            if (isSubjectFull(subject, d)) return { ...d, selected: {} };
            const selected: Record<string, string[]> = {};
            (subject.chapters ?? []).forEach((c) => {
                selected[c._id] = (c.topics ?? []).map((t) => t._id);
            });
            return { ...d, selected };
        });

    const setQuestionCount = (count: number) =>
        patch((d) => ({ ...d, questionCount: count }));

    const toggleStandard = (s: string) =>
        setStandards((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );

    return {
        step,
        direction,
        goTo,
        activeId,
        drafts,
        standards,
        duration,
        negativeMarking,
        setDuration,
        setNegativeMarking,
        openSubject,
        backToSubjects,
        toggleTopic,
        toggleChapter,
        toggleAll,
        setQuestionCount,
        toggleStandard,
    };
}