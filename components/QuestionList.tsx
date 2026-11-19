"use client";

import BankToolbar from "@/components/bank/bank-toolbar";
import FunLayer from "@/components/fun/fun-layer";
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
import { usePersistentFlag } from "@/hooks/use-persistent-flag";
import { useUserProfile } from "@/hooks/useUserProfile";
import { hasActiveSubscription } from "@/lib/helpers";
import { IFilterdQuestion } from "@/types/question";
import { Menu } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MobileFilterTrigger } from "./FilterDrawerWrapper";
import { PremiumGate } from "./PremiumGate";
import QuestionCard from "./QuestionCard";
import { ThemeToggle } from "./theme-toggle";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

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

    const { toggleMobileMenu } = useSidebar();
    const router = useRouter();
    const { data: user } = useUserProfile();
    const hasSubscription = (user ? hasActiveSubscription(user) : false)
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [srs, setSrs] = usePersistentFlag("bank:studyMode", false);

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
        <div className="pb-20" ref={listContainerRef}>
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
            {/* <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-line bg-card px-3 py-2.5">
                <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">স্টাডি মোড</span>
                    <span className="block text-xs text-muted-foreground">
                        {srs
                            ? "উত্তর দেখে মূল্যায়ন করলে প্রশ্নটি রিভিউতে যুক্ত হবে"
                            : "চালু করলে প্রশ্ন মূল্যায়ন করে রিভিউতে যুক্ত করতে পারবে"}
                    </span>
                </span>
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={srs}
                    onChange={(e) => setSrs(e.target.checked)}
                />
                <span className="relative h-5 w-9 shrink-0 rounded-full bg-muted transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40" />
            </label> */}
            <BankToolbar srs={srs} onSrsChange={setSrs} />

            {/* Questions Grid */}
            {questions.length === 0 ? (
                <p className="text-slate-500 py-10 text-center">
                    কোন প্রশ্ন পাওয়া যায়নি।
                    <br />
                </p>
            ) : (
                <div
                    className={`grid gap-3 px-1 grid-cols-1"`}
                >
                    {questions.map((q, index) => {
                        return (
                            <QuestionCard
                                key={q._id}
                                question={q}
                                questionNo={(currentPage - 1) * 20 + index + 1}
                                showMcqAnswer={showMcqAns}
                                srsEnabled={srs}
                            />
                        );
                    })}
                </div>
            )}
            {/* <RetrySection /> */}
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
            {/* <RetryPill /> */}
            <FunLayer />
        </div>
    );
}