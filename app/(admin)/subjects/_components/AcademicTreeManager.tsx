"use client";

import React, { useState } from "react";

import {
    BookOpen,
    Check,
    ChevronDown,
    ChevronRight,
    Edit2,
    Eye,
    EyeOff,
    FileText,
    Folder,
    GripVertical,
    Loader2,
    X,
} from "lucide-react";

import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
    useAcademicTree,
    useReorderAcademic,
    useUpdateChapter,
    useUpdateSubject,
    useUpdateTopic,
} from "@/hooks/use-academic";

type AcademicType = "subject" | "chapter" | "topic";

interface AcademicNode {
    _id: string;
    name: string;
    order: number;
    isActive: boolean;
    chapters?: AcademicNode[];
    topics?: AcademicNode[];
}

interface AcademicTreeManagerProps {
    classId: string;
}

export const AcademicTreeManager: React.FC<
    AcademicTreeManagerProps
> = ({ classId }) => {
    const {
        data,
        isLoading,
        isError,
    } = useAcademicTree({
        classId,
        upto: "topic",
        status: "all",
    });

    const [localTree, setLocalTree] = useState<
        AcademicNode[] | null
    >(null);

    const tree = (localTree ?? data ?? []) as AcademicNode[];

    const [draggedItem, setDraggedItem] = useState<{
        type: AcademicType;
        id: string;
    } | null>(null);

    const reorderMutation = useReorderAcademic();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading academic structure...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                Failed to load academic tree data.
            </div>
        );
    }

    const handleDragStart = (event: any) => {
        const type = event.active.data.current?.type;
        const id = event.active.id;

        if (!type) return;

        setDraggedItem({
            type,
            id,
        });
    };

    const handleDragCancel = () => {
        setDraggedItem(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setDraggedItem(null);

        if (!over || active.id === over.id) {
            return;
        }

        const activeData = active.data.current;
        const overData = over.data.current;

        if (!activeData || !overData) {
            return;
        }

        const type = activeData.type as AcademicType;

        const activeParentId = activeData.parentId as string;
        const overParentId = overData.parentId as string;

        // Don't allow moving an item between different parents.
        if (activeParentId !== overParentId) {
            return;
        }

        if (type !== overData.type) {
            return;
        }

        const activeId = String(active.id);
        const overId = String(over.id);

        // Save current state for rollback.
        const previousTree = tree;

        let nextTree: AcademicNode[] | null = null;
        let orderedIds: string[] = [];

        if (type === "subject") {
            const oldIndex = tree.findIndex(
                (item) => item._id === activeId,
            );

            const newIndex = tree.findIndex(
                (item) => item._id === overId,
            );

            if (oldIndex === -1 || newIndex === -1) {
                return;
            }

            nextTree = arrayMove(
                tree,
                oldIndex,
                newIndex,
            );

            orderedIds = nextTree.map(
                (item) => item._id,
            );
        }

        if (type === "chapter") {
            nextTree = tree.map((subject) => {
                if (subject._id !== activeParentId) {
                    return subject;
                }

                const chapters = subject.chapters ?? [];

                const oldIndex = chapters.findIndex(
                    (item) => item._id === activeId,
                );

                const newIndex = chapters.findIndex(
                    (item) => item._id === overId,
                );

                if (
                    oldIndex === -1 ||
                    newIndex === -1
                ) {
                    return subject;
                }

                const nextChapters = arrayMove(
                    chapters,
                    oldIndex,
                    newIndex,
                );

                orderedIds = nextChapters.map(
                    (item) => item._id,
                );

                return {
                    ...subject,
                    chapters: nextChapters,
                };
            });
        }

        if (type === "topic") {
            nextTree = tree.map((subject) => {
                const chapters = subject.chapters ?? [];

                return {
                    ...subject,

                    chapters: chapters.map((chapter) => {
                        if (chapter._id !== activeParentId) {
                            return chapter;
                        }

                        const topics = chapter.topics ?? [];

                        const oldIndex = topics.findIndex(
                            (item) => item._id === activeId,
                        );

                        const newIndex = topics.findIndex(
                            (item) => item._id === overId,
                        );

                        if (
                            oldIndex === -1 ||
                            newIndex === -1
                        ) {
                            return chapter;
                        }

                        const nextTopics = arrayMove(
                            topics,
                            oldIndex,
                            newIndex,
                        );

                        orderedIds = nextTopics.map(
                            (item) => item._id,
                        );

                        return {
                            ...chapter,
                            topics: nextTopics,
                        };
                    }),
                };
            });
        }

        if (!nextTree || !orderedIds.length) {
            return;
        }

        // Optimistic update.
        setLocalTree(nextTree);

        reorderMutation.mutate(
            {
                type,
                parentId: activeParentId,
                orderedIds,
            },
            {
                onSuccess: () => {
                    setLocalTree(null);
                },

                onError: () => {
                    setLocalTree(previousTree);
                },
            },
        );
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full max-w-4xl mx-auto space-y-3">
                {!tree.length ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl dark:border-slate-800">
                        No subjects found for this class.
                    </div>
                ) : (
                    <SortableContext
                        items={tree.map(
                            (subject) => subject._id,
                        )}
                        strategy={verticalListSortingStrategy}
                    >
                        {tree.map((subject) => (
                            <SubjectNode
                                key={subject._id}
                                subject={subject}
                                classId={classId}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>

            <DragOverlay>
                {draggedItem ? (
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl text-sm">
                        {findDraggedName(
                            tree,
                            draggedItem.type,
                            draggedItem.id,
                        )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

const findDraggedName = (
    tree: AcademicNode[],
    type: AcademicType,
    id: string,
): string => {
    if (type === "subject") {
        return (
            tree.find(
                (item) => item._id === id,
            )?.name ?? ""
        );
    }

    for (const subject of tree) {
        if (type === "chapter") {
            const chapter = subject.chapters?.find(
                (item) => item._id === id,
            );

            if (chapter) {
                return chapter.name;
            }
        }

        if (type === "topic") {
            for (const chapter of subject.chapters ?? []) {
                const topic = chapter.topics?.find(
                    (item) => item._id === id,
                );

                if (topic) {
                    return topic.name;
                }
            }
        }
    }

    return "";
};
/* ==========================================================================
   SUBJECT NODE
   ========================================================================== */
const SubjectNode = ({
    subject,
    classId,
}: {
    subject: AcademicNode;
    classId: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditingName, setIsEditingName] =
        useState(false);
    const [name, setName] = useState(subject.name);

    const updateSubjectMutation =
        useUpdateSubject();

    const toggleSubjectActive = () => {
        const confirm = window.confirm(
            "Are you sure you want to deactivate this subject?",
        );

        if (!confirm) return;

        updateSubjectMutation.mutate({
            id: subject._id,
            payload: {
                isActive: !subject.isActive,
            },
        });
    };

    const saveName = () => {
        if (
            name.trim() &&
            name !== subject.name
        ) {
            updateSubjectMutation.mutate(
                {
                    id: subject._id,
                    payload: {
                        name: name.trim(),
                    },
                },
                {
                    onSuccess: () =>
                        setIsEditingName(false),
                },
            );
        } else {
            setIsEditingName(false);
        }
    };

    return (
        <SortableItem
            id={subject._id}
            type="subject"
            parentId={classId}
        >
            <div
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${subject.isActive
                    ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    : "border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75"
                    }`}
            >
                <div className="flex items-center justify-between p-3.5 pl-10 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={() =>
                                setIsOpen(!isOpen)
                            }
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                        >
                            {isOpen ? (
                                <ChevronDown className="w-5 h-5" />
                            ) : (
                                <ChevronRight className="w-5 h-5" />
                            )}
                        </button>

                        <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />

                        {isEditingName ? (
                            <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    className="w-full px-2.5 py-1 text-sm bg-white dark:bg-slate-800 border border-indigo-500 rounded-md outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            saveName();
                                        }

                                        if (e.key === "Escape") {
                                            setName(subject.name);
                                            setIsEditingName(false);
                                        }
                                    }}
                                />

                                <button
                                    onClick={saveName}
                                    disabled={
                                        updateSubjectMutation.isPending
                                    }
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                    <Check className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => {
                                        setName(subject.name);
                                        setIsEditingName(false);
                                    }}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <span
                                className={`font-semibold text-base truncate ${subject.isActive
                                    ? "text-slate-800 dark:text-slate-100"
                                    : "text-slate-400 dark:text-slate-500 line-through"
                                    }`}
                            >
                                {subject.name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() =>
                                setIsEditingName(true)
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                            title="Edit Subject Name"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={toggleSubjectActive}
                            disabled={
                                updateSubjectMutation.isPending
                            }
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${subject.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            {subject.isActive ? (
                                <Eye className="w-3.5 h-3.5" />
                            ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                            )}

                            {subject.isActive
                                ? "Active"
                                : "Inactive"}
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="pl-6 pr-3.5 pb-3.5 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/20">
                        {!subject.chapters?.length ? (
                            <p className="text-xs text-slate-400 py-2 pl-4">
                                No chapters found.
                            </p>
                        ) : (
                            <SortableContext
                                items={subject.chapters.map(
                                    (chapter) => chapter._id,
                                )}
                                strategy={
                                    verticalListSortingStrategy
                                }
                            >
                                {subject.chapters.map(
                                    (chapter) => (
                                        <ChapterNode
                                            key={chapter._id}
                                            chapter={chapter}
                                            subjectId={subject._id}
                                        />
                                    ),
                                )}
                            </SortableContext>
                        )}
                    </div>
                )}
            </div>
        </SortableItem>
    );
};

/* ==========================================================================
   CHAPTER NODE
   ========================================================================== */
const ChapterNode = ({
    chapter,
    subjectId,
}: {
    chapter: AcademicNode;
    subjectId: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditingName, setIsEditingName] =
        useState(false);
    const [name, setName] = useState(chapter.name);

    const updateChapterMutation =
        useUpdateChapter();

    const toggleChapterActive = () => {
        const confirm = window.confirm(
            "Are you sure you want to deactivate this chapter?",
        );

        if (!confirm) return;

        updateChapterMutation.mutate({
            id: chapter._id,
            payload: {
                isActive: !chapter.isActive,
            },
        });
    };

    const saveName = () => {
        if (
            name.trim() &&
            name !== chapter.name
        ) {
            updateChapterMutation.mutate(
                {
                    id: chapter._id,
                    payload: {
                        name: name.trim(),
                    },
                },
                {
                    onSuccess: () =>
                        setIsEditingName(false),
                },
            );
        } else {
            setIsEditingName(false);
        }
    };

    return (
        <SortableItem
            id={chapter._id}
            type="chapter"
            parentId={subjectId}
        >
            <div
                className={`border rounded-lg transition-all ${chapter.isActive
                    ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    : "border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/30 opacity-75"
                    }`}
            >
                <div className="flex items-center justify-between p-2.5 pl-9">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <button
                            onClick={() =>
                                setIsOpen(!isOpen)
                            }
                            className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                        >
                            {isOpen ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>

                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />

                        {isEditingName ? (
                            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    className="w-full px-2 py-0.5 text-sm bg-white dark:bg-slate-800 border border-indigo-500 rounded outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            saveName();
                                        }

                                        if (e.key === "Escape") {
                                            setName(chapter.name);
                                            setIsEditingName(false);
                                        }
                                    }}
                                />

                                <button
                                    onClick={saveName}
                                    disabled={
                                        updateChapterMutation.isPending
                                    }
                                    className="p-1 text-emerald-600"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </button>

                                <button
                                    onClick={() => {
                                        setName(chapter.name);
                                        setIsEditingName(false);
                                    }}
                                    className="p-1 text-rose-500"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <span
                                className={`font-medium text-sm truncate ${chapter.isActive
                                    ? "text-slate-700 dark:text-slate-200"
                                    : "text-slate-400 line-through"
                                    }`}
                            >
                                {chapter.name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() =>
                                setIsEditingName(true)
                            }
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={toggleChapterActive}
                            disabled={
                                updateChapterMutation.isPending
                            }
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${chapter.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            {chapter.isActive ? (
                                <Eye className="w-3 h-3" />
                            ) : (
                                <EyeOff className="w-3 h-3" />
                            )}

                            {chapter.isActive
                                ? "Active"
                                : "Inactive"}
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="pl-6 pr-2.5 pb-2 pt-1 space-y-1.5 border-t border-slate-100 dark:border-slate-800/40">
                        {!chapter.topics?.length ? (
                            <p className="text-xs text-slate-400 py-1 pl-4">
                                No topics found.
                            </p>
                        ) : (
                            <SortableContext
                                items={chapter.topics.map(
                                    (topic) => topic._id,
                                )}
                                strategy={
                                    verticalListSortingStrategy
                                }
                            >
                                {chapter.topics.map(
                                    (topic) => (
                                        <TopicNode
                                            key={topic._id}
                                            topic={topic}
                                            chapterId={chapter._id}
                                        />
                                    ),
                                )}
                            </SortableContext>
                        )}
                    </div>
                )}
            </div>
        </SortableItem>
    );
};

/* ==========================================================================
   TOPIC NODE
   ========================================================================== */
const TopicNode = ({
    topic,
    chapterId,
}: {
    topic: AcademicNode;
    chapterId: string;
}) => {
    const [isEditingName, setIsEditingName] =
        useState(false);

    const [name, setName] = useState(topic.name);

    const updateTopicMutation =
        useUpdateTopic();

    const toggleTopicActive = () => {
        updateTopicMutation.mutate({
            id: topic._id,
            payload: {
                isActive: !topic.isActive,
            },
        });
    };

    const saveName = () => {
        if (
            name.trim() &&
            name !== topic.name
        ) {
            updateTopicMutation.mutate(
                {
                    id: topic._id,
                    payload: {
                        name: name.trim(),
                    },
                },
                {
                    onSuccess: () =>
                        setIsEditingName(false),
                },
            );
        } else {
            setIsEditingName(false);
        }
    };

    return (
        <SortableItem
            id={topic._id}
            type="topic"
            parentId={chapterId}
        >
            <div
                className={`flex items-center justify-between p-2 pl-9 rounded-md border ${topic.isActive
                    ? "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/40"
                    : "bg-slate-100/30 dark:bg-slate-900/20 border-transparent opacity-60"
                    }`}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-sky-500 shrink-0" />

                    {isEditingName ? (
                        <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                className="w-full px-2 py-0.5 text-xs bg-white dark:bg-slate-800 border border-indigo-500 rounded outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        saveName();
                                    }

                                    if (e.key === "Escape") {
                                        setName(topic.name);
                                        setIsEditingName(false);
                                    }
                                }}
                            />

                            <button
                                onClick={saveName}
                                disabled={
                                    updateTopicMutation.isPending
                                }
                                className="p-0.5 text-emerald-600"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>

                            <button
                                onClick={() => {
                                    setName(topic.name);
                                    setIsEditingName(false);
                                }}
                                className="p-0.5 text-rose-500"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <span
                            className={`text-xs truncate ${topic.isActive
                                ? "text-slate-600 dark:text-slate-300"
                                : "text-slate-400 line-through"
                                }`}
                        >
                            {topic.name}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() =>
                            setIsEditingName(true)
                        }
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>

                    <button
                        onClick={toggleTopicActive}
                        disabled={
                            updateTopicMutation.isPending
                        }
                        className={`p-1 rounded-md ${topic.isActive
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-slate-400 hover:bg-slate-200"
                            }`}
                        title={
                            topic.isActive
                                ? "Mark Inactive"
                                : "Mark Active"
                        }
                    >
                        {topic.isActive ? (
                            <Eye className="w-3.5 h-3.5" />
                        ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            </div>
        </SortableItem>
    );
};


interface SortableItemProps {
    id: string;
    type: AcademicType;
    parentId: string;
    children: React.ReactNode;
}

const SortableItem = ({
    id,
    type,
    parentId,
    children,
}: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            type,
            parentId,
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        position: "relative",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={isDragging ? "opacity-40" : ""}
        >
            <div className="relative">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="
            absolute
            left-1
            top-1/2
            -translate-y-1/2
            z-10
            p-1
            text-slate-300
            hover:text-slate-500
            dark:text-slate-600
            dark:hover:text-slate-300
            cursor-grab
            active:cursor-grabbing
            touch-none
          "
                    title="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {children}
            </div>
        </div>
    );
};