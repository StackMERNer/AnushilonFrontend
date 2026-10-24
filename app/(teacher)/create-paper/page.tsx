'use client';

import { PressableButton } from "@/components/ui/pressable-button";
import { useAcademicTree, useClasses } from "@/hooks/use-academic";
import { useUserProfile } from "@/hooks/useUserProfile";
import { apiClient } from "@/lib/api/api-client";
import { getStreamNameBn } from "@/lib/constants";
import { hasActiveSubjectSubscription, hasActiveSubscription, toBnDigits } from "@/lib/helpers";
import { createPaperService } from "@/services/paper.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function CreatePaperPage() {
    const router = useRouter();

    // Form states
    const [title, setTitle] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStream, setSelectedStream] = useState("all");

    // Keyed by subject ID: { [subjectId: string]: string[] } (array of chapter IDs)
    const [selectedSubjectsMap, setSelectedSubjectsMap] = useState<Record<string, string[]>>({});
    const { data: user } = useUserProfile();

    const [activeModalSubject, setActiveModalSubject] = useState<any | null>(null);
    const [totalMarks, setTotalMarks] = useState<number>(100);
    const [duration, setDuration] = useState<number>(180);

    const subscribedSubjects = user?.subjectWiseSubscription
        ?? [];


    const hasGlobalSubscription = Boolean(user && hasActiveSubscription(user))
    // Subscription check
    const hasAnySubscription = hasGlobalSubscription || subscribedSubjects.length > 0;
    console.log('hasSubscription', subscribedSubjects)

    // const onlySubjectWiseSubjscription = 

    // Custom data hooks
    const { data: classes, isLoading: loadingClasses } = useClasses();
    const { data: academicTree, isLoading: loadingTree } = useAcademicTree({
        classId: selectedClass,
        upto: "chapter",
    });

    const paperService = createPaperService(apiClient);

    const selectedClassName = classes?.find((c: any) => c._id === selectedClass)?.name;

    const streams = Array.from(
        new Set(
            (academicTree ?? [])
                .map((subject: any) => subject.stream)
                .filter(Boolean)
        )
    );

    const [errorMessage, setErrorMessage] = useState('');

    const filteredSubjects =
        selectedStream === "all"
            ? academicTree ?? []
            : (academicTree ?? []).filter(
                (subject: any) => subject.stream === selectedStream
            );

    // Handle Paper Creation Mutation
    const createPaperMutation = useMutation({
        mutationFn: async (payload: any) => {
            const data = await paperService.createPaper(payload);
            return data;
        },
        onSuccess: (data) => {
            const firstSubjectId = data.subjects[0]?.subject || data.subjects[0];
            router.push(`/my-papers/${data._id!}/add-questions?class=${data.class}&subject=${firstSubjectId}&chapter=${data.subjects[0]?.chapters[0]}`);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const message = error.response?.data?.message ?? error.message;
            toast.error(message);
            setErrorMessage(message);
        },
    });

    // Handle Class change (resets child selections)
    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setSelectedStream("all");
        setSelectedSubjectsMap({});
    };

    // Modal helpers
    const openChapterModal = (subject: any) => {
        const isAlreadySelected = !!selectedSubjectsMap[subject._id];
        const currentSelectedCount = Object.keys(selectedSubjectsMap).length;

        // If user has no subscription, trying to pick a new subject when 1 is already selected:
        if (!hasAnySubscription && !isAlreadySelected && (currentSelectedCount >= 1)) {
            toast.error("সাবস্ক্রিপশন ছাড়া আপনি একটার বেশি বিষয় সিলেক্ট করতে পারবেন না।");
            return;
        }

        setActiveModalSubject(subject);
    };

    const closeChapterModal = () => {
        setActiveModalSubject(null);
    };

    // Toggle entire subject selection from modal
    const handleSelectAllInModal = (subject: any) => {
        const allChapterIds: string[] = (subject.chapters || []).map((c: any) => c._id);
        const currentSelected = selectedSubjectsMap[subject._id] || [];
        const isAllSelected = allChapterIds.length > 0 && currentSelected.length === allChapterIds.length;

        setSelectedSubjectsMap((prev) => {
            const next = { ...prev };
            if (isAllSelected) {
                delete next[subject._id];
            } else {
                next[subject._id] = allChapterIds;
            }
            return next;
        });
    };

    // Toggle single chapter within modal
    const handleChapterToggleInModal = (subjectId: string, chapterId: string) => {
        setSelectedSubjectsMap((prev) => {
            const currentList = prev[subjectId] || [];
            const isSelected = currentList.includes(chapterId);
            const updatedList = isSelected
                ? currentList.filter((id) => id !== chapterId)
                : [...currentList, chapterId];

            const next = { ...prev };
            if (updatedList.length === 0) {
                delete next[subjectId];
            } else {
                next[subjectId] = updatedList;
            }
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construct IQuestionPaperSubject[]
        const formattedSubjects = Object.entries(selectedSubjectsMap).map(([subjectId, chapters]) => ({
            subject: subjectId,
            chapters,
        }));

        createPaperMutation.mutate({
            title,
            class: selectedClass,
            subjects: formattedSubjects,
            totalMarks,
            duration,
            questions: [],
        });
    };

    const selectedSubjectIds = Object.keys(selectedSubjectsMap);

    const canSubmit = !!selectedClass && selectedSubjectIds.length > 0 && !createPaperMutation.isPending;

    return (
        <div className="min-h-screen py-8 px-4 sm:py-10">
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit}>
                    {/* ── Paper sheet ──────────────────────────────── */}
                    <div className="paper-sheet">
                        {/* Paper header */}
                        <div className="paper-header">
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="প্রশ্নপত্রের একটি নাম লিখুন..."
                                className="paper-title-input"
                            />

                            <div className="paper-meta-row">
                                <div className="paper-meta-item">
                                    <label className="paper-meta-label">শ্রেণী</label>
                                    {loadingClasses ? (
                                        <div className="h-9 w-32 rounded-lg animate-pulse bg-muted" />
                                    ) : (
                                        <select
                                            required
                                            value={selectedClass}
                                            onChange={(e) => handleClassChange(e.target.value)}
                                            className="class-select"
                                        >
                                            <option value="" disabled>
                                                নির্বাচন করুন
                                            </option>
                                            {classes?.map((c: any) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="paper-meta-item">
                                    <label className="paper-meta-label">পূর্ণমান</label>
                                    <MetaStepper value={totalMarks} onChange={setTotalMarks} step={5} min={1} />
                                </div>

                                <div className="paper-meta-item">
                                    <label className="paper-meta-label">সময় (মিনিট)</label>
                                    <MetaStepper value={duration} onChange={setDuration} step={15} min={1} />
                                </div>
                            </div>
                        </div>

                        <div className="paper-divider" />

                        {/* Subject / chapter selection */}
                        <div className="paper-body">
                            {!selectedClass ? (
                                <EmptyNote text="বিষয় ও অধ্যায় নির্বাচন করতে প্রথমে শ্রেণী নির্ধারণ করুন।" />
                            ) : (
                                <>
                                    <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
                                        <h3 className="section-heading">
                                            বিষয় ও অধ্যায় <span className="text-destructive">*</span>
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            {selectedSubjectIds.length
                                                ? `${toBnDigits(selectedSubjectIds.length)} টি বিষয় নির্বাচিত`
                                                : "বিষয় ক্লিক করে অধ্যায় নির্ধারণ করুন"}
                                        </span>
                                    </div>

                                    {loadingTree ? (
                                        <SkeletonTree />
                                    ) : academicTree?.length ? (
                                        <>
                                            {/* Stream Tabs */}
                                            {streams.length > 1 && (
                                                <div className="mb-4 overflow-x-auto">
                                                    <div className="w-max min-w-full gap-1 rounded-xl border border-border bg-muted/40 p-1 flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedStream("all")}
                                                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${selectedStream === "all"
                                                                ? "bg-background text-foreground shadow-sm"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                                                }`}
                                                        >
                                                            সব
                                                        </button>

                                                        {streams.map((stream) => (
                                                            <button
                                                                key={stream}
                                                                type="button"
                                                                onClick={() => setSelectedStream(stream)}
                                                                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${selectedStream === stream
                                                                    ? "bg-background text-foreground shadow-sm"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                                                    }`}
                                                            >
                                                                {getStreamNameBn(stream)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Filtered Subjects */}
                                            {filteredSubjects.length ? (
                                                <div className="grid gap-2.5 md:grid-cols-2 min-w-0">
                                                    {filteredSubjects.map((subject: any) => {
                                                        const selectedChapters =
                                                            selectedSubjectsMap[subject._id] || [];

                                                        const totalChapters = subject.chapters?.length || 0;
                                                        const isSelected = selectedChapters.length > 0;
                                                        const subjectSubscription = subscribedSubjects.find((sub) => sub.subjectId === subject._id);
                                                        const hasSubjectSubscription = subjectSubscription && hasActiveSubjectSubscription(subjectSubscription);
                                                        const locked = hasAnySubscription && (!hasGlobalSubscription && !hasSubjectSubscription);

                                                        return (
                                                            <div
                                                                key={subject._id}
                                                                onClick={() => !locked && openChapterModal(subject)}
                                                                className={`subject-row ${isSelected ? "subject-row--active" : ""
                                                                    }`}
                                                            >
                                                                <div className="min-w-0 flex-1 pr-2">
                                                                    <p className="text-sm font-semibold truncate text-foreground">
                                                                        {subject.name}
                                                                    </p>

                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        {isSelected
                                                                            ? `${toBnDigits(
                                                                                selectedChapters.length
                                                                            )}/${toBnDigits(
                                                                                totalChapters
                                                                            )} অধ্যায় নির্বাচিত`
                                                                            : `${toBnDigits(
                                                                                totalChapters
                                                                            )} টি অধ্যায় আছে`}
                                                                    </p>
                                                                </div>
                                                                {
                                                                    locked && (
                                                                        <Lock size={16} color="gray" />
                                                                    )
                                                                }
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <EmptyNote text="এই বিভাগে কোনো বিষয় পাওয়া যায়নি।" />
                                            )}
                                        </>
                                    ) : (
                                        <EmptyNote text="এই শ্রেণীর জন্য কোনো বিষয় পাওয়া যায়নি।" />
                                    )}
                                </>
                            )}
                        </div>

                        {/* Paper footer / summary strip */}
                        {(title || selectedClassName || selectedSubjectIds.length > 0) && (
                            <>
                                <div className="paper-divider" />
                                <div className="paper-footer">
                                    <SummaryRow label="শিরোনাম" value={title || "—"} />
                                    <SummaryRow label="শ্রেণী" value={selectedClassName || "—"} />
                                    <SummaryRow
                                        label="বিষয়সংখ্যা"
                                        value={selectedSubjectIds.length ? toBnDigits(selectedSubjectIds.length) : "—"}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {errorMessage && <p className="text-center mt-5 text-red-600">
                        {errorMessage}
                    </p>}

                    <PressableButton
                        className="w-full cursor-pointer mt-5"
                        isLoading={createPaperMutation.isPending}
                        disabled={!canSubmit}
                    >
                        <span>{createPaperMutation.isPending ? "তৈরী হচ্ছে..." : "পরবর্তী ধাপ (প্রশ্ন যুক্ত করুন)"}</span>
                    </PressableButton>
                </form>
            </div>

            {/* ── Chapter Selection Modal ────────────────────────────────── */}
            {activeModalSubject && (
                <ChapterSelectionModal
                    subject={activeModalSubject}
                    selectedChapters={selectedSubjectsMap[activeModalSubject._id] || []}
                    onClose={closeChapterModal}
                    onToggleSelectAll={() => handleSelectAllInModal(activeModalSubject)}
                    onToggleChapter={(chapterId) => handleChapterToggleInModal(activeModalSubject._id, chapterId)}
                />
            )}

            <style jsx global>{`
                .paper-sheet {
                    border-radius: var(--radius-lg, 1rem);
                    border: 1.5px solid var(--border);
                    background: var(--card);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.03);
                    overflow: hidden;
                }

                .paper-header {
                    padding: 1.75rem 1.5rem 1.25rem;
                    text-align: center;
                }

                .paper-title-input {
                    width: 100%;
                    text-align: center;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--foreground);
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: 0.25rem 0.5rem;
                    border-bottom: 1.5px dashed;
                    transition: border-color 0.15s ease;
                }
                .paper-title-input::placeholder {
                    color: var(--muted-foreground);
                    font-weight: 500;
                }
                .paper-title-input:focus {
                    border-bottom-color: var(--teal);
                }

                .paper-meta-row {
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                    margin-top: 1rem;
                }

                .paper-meta-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.35rem;
                }

                .paper-meta-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    color: var(--muted-foreground);
                }

                .class-select {
                    padding: 0.45rem 2rem 0.45rem 0.9rem;
                    border-radius: 999px;
                    border: 1.5px solid var(--border);
                    background: var(--background);
                    color: var(--foreground);
                    font-size: 0.875rem;
                    font-weight: 600;
                    outline: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    cursor: pointer;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                }
                .class-select:hover {
                    border-color: var(--teal);
                }
                .class-select:focus {
                    border-color: var(--teal);
                    box-shadow: 0 0 0 3px var(--teal-tint);
                }

                .meta-stepper {
                    display: flex;
                    align-items: center;
                    border-radius: 999px;
                    overflow: hidden;
                    border: 1.5px solid var(--border);
                    background: var(--background);
                }
                .meta-stepper button {
                    width: 1.75rem;
                    height: 1.75rem;
                    font-weight: 600;
                    color: var(--foreground);
                    transition: background-color 0.15s ease;
                }
                .meta-stepper button:hover {
                    background: var(--muted);
                }
                .meta-stepper input {
                    width: 3.25rem;
                    text-align: center;
                    font-size: 0.875rem;
                    font-weight: 700;
                    background: transparent;
                    outline: none;
                    color: var(--foreground);
                }

                .paper-divider {
                    height: 1px;
                    background: repeating-linear-gradient(
                        90deg,
                        var(--border) 0,
                        var(--border) 6px,
                        transparent 6px,
                        transparent 12px
                    );
                }

                .paper-body {
                    padding: 1.5rem;
                }

                .section-heading {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--foreground);
                }

                .subject-row {
                    min-width: 0;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.875rem;
                    border-radius: 0.75rem;
                    border: 1px solid var(--border);
                    background: var(--background);
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .subject-row:hover {
                    border-color: color-mix(in srgb, var(--teal) 50%, transparent);
                }
                .subject-row--active {
                    border-color: var(--teal);
                    background: color-mix(in srgb, var(--teal-tint) 30%, transparent);
                    color: var(--teal-900, inherit);
                }

                .paper-footer {
                    padding: 1rem 1.5rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                    background: color-mix(in srgb, var(--muted) 40%, transparent);
                }
            `}</style>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Modal Component                                                   */
/* ────────────────────────────────────────────────────────────────── */

function ChapterSelectionModal({
    subject,
    selectedChapters,
    onClose,
    onToggleSelectAll,
    onToggleChapter,
}: {
    subject: any;
    selectedChapters: string[];
    onClose: () => void;
    onToggleSelectAll: () => void;
    onToggleChapter: (id: string) => void;
}) {
    const chapters: any[] = subject.chapters || [];
    const isAllSelected = chapters.length > 0 && selectedChapters.length === chapters.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">{subject.name}</h3>
                        <p className="text-xs text-muted-foreground">অধ্যায় নির্বাচন করুন</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Sub-header with Select All */}
                {chapters.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                        <span className="text-xs text-muted-foreground">
                            {toBnDigits(selectedChapters.length)} / {toBnDigits(chapters.length)} টি নির্বাচিত
                        </span>
                        <button
                            type="button"
                            onClick={onToggleSelectAll}
                            className="text-xs font-semibold text-teal hover:underline"
                        >
                            {isAllSelected ? "সব অনির্বাচিত করুন" : "সব সিলেক্ট করুন"}
                        </button>
                    </div>
                )}

                {/* Body (Chapter List) */}
                <div className="p-4 overflow-y-auto space-y-2 flex-1">
                    {chapters.length ? (
                        chapters.map((chapter) => {
                            const isChecked = selectedChapters.includes(chapter._id);
                            return (
                                <button
                                    key={chapter._id}
                                    type="button"
                                    onClick={() => onToggleChapter(chapter._id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isChecked
                                        ? "border-teal bg-teal-tint/40 text-teal-900"
                                        : "border-border bg-background hover:bg-muted/50"
                                        }`}
                                >
                                    <CheckIcon state={isChecked ? "checked" : "unchecked"} />
                                    <span className="text-sm font-medium text-foreground">{chapter.name}</span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-sm text-center py-6 text-muted-foreground">
                            এই বিষয়ের কোনো অধ্যায় নেই।
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-card">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-teal text-white hover:bg-teal-soft transition-colors"
                    >
                        সম্পন্ন
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Presentational components                                         */
/* ────────────────────────────────────────────────────────────────── */

function CheckIcon({
    state,
}: {
    state: "checked" | "unchecked" | "indeterminate";
}) {
    return (
        <span
            className={`flex items-center justify-center w-4.5 h-4.5 shrink-0 text-[10px] font-bold border rounded ${state === "unchecked" ? "border-line bg-transparent" : "border-teal bg-teal text-white"
                }`}
        >
            {state === "checked" ? "✓" : state === "indeterminate" ? "−" : ""}
        </span>
    );
}

function MetaStepper({
    value,
    onChange,
    step,
    min,
}: {
    value: number;
    onChange: (v: number) => void;
    step: number;
    min: number;
}) {
    return (
        <div className="meta-stepper">
            <button type="button" onClick={() => onChange(Math.max(min, value - step))} aria-label="কমান">
                −
            </button>
            <input
                type="number"
                required
                min={min}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            <button type="button" onClick={() => onChange(value + step)} aria-label="বাড়ান">
                +
            </button>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm gap-2">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="font-medium text-right wrap-break-word text-foreground">{value}</span>
        </div>
    );
}

function SkeletonTree() {
    return (
        <div className="grid gap-2 flex-wrap sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse bg-muted" />
            ))}
        </div>
    );
}

function EmptyNote({ text }: { text: string }) {
    return <p className="text-sm py-3 px-1 text-muted-foreground text-center">{text}</p>;
}