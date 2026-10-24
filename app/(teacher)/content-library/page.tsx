import ContentFilterSidebar from '@/components/ContentFilterSidebar';
import FilterDrawerWrapper, { FilterDrawerContent } from '@/components/FilterDrawerWrapper';
import ManageContentFiles from '@/components/ManageContentFiles';
import { createServerApiClient } from '@/lib/api/api-server';
import { createContentNodeService } from '@/services/content-node.service';
import { createContentService, IFilteredContent } from '@/services/content.service';
import { PaginatedResponse } from '@/types/pagination';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function NodeManagerPage({
    searchParams,
}: {
    searchParams: Promise<{ selectedNodeId?: string; classId?: string, page?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const { selectedNodeId } = resolvedSearchParams;
    const page = Number(resolvedSearchParams.page ?? 1);

    const contentService = createContentService(createServerApiClient());
    const contentNodeService = createContentNodeService(createServerApiClient());

    const rootNodes = selectedNodeId ? [] : await contentNodeService.getRootContentNodes();
    const filesResponse: PaginatedResponse<IFilteredContent> = selectedNodeId ? await contentService.getFilesByNodeId(selectedNodeId, page) : { items: [], totalItems: 0, currentPage: 1, totalPages: 1, nextPage: null, limit: 10 };
    const selectedNode = selectedNodeId ? await contentNodeService.getContentNodeById(selectedNodeId) : null;
    return (
        <FilterDrawerWrapper>
            <div className="flex flex-col lg:flex-row min-h-screen">
                <main className="flex-1 min-w-0 px-3">
                    <Suspense key={`${selectedNodeId}+${page}`} fallback={<LoadingSkeleton />}>
                        {selectedNodeId ? (
                            <ManageContentFiles selectedNode={selectedNode} initialFiles={filesResponse.items} contentNodeId={selectedNodeId} currentPage={filesResponse.currentPage} total={filesResponse.totalItems} totalPages={filesResponse.totalPages} />
                        ) : (
                            <div className="max-w-4xl mx-auto py-6 space-y-6">
                                <div className="space-y-1 text-center sm:text-left">
                                    <h1 className="font-bold tracking-tight text-foreground flex items-center justify-center sm:justify-start gap-2">
                                        <span>শ্রেণি নির্বাচন করুন</span>
                                    </h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        কন্টেন্ট বা ফাইলসমূহ দেখতে নিচের যেকোনো একটি শ্রেণি নির্বাচন করুন।
                                    </p>
                                </div>

                                {rootNodes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-card/50 text-center space-y-2">
                                        <BookOpen className="w-8 h-8 text-muted-foreground/60" />
                                        <p className="text-sm font-medium text-muted-foreground">
                                            কোনো শ্রেণি পাওয়া যায়নি
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                        {rootNodes.map((node) => (
                                            <Link
                                                key={node._id}
                                                href={`?classId=${node._id}&selectedNodeId=${node._id}`}
                                                className="group relative flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/60 hover:border-teal/40 transition-all duration-200 shadow-xs hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-tint text-teal shrink-0 group-hover:scale-105 transition-transform">
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <div className="truncate">
                                                        <h2 className="text-sm font-semibold text-foreground truncate group-hover:text-teal transition-colors">
                                                            {node.name}
                                                        </h2>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            সকল বিষয় দেখুন
                                                        </span>
                                                    </div>
                                                </div>

                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Suspense>
                </main>

                <FilterDrawerContent filterTitle='ফিল্টার'>
                    <ContentFilterSidebar />
                </FilterDrawerContent>
            </div>
        </FilterDrawerWrapper>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center min-h-75 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
            <span className="text-xs font-medium">লোড হচ্ছে...</span>
        </div>
    );
}