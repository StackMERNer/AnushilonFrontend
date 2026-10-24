'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api/api-client';
import { createContentNodeService, IContentNode } from '@/services/content-node.service';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    Edit2,
    Check,
    X,
    Power,
    Loader2,
} from 'lucide-react';
import { useContentNodes } from '@/hooks/useContentNodes';
import clsx from 'clsx';
import { useUserProfile } from '@/hooks/useUserProfile';

const nodeService = createContentNodeService(apiClient);

export default function ContentFilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [, startTransition] = useTransition();

    const classId = searchParams.get('classId') || '';
    const selectedNodeId = searchParams.get('selectedNodeId') || '';

    const { data: flatNodes = [], refetch, isLoading } = useContentNodes();
    const { data: user } = useUserProfile();
    const isAdmin = user?.role === 'teacher';
    const [isEditingMode, setIsEditingMode] = useState(false);

    const [rootName, setRootName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tree UI state tracking
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
    const [activeAddParentId, setActiveAddParentId] = useState<string | null>(null);
    const [childName, setChildName] = useState('');

    // Editing state tracking
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    // Extract top-level root nodes as classes (parent === null or undefined)
    const classNodes = flatNodes.filter((n) => !n.parent);

    const updateQueryParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Reset pagination on any filter change
        params.delete('page');

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleSelectClass = (cls: IContentNode) => {
        updateQueryParams({
            classId: cls._id || null,
            selectedNodeId: cls._id || null, // Auto select the class node
        });
    };

    const handleSelectNode = (nodeId: string) => {
        updateQueryParams({
            selectedNodeId: nodeId,
        });
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rootName.trim()) return;

        try {
            setIsSubmitting(true);
            await nodeService.createContentNode({ name: rootName, parent: null });
            await refetch();
            setRootName('');
        } catch (err) {
            console.error('Failed to create class node:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddChild = async (parentId: string) => {
        if (!childName.trim()) return;

        try {
            await nodeService.createContentNode({ name: childName, parent: parentId });
            setExpandedNodes((prev) => ({ ...prev, [parentId]: true }));
            setChildName('');
            setActiveAddParentId(null);
            await refetch();
        } catch (err) {
            console.error('Failed to add child node:', err);
        }
    };

    const handleToggleStatus = async (node: IContentNode) => {
        if (!node._id) return;
        try {
            await nodeService.updateContentNode(node._id, { isActive: !node.isActive });
            await refetch();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleSaveRename = async (id: string) => {
        if (!editingName.trim()) return;

        try {
            await nodeService.updateContentNode(id, { name: editingName });
            setEditingId(null);
            await refetch();
        } catch (err) {
            console.error('Failed to rename node:', err);
        }
    };

    const renderTree = (parentId: string, depth = 0) => {
        const currentNodes = flatNodes.filter((n) => n.parent === parentId);

        if (currentNodes.length === 0) return null;

        return (
            <div className="space-y-1 mt-1">
                {currentNodes.map((node) => {
                    const isExpanded = !!expandedNodes[node._id!];
                    const hasChildren = flatNodes.some((n) => n.parent === node._id);
                    const isSelected = selectedNodeId === node._id;
                    return (
                        <div key={node._id} style={{ paddingLeft: depth === 0 ? 0 : `10px` }} className="space-y-1">
                            <div
                                onClick={() => handleSelectNode(node._id!)}
                                className={clsx(
                                    'group flex items-center justify-between p-2 rounded-lg cursor-pointer border text-xs transition-all',
                                    isSelected
                                        ? 'bg-teal-tint border-teal/40 font-medium'
                                        : 'bg-card border-border hover:bg-accent/50',
                                    !node.isActive && 'opacity-60 border-dashed'
                                )}
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <button
                                        type="button"
                                        onClick={(e) => toggleExpand(node._id!, e)}
                                        className={clsx(
                                            'p-0.5 text-muted-foreground hover:text-foreground shrink-0',
                                            !hasChildren && 'invisible'
                                        )}
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        ) : (
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        )}
                                    </button>

                                    <RadioDot checked={isSelected} />

                                    {editingId === node._id ? (
                                        <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="h-7 px-2 rounded border border-input bg-background text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveRename(node._id!)}
                                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1 text-destructive hover:bg-destructive/10 rounded"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="truncate">{node.name}</span>
                                    )}
                                </div>

                                {/* Node Admin Actions */}
                                {isEditingMode && (
                                    <div
                                        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => handleToggleStatus(node)}
                                            title={node.isActive ? 'Deactivate' : 'Activate'}
                                            className={`p-1 rounded transition-colors ${node.isActive
                                                ? 'text-emerald-600 hover:bg-emerald-50'
                                                : 'text-muted-foreground hover:bg-accent'
                                                }`}
                                        >
                                            <Power className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setActiveAddParentId(node._id!);
                                                setChildName('');
                                            }}
                                            title="Add Child"
                                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setEditingId(node._id!);
                                                setEditingName(node.name);
                                            }}
                                            title="Rename"
                                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {activeAddParentId === node._id && (
                                <div
                                    style={{ marginLeft: '16px' }}
                                    className="flex items-center gap-1.5 p-1.5 border border-dashed rounded-lg bg-accent/40"
                                >
                                    <input
                                        type="text"
                                        value={childName}
                                        onChange={(e) => setChildName(e.target.value)}
                                        placeholder="Sub-topic name..."
                                        className="h-7 px-2 rounded border border-input bg-background text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleAddChild(node._id!)}
                                        className="h-7 px-2.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 shrink-0"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setActiveAddParentId(null)}
                                        className="p-1 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {isExpanded && renderTree(node._id!, depth + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <aside className="w-full max-w-xs flex flex-col gap-4 p-3 border border-border rounded-xl bg-background">
            {isAdmin && (
                <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-muted-foreground font-medium">এডিটিং মোড</span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isEditingMode}
                        onClick={() => setIsEditingMode(!isEditingMode)}
                        className={clsx(
                            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                            isEditingMode ? 'bg-teal' : 'bg-muted'
                        )}
                    >
                        <span
                            className={clsx(
                                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
                                isEditingMode ? 'translate-x-4' : 'translate-x-0'
                            )}
                        />
                    </button>
                </div>
            )}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    শ্রেণি নির্বাচন করুন
                </label>
                {isLoading ? (
                    <SkeletonBlock />
                ) : (
                    <ClassDropdown
                        classes={classNodes}
                        selectedId={classId}
                        onSelect={handleSelectClass}
                    />
                )}
            </div>

            {isEditingMode && (
                <form onSubmit={handleCreateClass} className="flex gap-1.5">
                    <input
                        type="text"
                        value={rootName}
                        onChange={(e) => setRootName(e.target.value)}
                        placeholder="নতুন ক্লাস.."
                        className="flex-1 h-8 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !rootName.trim()}
                        className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Plus className="w-3.5 h-3.5" />
                        )}
                    </button>
                </form>
            )}

            <div className="border-t border-border pt-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    বিষয়/অধ্যায়/টপিক
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-6 text-xs text-muted-foreground gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading topics...
                    </div>
                ) : !classId ? (
                    <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                        একটি শ্রেণি নির্বাচন করুন
                    </div>
                ) : (
                    <div className="space-y-1">
                        {/* Top-level option for selecting the Class root itself */}
                        {/* {(() => {
                            const currentClass = flatNodes.find((n) => n._id === classId);
                            if (!currentClass) return null;
                            const isSelected = selectedNodeId === currentClass._id;

                            return (
                                <div
                                    onClick={() => handleSelectNode(currentClass._id!)}
                                    className={clsx(
                                        'flex items-center justify-between px-2 py-3 rounded-lg cursor-pointer border text-xs font-semibold transition-all mb-2',
                                        isSelected
                                            ? 'bg-teal-tint border-teal/40 text-teal'
                                            : 'bg-muted/40 border-border hover:bg-accent'
                                    )}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <RadioDot checked={isSelected} />
                                        <span className="truncate">সম্পূর্ণ {currentClass.name}</span>
                                    </div>
                                    {isEditingMode && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveAddParentId(currentClass._id!);
                                                setChildName('');
                                            }}
                                            title="Add Subject/Sub-node"
                                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })()} */}
                        {(() => {
                            const currentClass = flatNodes.find((n) => n._id === classId);
                            if (!currentClass) return null;
                            return (
                                <>
                                    {isEditingMode && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveAddParentId(currentClass._id!);
                                                setChildName('');
                                            }}
                                            title="Add Subject/Sub-node"
                                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </>
                            );
                        })()}

                        {activeAddParentId === classId && (
                            <div className="flex items-center gap-1.5 p-1.5 border border-dashed rounded-lg bg-accent/40 mb-2">
                                <input
                                    type="text"
                                    value={childName}
                                    onChange={(e) => setChildName(e.target.value)}
                                    placeholder="Subject/Topic name..."
                                    className="h-7 px-2 rounded border border-input bg-background text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleAddChild(classId)}
                                    className="h-7 px-2.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 shrink-0"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setActiveAddParentId(null)}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {renderTree(classId)}
                    </div>
                )}
            </div>
        </aside>
    );
}

function RadioDot({ checked }: { checked: boolean }) {
    return (
        <span
            className={clsx(
                'flex items-center justify-center w-3.5 h-3.5 shrink-0 rounded-full border transition-colors',
                checked ? 'border-teal bg-teal/10' : 'border-muted-foreground/40'
            )}
        >
            {checked && <span className="w-1.5 h-1.5 rounded-full bg-teal" />}
        </span>
    );
}

function DownChevron({ open }: { open: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            className={clsx('w-4 h-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
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

function ClassDropdown({
    classes,
    selectedId,
    onSelect,
}: {
    classes: IContentNode[];
    selectedId?: string;
    onSelect: (cls: IContentNode) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = classes.find((c) => c._id === selectedId);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div ref={rootRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent text-left transition-colors"
            >
                <span
                    className={clsx(
                        'text-xs truncate',
                        selected ? 'text-teal font-semibold' : 'text-muted-foreground'
                    )}
                >
                    {selected ? selected.name : 'শ্রেণী নির্বাচন করুন'}
                </span>
                <DownChevron open={open} />
            </button>

            <div
                className={clsx(
                    'absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-xl transition-all duration-200 ease-out',
                    open
                        ? 'max-h-64 opacity-100 scale-100'
                        : 'max-h-0 opacity-0 scale-95 pointer-events-none p-0 border-0'
                )}
            >
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
                                    'w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg transition-colors',
                                    active ? 'bg-teal-tint font-medium' : 'hover:bg-muted text-foreground'
                                )}
                            >
                                <RadioDot checked={active} />
                                <span
                                    className={clsx(
                                        'text-xs truncate',
                                        active ? 'text-teal font-semibold' : 'text-foreground'
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

function SkeletonBlock() {
    return <div className="h-9 rounded-lg animate-pulse bg-muted" />;
}