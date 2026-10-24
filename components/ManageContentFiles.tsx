'use client';

import { useSidebar } from '@/context/SidebarContext';
import { apiClient } from '@/lib/api/api-client';
import { toBnDigits } from '@/lib/helpers';
import { createContentService, IFilteredContent, tagType } from '@/services/content.service';
import {
    ExternalLink,
    FileCode,
    FileText,
    Loader2,
    Menu,
    Plus,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { MobileFilterTrigger } from './FilterDrawerWrapper';
import { Badge } from './ui/badge';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IContentNode } from '@/services/content-node.service';

const contentService = createContentService(apiClient);

interface ManageContentFilesProps {
    initialFiles: IFilteredContent[];
    contentNodeId: string;
    total: number;
    totalPages: number;
    currentPage: number;
    selectedNode: IContentNode | null;
}

const AVAILABLE_TAGS: { label: string; value: tagType }[] = [
    { label: "গাইড", value: "guide" },
    { label: "মূল বই", value: "main_book" },
    { label: "লেকচার শিট", value: "lecture_sheet" },
    { label: "মূল বই সমাধান", value: "main_book_solved" },
];

const getTagLabel = (tag: tagType) => (AVAILABLE_TAGS.find((t) => t.value === tag)?.label) || tag;

export default function ManageContentFiles({
    initialFiles,
    contentNodeId,
    currentPage,
    totalPages,
    selectedNode
}: ManageContentFilesProps) {
    const [files, setFiles] = useState<IFilteredContent[]>(initialFiles);
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toggleMobileMenu } = useSidebar();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState<'pdf' | 'docx'>('pdf');
    const [tags, setTags] = useState<tagType[]>(['guide']);

    const handleTagToggle = (tagValue: tagType) => {
        setTags((prevTags) =>
            prevTags.includes(tagValue)
                ? prevTags.filter((t) => t !== tagValue)
                : [...prevTags, tagValue]
        );
    };

    const handleCreateFile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            alert('Please enter a valid URL.');
            return;
        };

        try {
            setIsSubmitting(true);
            const newFile = await contentService.createContent({
                title,
                description,
                url,
                type,
                tags,
                contentNode: contentNodeId,
            });

            // Update UI state with newly created file
            setFiles((prev) => [newFile, ...prev]);

            // Reset form & close modal
            setTitle('');
            setDescription('');
            setUrl('');
            setType('pdf');
            setTags([]);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to create file:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));
        router.push(`${pathname}?${params.toString()}`);
    };

    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("ellipsis");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("ellipsis");
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="space-y-6 mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b sticky top-0 z-10 mb-3 py-3 px-2 bg-white">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-xl bg-card border border-border lg:hidden text-foreground"
                    aria-label="Toggle Navigation"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <Badge variant="secondary">{toBnDigits(files.length)} টি ফাইল</Badge>

                <button
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    নতুন ফাইল
                </button>

                <div className="flex items-center gap-2">
                    <MobileFilterTrigger />
                </div>
            </div>

            {/* Add File Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border border-border w-full max-w-md rounded-xl shadow-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-semibold text-base">{selectedNode?.name}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-muted-foreground hover:text-foreground rounded-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateFile} className="space-y-4">
                            {/* <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Chapter 1 Notes"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div> */}

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as 'pdf' | 'docx')}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="pdf">PDF Document (.pdf)</option>
                                    <option value="docx">Word Document (.docx)</option>
                                </select>
                            </div>

                            {/* Tags Selection */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_TAGS.map((tag) => {
                                        const isSelected = tags.includes(tag.value);
                                        return (
                                            <button
                                                key={tag.value}
                                                type="button"
                                                onClick={() => handleTagToggle(tag.value)}
                                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${isSelected
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-accent/50 text-muted-foreground border-border hover:bg-accent'
                                                    }`}
                                            >
                                                {tag.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">File URL</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/file.pdf"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Description (Optional)
                                </label>
                                <textarea
                                    placeholder="Brief summary of the document..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="h-9 px-4 rounded-md border border-input text-xs font-medium hover:bg-accent transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Save File'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedNode && (
                <div>
                    <h1 className="text-center font-semibold">{selectedNode?.name}</h1>
                </div>
            )}

            {/* Files List */}
            <div className="space-y-3">
                {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center">
                        <FileCode className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">কোনো ফাইল পাওয়া যায় নি।</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            উক্ত টপিকের জন্য কোনো ফাইল পাওয়া যায় নি।
                        </p>
                    </div>
                ) : (
                    files.map((file) => (
                        <div
                            key={file._id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{file.contentNode.name}</span>
                                        {
                                            file.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] font-semibold  px-1.5 py-0.5 rounded-full bg-primary text-white "
                                                >
                                                    {getTagLabel(tag)}
                                                </span>
                                            ))
                                        }
                                        <span
                                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${file.type === 'pdf'
                                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}
                                        >
                                            {file.type}
                                        </span>
                                    </div>

                                    {file.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {file.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                                title="Open Document"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pt-6">
                    <Pagination>
                        <PaginationContent className="flex-wrap justify-center gap-1">
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) goToPage(currentPage - 1);
                                    }}
                                    className={
                                        currentPage === 1
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>

                            {getPageNumbers().map((page, index) => (
                                <PaginationItem key={index}>
                                    {page === "ellipsis" ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            href="#"
                                            isActive={page === currentPage}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                goToPage(page as number);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) goToPage(currentPage + 1);
                                    }}
                                    className={
                                        currentPage === totalPages
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}