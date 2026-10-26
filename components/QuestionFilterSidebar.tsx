// components/FilterSidebar.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useAcademicTree, useSources } from "@/hooks/use-academic";
import { useQuestionTypes } from "@/hooks/use-question-types";
import { useUserProfile } from "@/hooks/useUserProfile";
import { hasActiveSubscription } from "@/lib/helpers";
import { IBoard } from "@/types/academic";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PremiumGate } from "./PremiumGate";

interface Props {
    boards: IBoard[];
    selectedSubject: string;
    selectedChapter: string;
    selectedTopics: string[];
    selectedBoards: string[];
    selectedSchools: string[];
    selectedYear?: number;
}



export default function QuestionFilterSidebar({
    selectedSubject: selectedSubjectId,
    selectedChapter: selectedChapterId,
    selectedTopics,
    selectedBoards,
    selectedSchools,
    selectedYear
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();


    const { data: academicTree } = useAcademicTree({ classId: "6a6e31bdd2ea30ebd6a29ded", upto: "topic" });
    const { data: questionTypes } = useQuestionTypes(selectedChapterId);

    const setParams = (updates: {
        subject?: string;
        chapter?: string;
        topics?: string[];
        boards?: string[];
        schools?: string[];
        type?: string;
        year?: string;
        selectedOnly?: string;
    }) => {
        const params = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
            if (!value || (Array.isArray(value) && value.length === 0)) {
                params.delete(key);
            } else {
                params.set(
                    key,
                    Array.isArray(value) ? value.join(",") : value
                );
            }
        }

        params.delete("page");

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const toggleInList = (list: string[], item: string) =>
        list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

    const toggleBoard = (boardId: string) => setParams({ boards: toggleInList(selectedBoards, boardId) });
    const toggleSchool = (schoolId: string) => setParams({ schools: toggleInList(selectedSchools, schoolId) });
    const currentType = searchParams.get("type");
    const selectedOnly = String(searchParams.get("selectedOnly") === "true");
    const setType = (value: string) => setParams({ type: currentType === value ? undefined : value, boards: [], schools: [], year: undefined, selectedOnly: undefined });
    const toggleSelectedOnly = (value: string) => setParams({ selectedOnly: selectedOnly === value ? undefined : String(value) });

    const { data: sourcsData } = useSources({ subjectId: selectedSubjectId, chapterId: selectedChapterId, questionType: currentType });
    // console.log('currentType', currentType);

    const handleSubjectSelect = (subject: any) => {
        setParams({ subject: subject._id, chapter: undefined, topics: [], boards: [], schools: [], type: undefined, selectedOnly: undefined });
    };

    // Picking a chapter clears previously chosen topics (they belonged to a
    // different chapter). Picking the same chapter again clears just that.
    const handleChapterSelect = (chapter: any) => {
        if (selectedChapterId === chapter._id) {
            setParams({ subject: selectedSubjectId, chapter: undefined, topics: [], type: undefined, boards: [], schools: [], selectedOnly: undefined });
            return;
        }
        setParams({ subject: selectedSubjectId, chapter: chapter._id, topics: [], boards: [], schools: [], selectedOnly: undefined });
    };

    const { data: user } = useUserProfile();
    const hasEverPurchasedSubjectSubscription =
        (user?.subjectWiseSubscription?.length ?? 0) > 0;

    const hasSubscription = (user ? hasActiveSubscription(user) : false) || hasEverPurchasedSubjectSubscription;


    const handleUpgradeClick = () => {
        router.push("/plans"); // or open a modal/toast instead
    };

    useEffect(() => {
        if (selectedChapterId && !questionTypes) return;
        const isQuestionTypesContainCurrentType = questionTypes?.some((questionType) => questionType.value === currentType);
        if (!isQuestionTypesContainCurrentType) {
            setType("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionTypes])

    const handleTopicToggle = (topicId: string) => {
        const newTopics = toggleInList(selectedTopics, topicId);
        setParams({ subject: selectedSubjectId, chapter: selectedChapterId, topics: newTopics, selectedOnly: undefined });
    };

    const selectedSubject = academicTree?.find((s: any) => s._id === selectedSubjectId);
    const chapters: any[] = selectedSubject?.chapters || [];
    const selectedChapter = chapters.find((c: any) => c._id === selectedChapterId);
    const topics: any[] = selectedChapter?.topics || [];

    return (
        <div className={clsx("space-y-4", isPending && "opacity-50 pointer-events-none")}>
            {/* 1. Subject → Chapter */}
            <SectionCard
                title="বিষয় ও অধ্যায়"
                hint={selectedChapter ? selectedChapter.name : selectedSubject ? "অধ্যায় নির্বাচন করুন" : undefined}
            >
                {!academicTree ? (
                    <SkeletonBlock />
                ) : (
                    <div className="space-y-3">
                        <SubjectDropdown
                            subjects={academicTree}
                            selectedId={selectedSubjectId}
                            onSelect={handleSubjectSelect}
                        />
                        {selectedSubject && (
                            <ChapterDropdown
                                chapters={chapters}
                                selectedId={selectedChapterId}
                                onSelect={handleChapterSelect}
                            />
                        )}
                    </div>
                )}
            </SectionCard>

            {/* 2. Topics */}
            {(topics.length > 1) && <SectionCard title="টপিক">
                <div className="space-y-1">
                    {topics.map((topic: any) => {
                        const checked = selectedTopics.includes(topic._id);
                        return (
                            <label
                                key={topic._id}
                                className={clsx(
                                    "flex items-center gap-2.5 text-sm cursor-pointer rounded-xl px-2.5 py-2 transition-colors",
                                    checked ? "bg-teal-tint" : "hover:bg-muted"
                                )}
                            >
                                <Checkbox checked={checked} onCheckedChange={() => handleTopicToggle(topic._id)} />
                                <span className={clsx(checked ? "text-teal font-medium" : "text-foreground")}>
                                    {topic.name}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </SectionCard>}

            {/* 3. Question type */}
            <SectionCard title="কুইক ফিল্টার">
                <div className="space-y-1">
                    {(() => {
                        const checked = selectedOnly === "true";
                        return (
                            <label
                                key={'selectedOnly'}
                                className={clsx(
                                    "flex items-center gap-2.5 text-sm cursor-pointer rounded-xl px-2.5 py-2 transition-colors",
                                    checked ? "bg-teal-tint" : "hover:bg-muted"
                                )}
                            >
                                <Checkbox checked={checked} onCheckedChange={(checked) => toggleSelectedOnly(String(checked))} />
                                নির্বাচিত প্রশ্নসমূহ
                            </label>
                        );
                    })()}
                </div>
            </SectionCard>
            {/* 3. Question type */}
            <SectionCard title="প্রশ্নের ধরন">
                <div className="space-y-1">
                    {questionTypes?.map((t) => {
                        const checked = searchParams.get("type") === t.value;
                        return (
                            <label
                                key={t.value}
                                className={clsx(
                                    "flex items-center gap-2.5 text-sm cursor-pointer rounded-xl px-2.5 py-2 transition-colors",
                                    checked ? "bg-teal-tint" : "hover:bg-muted"
                                )}
                            >
                                <Checkbox checked={checked} onCheckedChange={() => setType(t.value)} />
                                {t.label}
                            </label>
                        );
                    })}
                </div>
            </SectionCard>

            {((sourcsData?.boardYears?.length || 0) > 0) && (
                <SectionCard title="সাল">
                    <PremiumGate locked={!hasSubscription} onUpgradeClick={handleUpgradeClick}>
                        <YearDropdown
                            years={sourcsData?.boardYears || []}
                            selectedYear={selectedYear}
                            onSelect={(year) =>
                                setParams({
                                    year: selectedYear === year ? undefined : String(year),
                                })
                            }
                        />
                    </PremiumGate>
                </SectionCard>
            )}
            {/* 4. Board */}
            {((sourcsData?.boards.length || 0) > 0) && (
                <SectionCard title="বোর্ড">
                    <PremiumGate locked={!hasSubscription} onUpgradeClick={handleUpgradeClick}>
                        <div className="space-y-1">
                            {sourcsData?.boards.map((b) => {
                                const checked = selectedBoards.includes(b._id);
                                return (
                                    <label
                                        key={b._id}
                                        className={clsx(
                                            "flex items-center gap-2.5 text-sm cursor-pointer rounded-xl px-2.5 py-2 transition-colors",
                                            checked ? "bg-teal-tint" : "hover:bg-muted"
                                        )}
                                    >
                                        <Checkbox checked={checked} onCheckedChange={() => toggleBoard(b._id)} />
                                        <span className={clsx(checked ? "text-teal font-medium" : "text-foreground")}>
                                            {b.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </PremiumGate>
                </SectionCard>
            )}
            {/* 4. Schools */}
            {((sourcsData?.schools.length || 0) > 0) && (
                <SectionCard title="স্কুল">
                    <PremiumGate locked={!hasSubscription} onUpgradeClick={handleUpgradeClick}>
                        <div className="space-y-1">
                            {sourcsData?.schools.map((b) => {
                                const checked = selectedSchools.includes(b._id);
                                return (
                                    <label
                                        key={b._id}
                                        className={clsx(
                                            "flex items-center gap-2.5 text-sm cursor-pointer rounded-xl px-2.5 py-2 transition-colors",
                                            checked ? "bg-teal-tint" : "hover:bg-muted"
                                        )}
                                    >
                                        <Checkbox checked={checked} onCheckedChange={() => toggleSchool(b._id)} />
                                        <span className={clsx(checked ? "text-teal font-medium" : "text-foreground")}>
                                            {b.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </PremiumGate>
                </SectionCard>
            )}

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
/*  Building blocks                                                    */
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

/** A dropdown for picking a single subject — closed state shows the current pick,
 *  open state expands an inline list (no portal, so it behaves inside drawers/sidebars). */
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
                    {selected ? selected.name : "বিষয় নির্বাচন করুন"}
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
                                "w-full flex items-center gap-2.5 text-left px-3 py-2.5 border-b border-border last:border-b-0 transition-colors",
                                active ? "bg-teal-tint" : "hover:bg-muted"
                            )}
                        >
                            <RadioDot checked={active} />
                            <span className={clsx("text-sm truncate", active ? "text-teal font-semibold" : "text-foreground")}>
                                {subject.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function ChapterDropdown({
    chapters,
    selectedId,
    onSelect,
}: {
    chapters: any[];
    selectedId?: string;
    onSelect: (chapter: any) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const selected = chapters.find((chapter) => chapter._id === selectedId);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (
                rootRef.current &&
                !rootRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", onClickOutside);

        return () => {
            document.removeEventListener("mousedown", onClickOutside);
        };
    }, []);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="dropdown-trigger"
                data-open={open}
                disabled={!chapters.length}
            >
                <span
                    className={clsx(
                        "text-sm truncate",
                        selected
                            ? "text-teal font-semibold"
                            : "text-muted-foreground"
                    )}
                >
                    {selected
                        ? selected.name
                        : chapters.length
                            ? "অধ্যায় নির্বাচন করুন"
                            : "এই বিষয়ে কোনো অধ্যায় নেই"}
                </span>

                {chapters.length > 0 && <DownChevron open={open} />}
            </button>

            <div
                className={clsx(
                    "absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xl transition-all duration-200 ease-out",
                    open
                        ? "max-h-[80vh] opacity-100 scale-100"
                        : "max-h-0 opacity-0 scale-95 pointer-events-none p-0 border-0"
                )}
            >
                {/* Inner scrollable area with right padding for the scrollbar */}
                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
                    {chapters.map((chapter) => {
                        const active = chapter._id === selectedId;
                        return (
                            <button
                                type="button"
                                key={chapter._id}
                                onClick={() => {
                                    onSelect(chapter);
                                    setOpen(false);
                                }}
                                className={clsx(
                                    "w-full flex items-center gap-2.5 text-left px-3 py-2.5 border-b border-border last:border-b-0 transition-colors",
                                    active
                                        ? "bg-teal-tint"
                                        : "hover:bg-muted"
                                )}
                            >
                                <RadioDot checked={active} />

                                <span
                                    className={clsx(
                                        "text-sm leading-snug wrap-break-word",
                                        active
                                            ? "text-teal font-semibold"
                                            : "text-foreground"
                                    )}
                                >
                                    {chapter.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}

function YearDropdown({
    years,
    selectedYear,
    onSelect,
}: {
    years: number[];
    onSelect: (year: number) => void;
    selectedYear?: number;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={clsx(
                    "w-full flex items-center justify-between",
                    "rounded-xl border bg-background px-3 py-2.5",
                    "text-sm transition-colors",
                    "hover:bg-muted",
                    open && "border-teal"
                )}
            >
                <span className={selectedYear ? "text-foreground" : "text-muted-foreground"}>
                    {selectedYear || "সাল নির্বাচন করুন"}
                </span>

                <svg
                    className={clsx(
                        "h-4 w-4 transition-transform",
                        open && "rotate-180"
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border bg-background p-1.5 shadow-xl">
                    <div className="max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                        {years.map((year) => {
                            const selected = selectedYear === year;

                            return (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => {
                                        onSelect(year);
                                        setOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                        selected
                                            ? "bg-teal-tint text-teal font-medium"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    {year}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function SkeletonBlock() {
    return <div className="h-11 rounded-xl animate-pulse bg-muted" />;
}