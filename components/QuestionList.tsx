"use client";

import { Badge } from "@/components/ui/badge";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useSidebar } from "@/context/SidebarContext";
import { apiClient } from "@/lib/api/api-client";
import { hasActiveSubscription, toBnDigits } from "@/lib/helpers";
import { createPaperService } from "@/services/paper.service";
import { IFilterdQuestion } from "@/types/question";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Eye, LayoutGrid, Menu, Rows } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MobileFilterTrigger } from "./FilterDrawerWrapper";
import QuestionCard from "./QuestionCard";
import { PressableButton } from "./ui/pressable-button";
import { PremiumGate } from "./PremiumGate";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function QuestionList({
    paperId,
    initialSelectedIds = [],
    questions,
    totalPages,
    currentPage,
    resetParams,
}: {
    paperId: string;
    initialSelectedIds?: string[];
    questions: IFilterdQuestion[];
    total: number;
    totalPages: number;
    currentPage: number;
    resetParams: {
        subjectId: string;
        chapterId: string;
        classId?: string;
    };
}) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        () => new Set(initialSelectedIds)
    );
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const [columns, setColumns] = useState<1 | 2>(() => {
        if (typeof window !== "undefined") {
            const savedLayout = localStorage.getItem("question_layout");
            return savedLayout === "1" ? 1 : 2;
        }
        return 2;
    });

    const { toggleMobileMenu } = useSidebar();
    const router = useRouter();
    const { data: user } = useUserProfile();
    const hasEverPurchasedSubjectSubscription =
        (user?.subjectWiseSubscription?.length ?? 0) > 0;
    const hasSubscription = (user ? hasActiveSubscription(user) : false) || hasEverPurchasedSubjectSubscription;
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const paperService = createPaperService(apiClient);
    // Optimistic Toggle Mutation
    const toggleMutation = useMutation({
        mutationFn: async (questionId: string) =>
            paperService.toggleQuestionInPaper(paperId, questionId),

        onMutate: (questionId) => {
            setPendingIds((prev) => new Set(prev).add(questionId));
            setSelectedIds((prev) => {
                const next = new Set(prev);

                if (next.has(questionId)) {
                    next.delete(questionId);
                } else {
                    next.add(questionId);
                }

                return next;
            });
        },

        onSettled: (_, __, questionId) => {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(questionId);
                return next;
            });
        },

        onError: (error: unknown, questionId) => {
            setSelectedIds((prev) => {
                const next = new Set(prev);

                if (next.has(questionId)) {
                    next.delete(questionId);
                } else {
                    next.add(questionId);
                }

                return next;
            });

            let errorMessage = "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।";

            if (isAxiosError(error)) {
                errorMessage =
                    error.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        },
    });

    const toggleSelect = (id: string) => {
        if (pendingIds.has(id)) return;
        toggleMutation.mutate(id);
    };

    const updateColumns = (cols: 1 | 2) => {
        setColumns(cols);
        localStorage.setItem("question_layout", String(cols));
    };

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

    const listContainerRef = useRef<HTMLDivElement>(null);


    // Single Batch MathJax Rendering Effect
    useEffect(() => {
        const w = typeof window !== "undefined" ? (window as any) : undefined;
        if (w && w.MathJax && w.MathJax.Hub) {
            if (listContainerRef.current) {
                // Batch process the entire list container at once
                w.MathJax.Hub.Queue([
                    "Typeset",
                    w.MathJax.Hub,
                    listContainerRef.current,
                ]);
            }
        }
    }, [questions, currentPage]);

    return (
        <div className="pb-4" ref={listContainerRef}>
            {/* Top Header */}
            <div className="flex justify-between items-center border-b sticky top-0 z-10 mb-3 py-3 px-2 bg-white">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-xl bg-card border border-border lg:hidden text-foreground"
                    aria-label="Toggle Navigation"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <Badge variant="secondary">নির্বাচিত: {toBnDigits(selectedIds.size)} টি</Badge>

                <PressableButton onClick={() => router.push(`/my-papers/${paperId}`)} className="flex items-center gap-1 cursor-pointer" size={'sm'}>
                    <Eye size={14} />
                    <span>প্রিভিউ</span>
                </PressableButton>

                <div className="flex items-center gap-2">
                    {/* View Switcher: Hidden on Mobile */}
                    <div className="hidden md:flex items-center gap-1 border rounded-lg p-1 bg-slate-50">
                        <button
                            type="button"
                            onClick={() => updateColumns(1)}
                            className={`p-1.5 rounded transition-colors ${columns === 1
                                ? "bg-white text-slate-900 shadow-sm font-semibold"
                                : "text-slate-500 hover:text-slate-900"
                                }`}
                            title="১ কলাম"
                        >
                            <Rows className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => updateColumns(2)}
                            className={`p-1.5 rounded transition-colors ${columns === 2
                                ? "bg-white text-slate-900 shadow-sm font-semibold"
                                : "text-slate-500 hover:text-slate-900"
                                }`}
                            title="২ কলাম"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    <MobileFilterTrigger />
                </div>
            </div>

            {/* Questions Grid */}
            {questions.length === 0 ? (
                <p className="text-slate-500 py-10 text-center">
                    কোন প্রশ্ন পাওয়া যায়নি।
                    <br />
                    <PressableButton href={`/my-papers/${paperId}/add-questions?class=${resetParams.classId}&subject=${resetParams.subjectId}&chapter=${resetParams.chapterId}`}>ফিল্টার রিসেট করুন</PressableButton>
                </p>
            ) : (
                <div
                    className={`grid gap-3 px-1 grid-cols-1 ${columns === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
                        }`}
                >
                    {questions.map((q, index) => {
                        const isSelected = selectedIds.has(q._id);
                        const isPending = pendingIds.has(q._id);
                        return (
                            <QuestionCard
                                key={q._id}
                                question={q}
                                questionNo={(currentPage - 1) * 20 + index + 1}
                                isSelected={isSelected}
                                isPending={isPending}
                                toggleSelect={toggleSelect}
                            />
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pt-6">
                    <PremiumGate locked={!hasSubscription}>
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
                    </PremiumGate>
                </div>

            )}
        </div>
    );
}