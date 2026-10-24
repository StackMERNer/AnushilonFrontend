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
import { createPaperService } from "@/services/paper.service";
import { IFilterdPaper } from "@/types/question-paper";
import { LayoutGrid, Menu, Rows } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MobileFilterTrigger } from "./FilterDrawerWrapper";
import PaperCard from "./PaperCard";
import { hasActiveSubjectSubscription, hasActiveSubscription, toBnDigits } from "@/lib/helpers";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function QuestionPaperList({
    papers,
    totalPages,
    currentPage,
    total
}: {
    papers: IFilterdPaper[];
    total: number;
    totalPages: number;
    currentPage: number;
}) {
    const [columns, setColumns] = useState<1 | 2>(() => {
        if (typeof window !== "undefined") {
            const savedLayout = localStorage.getItem("question_paper_layout");
            return savedLayout === "1" ? 1 : 2;
        }
        return 2;
    });

    const { toggleMobileMenu } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const paperService = createPaperService(apiClient);

    const handleDelete = async (paperId: string) => {
        const confirmed = window.confirm(
            "আপনি কি নিশ্চিত যে এই প্রশ্নপত্রটি মুছে ফেলতে চান?"
        );

        if (!confirmed) return;

        try {
            await paperService.deletePaper(paperId);
            toast.success('প্রশ্নপত্রটি সফলভাবে মুছে ফেলা হয়েছে');
            router.refresh();
        } catch (error) {
            // console.error("Failed to delete paper:", error);
            const errorResponse = error as AxiosError<{ message: string }>;
            const msg = errorResponse.response?.data?.message ?? errorResponse.message ?? "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।";
            toast.error(msg);
        }
    };

    const { data: user } = useUserProfile();
    const hasEverPurchasedSubjectSubscription =
        (user?.subjectWiseSubscription?.length ?? 0) > 0;
    const allowDelete = user ? (hasActiveSubscription(user) || hasEverPurchasedSubjectSubscription) : false;

    const updateColumns = (cols: 1 | 2) => {
        setColumns(cols);
        localStorage.setItem("question_paper_layout", String(cols));
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


    return (
        <div className="pb-4">
            {/* Top Header */}
            <div className="flex justify-between items-center border-b sticky top-0 z-10 mb-3 py-3 px-2 bg-white">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-xl bg-card border border-border lg:hidden text-foreground"
                    aria-label="Toggle Navigation"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {(total > 0) && <Badge variant="secondary">{toBnDigits(total)} টি প্রশ্নপত্র</Badge>}
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
            {papers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200 rounded-lg my-8 max-w-md mx-auto">
                    <div className="w-12 h-12 mb-4 text-gray-400">
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        কোনো প্রশ্নপত্র পাওয়া যায়নি
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-sm">
                        নতুন প্রশ্নপত্র তৈরি করতে নিচে ক্লিক করুন।
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/create-paper"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm  focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            + নতুন প্রশ্নপত্র তৈরি করুন
                        </Link>
                    </div>
                </div>
            ) : (
                <div
                    className={`grid gap-3 px-1 grid-cols-1 ${columns === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
                        }`}
                >
                    {papers.map((paper) => {
                        return (
                            <PaperCard
                                paper={paper}
                                key={paper._id}
                                onDelete={handleDelete}
                                allowDelete={allowDelete}
                            />
                        );
                    })}
                </div>
            )}

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