"use client";

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
import { useUserProfile } from "@/hooks/useUserProfile";
import { apiClient } from "@/lib/api/api-client";
import { hasActiveSubscription } from "@/lib/helpers";
import { createPaperService } from "@/services/paper.service";
import { IFilterdQuestion } from "@/types/question";
import { Menu } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MobileFilterTrigger } from "./FilterDrawerWrapper";
import { PremiumGate } from "./PremiumGate";
import QuestionCard from "./QuestionCard";
import { ThemeToggle } from "./theme-toggle";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

export default function QuestionList({
    questions,
    totalPages,
    currentPage,
    questionType
}: {
    questions: IFilterdQuestion[];
    total: number;
    totalPages: number;
    currentPage: number;
    questionType?: string;
    resetParams: {
        subjectId: string;
        chapterId: string;
        classId?: string;
    };
}) {
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
    const [showMcqAns, setShowMcqAns] = useState<boolean>(false);

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
    }, [questions, currentPage, showMcqAns]);



    return (
        <div className="pb-4" ref={listContainerRef}>
            {/* Top Header */}
            <div className="flex justify-between items-center sticky top-0 z-10 mb-3 py-2 px-2 border rounded-lg bg-white dark:bg-neutral-800 mt-2">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-xl bg-card border border-border lg:hidden text-foreground"
                    aria-label="Toggle Navigation"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {(questionType === "mcq" || questionType === "en_mcq") && <div className="flex items-center justify-center gap-2">
                    <Checkbox id="mcqAns" checked={!showMcqAns} onCheckedChange={(value) => setShowMcqAns(!value)} /> <Label htmlFor="mcqAns" className="text-xs font-semibold text-green-700 dark:text-green-400">MCQ প্র্যাকটিস মোড</Label>
                </div>}


                <div className="flex items-center gap-2">
                    <MobileFilterTrigger />
                </div>
                <ThemeToggle />
            </div>

            {/* Questions Grid */}
            {questions.length === 0 ? (
                <p className="text-slate-500 py-10 text-center">
                    কোন প্রশ্ন পাওয়া যায়নি।
                    <br />
                    {/* <PressableButton href={`/my-papers/${paperId}/add-questions?class=${resetParams.classId}&subject=${resetParams.subjectId}&chapter=${resetParams.chapterId}`}>ফিল্টার রিসেট করো</PressableButton> */}
                </p>
            ) : (
                <div
                    className={`grid gap-3 px-1 grid-cols-1 ${columns === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
                        }`}
                >
                    {questions.map((q, index) => {
                        return (
                            <QuestionCard
                                key={q._id}
                                question={q}
                                questionNo={(currentPage - 1) * 20 + index + 1}
                                showMcqAnswer={showMcqAns}
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