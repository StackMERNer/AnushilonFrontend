import FilterDrawerWrapper, { FilterDrawerContent, MobileFilterTrigger } from "@/components/FilterDrawerWrapper";
import AddPdfButton from "@/components/pdf/AddPdfButton";
import PdfFilterSidebar from "@/components/pdf/PdfFilterSidebar";
import { createServerApiClient } from "@/lib/api/api-server";
import { createPdfService } from "@/services/pdf.service";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

export default async function PdfListPage({ searchParams }: {
    searchParams: Promise<{ subjectId?: string; page?: string }>;
}) {
    const sp = await searchParams;
    const page = Math.max(1, Number(sp.page) || 1);
    const res = await createPdfService(createServerApiClient()).listBooks({
        subject: sp.subjectId, page, limit: 12,
    });

    const href = (p: number) => {
        const q = new URLSearchParams();
        if (sp.subjectId) q.set("subjectId", sp.subjectId);
        q.set("page", String(p));
        return `/pdf?${q.toString()}`;
    };

    return (
        <FilterDrawerWrapper>
            <div className="flex min-h-screen flex-col lg:flex-row">
                <main className="min-w-0 flex-1 px-3 py-6">
                    <div className="mx-auto max-w-5xl space-y-5">
                        <div className="flex items-center justify-between gap-2">
                            <h1 className="font-bold tracking-tight">বই / PDF</h1>
                            <div className="flex items-center gap-2">
                                <AddPdfButton />
                                <MobileFilterTrigger />
                            </div>
                        </div>

                        {res.items.length === 0 ? (
                            <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
                                কোনো PDF পাওয়া যায়নি
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                                {res.items.map(b => (
                                    <Link key={b._id} href={`/pdf/${b._id}`}
                                        className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-teal/40 hover:bg-accent/60 hover:shadow-md">
                                        <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-teal-tint text-teal transition-transform group-hover:scale-105">
                                            <FileText className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="line-clamp-2 text-sm font-semibold group-hover:text-teal">{b.title}</h2>
                                            <p className="mt-1 truncate text-xs text-muted-foreground">{b.subject?.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">{b.chapter?.name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {res.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 text-sm">
                                {page > 1 ? (
                                    <Link href={href(page - 1)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 hover:bg-muted">
                                        <ChevronLeft className="size-4" /> আগের
                                    </Link>
                                ) : <span />}
                                <span className="text-muted-foreground">{page} / {res.totalPages}</span>
                                {res.nextPage ? (
                                    <Link href={href(res.nextPage)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 hover:bg-muted">
                                        পরের <ChevronRight className="size-4" />
                                    </Link>
                                ) : <span />}
                            </div>
                        )}
                    </div>
                </main>

                <FilterDrawerContent filterTitle="ফিল্টার">
                    <PdfFilterSidebar />
                </FilterDrawerContent>
            </div>
        </FilterDrawerWrapper>
    );
}