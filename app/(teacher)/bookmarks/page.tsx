import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { createQuestionFeedbackService } from "@/services/question-feedback.service";
import { createServerApiClient } from "@/lib/api/api-server";
import { toBnDigits } from "@/lib/helpers";
import BookmarksList from "@/components/bookmarks/bookmarks-list";
import Pagination from "@/components/bookmarks/pagination";

export const metadata = { title: "বুকমার্ক" };

const LIMIT = 20;

export default async function BookmarksPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page } = await searchParams;
    const pageNo = Math.max(1, Math.floor(Number(page)) || 1);

    const data = await createQuestionFeedbackService(createServerApiClient()).listBookmarks({
        page: pageNo,
        limit: LIMIT,
    });

    // e.g. the last page became empty after removing its bookmarks
    if (data.items.length === 0 && data.totalItems > 0) {
        redirect(`/bookmarks?page=${data.totalPages}`);
    }

    return (
        <div className="mx-auto w-full max-w-4xl flex-1 space-y-5 p-4 sm:p-8 lg:px-10 lg:pb-12 lg:pt-5">
            <header>
                {data.totalItems > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        মোট {toBnDigits(data.totalItems)}টি প্রশ্ন সংরক্ষিত আছে
                    </p>
                )}
            </header>

            {data.totalItems === 0 ? (
                <div className="rounded-3xl border border-dashed border-line bg-card p-10 text-center">
                    <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold/20 text-gold">
                        <Bookmark className="size-7" />
                    </span>
                    <p className="mt-4 font-semibold text-foreground">এখনও কোনো প্রশ্ন বুকমার্ক করোনি</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        কঠিন বা গুরুত্বপূর্ণ প্রশ্নে বুকমার্ক আইকনে ট্যাপ করলে এখানে জমা হবে।
                    </p>
                    <Link
                        href="/browse"
                        className="mt-5 inline-flex rounded-2xl bg-gold px-6 py-3 font-bold text-brand-dark shadow-[0_4px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-0.5 active:shadow-none"
                    >
                        প্রশ্ন দেখো
                    </Link>
                </div>
            ) : (
                <>
                    <BookmarksList items={data.items} startNo={(data.currentPage - 1) * LIMIT + 1} />
                    <Pagination basePath="/bookmarks" current={data.currentPage} total={data.totalPages} />
                </>
            )}
        </div>
    );
}