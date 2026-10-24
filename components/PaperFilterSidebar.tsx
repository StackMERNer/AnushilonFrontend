// components/PaperFilterSidebar.tsx
"use client";

import { useAcademicTree, useClasses } from "@/hooks/use-academic";
import { IBoard } from "@/types/academic";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

interface Props {
    boards: IBoard[];
    classId?: string;
    selectedSubjectId: string;
    selectedChapterId: string;
    selectedTopics: string[];
    selectedBoards: string[];
    paperId: string;
}

export default function PaperFilterSidebar({
    selectedSubjectId,
    selectedChapterId,
    classId,
    paperId,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Fetch classes list
    const { data: classes } = useClasses();

    // Determine current class from searchParams or props
    const selectedClassId = classId || "";
    // Fetch taxonomy tree based on active class
    const { data: academicTree } = useAcademicTree({
        classId: selectedClassId,
        upto: "topic",
        paperId,
    });


    const setParams = (updates: {
        class?: string;
        subject?: string;
        chapter?: string;
        topics?: string[];
        type?: string;
    }) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (!value || (Array.isArray(value) && value.length === 0)) params.delete(key);
            else params.set(key, Array.isArray(value) ? value.join(",") : value);
        }
        params.delete("page"); // reset pagination on any filter change
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
    };

    const setType = (value: string) => setParams({ type: searchParams.get("type") === value ? undefined : value });

    // Changing class resets lower hierarchy filters (subjects, chapters, topics)
    const handleClassSelect = (cls: any) => {
        if (selectedClassId === cls._id) return;
        setParams({ class: cls._id, subject: undefined, chapter: undefined, topics: [] });
    };

    // Picking a subject clears any previously chosen chapter/topics
    const handleSubjectSelect = (subject: any) => {
        if (selectedSubjectId === subject._id) {
            setParams({ subject: undefined, chapter: undefined, topics: [] });
            return;
        }
        setParams({ subject: subject._id, chapter: undefined, topics: [] });
    };

    // Picking a chapter clears previously chosen topics
    const handleChapterSelect = (chapter: any) => {
        if (selectedChapterId === chapter._id) {
            setParams({ subject: selectedSubjectId, chapter: undefined, topics: [] });
            return;
        }
        setParams({ subject: selectedSubjectId, chapter: chapter._id, topics: [] });
    };

    const selectedClass = classes?.find((c: any) => c._id === selectedClassId);
    const selectedSubject = academicTree?.find((s: any) => s._id === selectedSubjectId);
    const chapters: any[] = selectedSubject?.chapters || [];
    const selectedChapter = chapters.find((c: any) => c._id === selectedChapterId);

    return (
        <div className={clsx("space-y-4", isPending && "opacity-50 pointer-events-none")}>
            {/* 1. Class → Subject → Chapter */}
            <SectionCard
                title="ফিল্টার করুন"
                hint={selectedChapter ? selectedChapter.name : selectedSubject ? "অধ্যায় ভিত্তিক ফিল্টার করুন" : selectedClass ? selectedClass.name : undefined}
            >
                {!classes ? (
                    <SkeletonBlock />
                ) : (
                    <div className="space-y-3">
                        {/* Class Dropdown */}
                        <ClassDropdown
                            classes={classes}
                            selectedId={selectedClassId}
                            onSelect={handleClassSelect}
                        />

                        {/* Subject Dropdown */}
                        {academicTree && <SubjectDropdown
                            subjects={academicTree}
                            selectedId={selectedSubjectId}
                            onSelect={handleSubjectSelect}
                        />}

                        {/* Chapter List */}
                        {selectedSubject && (
                            <div className="space-y-1 pt-1 border-t border-border">
                                {chapters.length ? (
                                    chapters.map((chapter: any) => (
                                        <button
                                            type="button"
                                            key={chapter._id}
                                            onClick={() => handleChapterSelect(chapter)}
                                            className={clsx(
                                                "w-full flex items-center gap-2.5 text-left px-2.5 py-2 mt-1 rounded-xl transition-colors",
                                                chapter._id === selectedChapterId ? "bg-teal-tint" : "hover:bg-muted"
                                            )}
                                        >
                                            <RadioDot checked={chapter._id === selectedChapterId} />
                                            <span
                                                className={clsx(
                                                    "text-sm leading-snug wrap-break-word",
                                                    chapter._id === selectedChapterId
                                                        ? "text-teal font-semibold"
                                                        : "text-foreground"
                                                )}
                                            >
                                                {chapter.name}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs py-2 text-muted-foreground">এই বিষয়ে কোনো অধ্যায় নেই।</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>

            {/* 2. Question type */}
            {/* <SectionCard title="প্রশ্নের ধরন">
                <div className="flex flex-wrap gap-2">
                    {QUESTION_TYPES.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setType(t.value)}
                            className="filter-pill"
                            data-active={searchParams.get("type") === t.value}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </SectionCard> */}

            <style jsx global>{`
                .filter-pill {
                    padding: 0.4rem 1rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    border: 1.5px solid var(--border);
                    background: var(--background);
                    color: var(--ink-soft);
                    transition: all 0.15s ease;
                }
                .filter-pill:hover {
                    border-color: var(--teal);
                    color: var(--ink);
                }
                .filter-pill[data-active="true"] {
                    background: var(--teal);
                    border-color: var(--teal);
                    color: white;
                }

                .dropdown-trigger {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                    padding: 0.65rem 0.9rem;
                    border-radius: 0.85rem;
                    border: 1.5px solid var(--border);
                    background: var(--background);
                    transition: border-color 0.15s ease;
                }
                .dropdown-trigger:hover {
                    border-color: var(--teal);
                }
                .dropdown-trigger[data-open="true"] {
                    border-color: var(--teal);
                    box-shadow: 0 0 0 3px var(--teal-tint);
                }
            `}</style>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Building blocks                                                   */
/* ────────────────────────────────────────────────────────────────── */

function SectionCard({
    title,
    hint,
    children,
}: {
    title: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                {hint && <span className="ml-auto text-[11px] text-teal truncate max-w-[45%]">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function RadioDot({ checked }: { checked: boolean }) {
    return (
        <span
            className={clsx(
                "flex items-center justify-center w-4 h-4 shrink-0 rounded-full border",
                checked ? "border-teal" : "border-line"
            )}
        >
            {checked && <span className="w-2 h-2 rounded-full bg-teal" />}
        </span>
    );
}

function DownChevron({ open }: { open: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            className={clsx("w-4 h-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 7.5l5 5 5-5" />
        </svg>
    );
}

/** Dropdown for selecting Class */
function ClassDropdown({
    classes,
    selectedId,
    onSelect,
}: {
    classes: any[];
    selectedId?: string;
    onSelect: (cls: any) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = classes.find((c) => c._id === selectedId);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    return (
        <div ref={rootRef} className="relative">
            <button type="button" onClick={() => setOpen((o) => !o)} className="dropdown-trigger" data-open={open}>
                <span className={clsx("text-sm truncate", selected ? "text-teal font-semibold" : "text-muted-foreground")}>
                    {selected ? selected.name : "শ্রেণী ভিত্তিক করুন"}
                </span>
                <DownChevron open={open} />
            </button>

            <div
                className={clsx(
                    "absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xl transition-all duration-200 ease-out",
                    open
                        ? "max-h-64 opacity-100 scale-100"
                        : "max-h-0 opacity-0 scale-95 pointer-events-none p-0 border-0"
                )}
            >
                {/* Inner scrollable list with inset scrollbar */}
                <div className="max-h-56 overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
                    {classes.map((cls) => {
                        const active = cls._id === selectedId;
                        return (
                            <button
                                type="button"
                                key={cls._id}
                                onClick={() => {
                                    onSelect(cls);
                                    setOpen(false);
                                }}
                                className={clsx(
                                    "w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg transition-colors",
                                    active ? "bg-teal-tint font-medium" : "hover:bg-muted text-foreground"
                                )}
                            >
                                <RadioDot checked={active} />
                                <span
                                    className={clsx(
                                        "text-sm truncate",
                                        active ? "text-teal font-semibold" : "text-foreground"
                                    )}
                                >
                                    {cls.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/** Dropdown for selecting Subject */
function SubjectDropdown({
    subjects,
    selectedId,
    onSelect,
}: {
    subjects: any[];
    selectedId?: string;
    onSelect: (subject: any) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = subjects.find((s) => s._id === selectedId);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    return (
        <div ref={rootRef} className="relative">
            <button type="button" onClick={() => setOpen((o) => !o)} className="dropdown-trigger" data-open={open}>
                <span className={clsx("text-sm truncate", selected ? "text-teal font-semibold" : "text-muted-foreground")}>
                    {selected ? selected.name : "বিষয় ভিত্তিক করুন"}
                </span>
                <DownChevron open={open} />
            </button>

            <div
                className={clsx(
                    "absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xl transition-all duration-200 ease-out",
                    open
                        ? "max-h-64 opacity-100 scale-100"
                        : "max-h-0 opacity-0 scale-95 pointer-events-none p-0 border-0"
                )}
            >
                {/* Inner scrollable area with right padding for the scrollbar */}
                <div className="max-h-56 overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
                    {subjects.map((subject) => {
                        const active = subject._id === selectedId;
                        return (
                            <button
                                type="button"
                                key={subject._id}
                                onClick={() => {
                                    onSelect(subject);
                                    setOpen(false);
                                }}
                                className={clsx(
                                    "w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg transition-colors",
                                    active
                                        ? "bg-teal-tint font-medium"
                                        : "hover:bg-muted text-foreground"
                                )}
                            >
                                <RadioDot checked={active} />
                                <span
                                    className={clsx(
                                        "text-sm truncate",
                                        active ? "text-teal font-semibold" : "text-foreground"
                                    )}
                                >
                                    {subject.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SkeletonBlock() {
    return <div className="h-11 rounded-xl animate-pulse bg-muted" />;
}