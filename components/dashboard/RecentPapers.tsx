"use client";
import PlansContent from '@/app/(teacher)/plans/_components/PlansContent';
import { useDashboard } from '@/hooks/use-dashboard';
import { useUserProfile } from '@/hooks/useUserProfile';
import { hasActiveSubjectSubscription, hasActiveSubscription } from '@/lib/helpers';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function DashboardData() {
    const { data: dashboardData } = useDashboard();
    const totalPapers = dashboardData?.totalPapers || 0;
    const thisMonthPapers = dashboardData?.thisMonthPapers || 0;
    const { data: user, isLoading: userLoading } = useUserProfile();
    const subscribedSubjects = (user?.subjectWiseSubscription
        ?? []).filter((sub) => hasActiveSubjectSubscription(sub));
    const subscribedSubectCount = subscribedSubjects.length;
    const hasGlobalSubscription = user ? hasActiveSubscription(user) : false;
    const hasAnySubscription = hasGlobalSubscription || subscribedSubectCount > 0;

    return (
        <>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {/* Stats */}
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-border bg-background/60 p-4">
                            <p className="text-[13px] text-muted-foreground mb-1">
                                মোট প্রশ্নপত্র
                            </p>

                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-semibold tracking-tight">
                                    {totalPapers.toLocaleString('bn-BD')}
                                </span>
                                <span className="text-[12px] text-muted-foreground pb-1">
                                    টি
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-background/60 p-4">
                            <p className="text-[13px] text-muted-foreground mb-1">
                                এই মাসে
                            </p>

                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-semibold tracking-tight">
                                    {thisMonthPapers.toLocaleString('bn-BD')}
                                </span>
                                <span className="text-[12px] text-muted-foreground pb-1">
                                    টি প্রশ্নপত্র
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Papers */}
                <div className="border-t border-border">
                    <div className="flex items-center justify-between px-5 py-4">
                        <div>
                            <h3 className="font-tiro text-lg font-normal">
                                সাম্প্রতিক প্রশ্নপত্র
                            </h3>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                সর্বশেষ তৈরি করা প্রশ্নপত্রগুলো
                            </p>
                        </div>

                        <Link
                            href="/my-papers"
                            className="text-[12.5px] text-green-soft font-semibold hover:underline underline-offset-4 transition"
                        >
                            সব দেখুন
                        </Link>
                    </div>

                    <div className="px-5 pb-2">
                        {dashboardData?.recentPapers?.length ? (
                            <div className="divide-y divide-dashed divide-[#E3D9BF]">
                                {dashboardData.recentPapers.map((paper, idx) => (
                                    <div
                                        key={paper._id}
                                        className="group flex items-center gap-3.5 py-3.5"
                                    >
                                        {/* Number */}
                                        <div className="w-9.5 h-9.5 rounded-lg flex items-center justify-center font-tiro text-[14px] text-neutral-700 shrink-0 bg-neutral-100 group-hover:bg-green-soft/10 transition-colors">
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>

                                        {/* Paper info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[14px] font-semibold text-foreground truncate">
                                                {paper.title}
                                            </div>

                                            <div className="flex items-center gap-2 mt-1 text-[11.5px] text-muted-foreground">
                                                <span>
                                                    {paper.totalMarks} নম্বর
                                                </span>

                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />

                                                <span>
                                                    {paper.duration} মিনিট
                                                </span>
                                            </div>
                                        </div>

                                        {/* View */}
                                        <Link
                                            href={`/my-papers/${paper._id}`}
                                            className="shrink-0 text-[12px] font-semibold text-green-soft opacity-80 group-hover:opacity-100 transition-opacity"
                                        >
                                            দেখুন →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-sm text-muted-foreground">
                                    এখনো কোনো প্রশ্নপত্র তৈরি করা হয়নি।
                                </p>

                                <Link
                                    href="/create-paper"
                                    className="inline-block mt-3 text-[12.5px] font-semibold text-green-soft hover:underline"
                                >
                                    প্রথম প্রশ্নপত্র তৈরি করুন →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {(!userLoading && !hasAnySubscription) && <div className="mt-5">
                <h1 className="text-center py-2 text-xl font-bold mb-2">
                    এক সাবস্ক্রিপশনেই সকল শ্রেণি আনলক করুন!
                </h1>
                <PlansContent />
            </div>}
        </>
    );
}