"use client";

import { useState } from "react";
import Checkbox from "./Checkbox";
import type { ChapterNode, SubjectDraft, SubjectNode } from "../../../../types/mock-exam";
import { bn, isChapterFull, isSubjectFull, selectedTopicCount } from "./Selection";

interface Props {
    subject: SubjectNode;
    draft: SubjectDraft;
    onToggleTopic: (chapter: ChapterNode, topicId: string) => void;
    onToggleChapter: (chapter: ChapterNode) => void;
    onToggleAll: () => void;
    onQuestionCount: (n: number) => void;
    onAddAnother: () => void;
    onContinue: () => void;
}

const Chevron = ({ open }: { open: boolean }) => (
    <svg
        viewBox="0 0 20 20"
        fill="none"
        className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""
            }`}
    >
        <path
            d="m5 8 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function TopicStep({
    subject,
    draft,
    onToggleTopic,
    onToggleChapter,
    onToggleAll,
    onQuestionCount,
    onAddAnother,
    onContinue,
}: Props) {
    const [open, setOpen] = useState<Record<string, boolean>>({});
    const chapters = subject.chapters ?? [];
    const allSelected = isSubjectFull(subject, draft);
    const canContinue = selectedTopicCount(draft) > 0 || Object.keys(draft.selected).length > 0;

    return (
        <div className="pb-24">
            {/* Select-all row */}
            <button
                type="button"
                onClick={onToggleAll}
                className="mb-4 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left"
            >
                <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && Object.keys(draft.selected).length > 0}
                />
                <span className="flex-1 text-sm font-bold text-slate-900">
                    সকল অধ্যায়
                </span>
                <span className="text-xs text-slate-500">{bn(chapters.length)}টি অধ্যায়</span>
            </button>

            <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
                {chapters.map((chapter) => {
                    const topics = chapter.topics ?? [];
                    const picked = draft.selected[chapter._id] ?? [];
                    const full = isChapterFull(chapter, draft);
                    const isOpen = !!open[chapter._id];

                    return (
                        <div
                            key={chapter._id}
                            className={`rounded-xl border bg-white transition-colors ${picked.length ? "border-emerald-600" : "border-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-3 px-3 py-3">
                                <button
                                    type="button"
                                    onClick={() => onToggleChapter(chapter)}
                                    aria-label={`${chapter.name} সিলেক্ট করো`}
                                    className="shrink-0"
                                >
                                    <Checkbox checked={full} indeterminate={picked.length > 0} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpen((p) => ({ ...p, [chapter._id]: !p[chapter._id] }))
                                    }
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                >
                                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                                        {chapter.name}
                                    </span>
                                    {full && topics.length > 0 ? (
                                        <span className="shrink-0 rounded-full bg-emerald-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                                            সকল টপিক
                                        </span>
                                    ) : picked.length > 0 ? (
                                        <span className="shrink-0 rounded-full bg-emerald-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                                            {bn(picked.length)}
                                        </span>
                                    ) : null}
                                    {chapter.questionCount != null && (
                                        <span className="shrink-0 text-xs text-slate-500">
                                            {bn(chapter.questionCount)}
                                        </span>
                                    )}
                                    {topics.length > 0 && <Chevron open={isOpen} />}
                                </button>
                            </div>

                            {isOpen && topics.length > 0 && (
                                <div className="flex flex-col gap-2 border-t border-slate-100 p-3">
                                    {topics.map((topic) => {
                                        const checked = picked.includes(topic._id);
                                        return (
                                            <button
                                                key={topic._id}
                                                type="button"
                                                onClick={() => onToggleTopic(chapter, topic._id)}
                                                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left ${checked
                                                    ? "border-emerald-600 bg-emerald-50"
                                                    : "border-slate-200 bg-white"
                                                    }`}
                                            >
                                                <Checkbox checked={checked} />
                                                <span className="flex-1 text-sm text-slate-800">
                                                    {topic.name}
                                                </span>
                                                {topic.questionCount != null && (
                                                    <span className="text-xs text-slate-500">
                                                        {bn(topic.questionCount)}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Sticky action bar */}
            <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-4 py-3">
                <div className="mx-auto flex max-w-3xl items-end gap-2">
                    <label className="flex flex-col gap-0.5 text-[11px] text-slate-500">
                        প্রশ্ন সংখ্যা
                        <input
                            type="number"
                            min={1}
                            max={200}
                            value={draft.questionCount}
                            onChange={(e) =>
                                onQuestionCount(Math.max(1, Number(e.target.value) || 1))
                            }
                            className="h-11 w-20 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-600"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={onAddAnother}
                        disabled={!canContinue}
                        className="h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 disabled:opacity-50"
                    >
                        + আরেকটি বিষয়
                    </button>
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={!canContinue}
                        className="h-11 flex-1 rounded-lg bg-emerald-800 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-50"
                    >
                        এগিয়ে যাও
                    </button>
                </div>
            </div>
        </div>
    );
}