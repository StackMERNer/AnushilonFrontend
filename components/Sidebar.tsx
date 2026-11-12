'use client';

import { PressButton } from '@/components/ui/press-button';
import { useSidebar } from '@/context/SidebarContext';
import { useDueCount } from '@/hooks/use-due-count';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getClassNameBn } from '@/lib/constants';
import {
    formatBengaliDate,
    hasActiveSubjectSubscription,
    hasActiveSubscription,
} from '@/lib/helpers';
import clsx from 'clsx';
import {
    Banknote,
    Bookmark,
    BookOpen,
    ChartSpline,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    Crown,
    File,
    FileText,
    HelpCircle,
    LayoutDashboard,
    LucideIcon,
    Notebook,
    User,
    X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

/* -------------------------------------------------------------------------- */
/*                                    Data                                    */
/* -------------------------------------------------------------------------- */

interface MenuItem {
    label: string;
    href: string;
    icon: LucideIcon;
    image?: string;
    badge?: string;
}

const ADMIN_NAV: MenuItem[] = [
    { label: 'অ্যাডমিন', href: '/admin-dashboard', icon: User },
    { label: 'পেমেন্টস', href: '/payments', icon: Banknote },
    { label: 'সেলস', href: '/analytics/sales', icon: ChartSpline },
    { label: 'বিষয় সমূহ', href: '/subjects', icon: Notebook },
    { label: 'প্রশ্নসমূহ', href: '/analytics/question-analytics', icon: File },
];

const getStudentNav = (dueCount?: number): MenuItem[] => [
    { label: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard, image: '/img/icons/learn.svg' },
    { label: 'অধ্যায় ভিত্তিক অনুশীলন', href: '/browse', icon: FileText, image: '/img/icons/practice.svg' },
    {
        label: 'রিভিউ',
        href: '/review',
        icon: BookOpen,
        image: '/img/icons/loader.svg',
        badge: dueCount ? String(dueCount) : undefined, // hide the badge when 0 / undefined
    },
    { label: 'প্রশ্নব্যাংক', href: '/question-bank', icon: File, image: '/img/icons/quests.svg' },
    { label: 'বুকমার্ক', href: '/bookmarks', icon: Bookmark, image: '/img/icons/heart.svg' },
    { label: 'পেমেন্ট হিস্টোরি', href: '/payment-history', icon: Clock, image: '/img//icons/calculator.svg' },
    // { label: 'সহায়তা', href: '/help', icon: HelpCircle, image: '/images/help.svg' },
];

/* -------------------------------------------------------------------------- */
/*                                 Nav link                                   */
/* -------------------------------------------------------------------------- */

function NavLink({
    item,
    active,
    collapsed,
    onClick,
}: {
    item: MenuItem;
    active: boolean;
    collapsed: boolean;
    onClick: () => void;
}) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onClick}
            title={collapsed ? item.label : undefined}
            aria-current={active ? 'page' : undefined}
            className={clsx(
                'group relative flex items-center gap-3 rounded-lg px-2 py-1.5 text-[14.5px] font-medium transition-all',
                collapsed && 'lg:justify-center lg:px-0',
                active
                    ? 'bg-brand-soft font-semibold text-brand'
                    : 'text-foreground/75 hover:bg-accent/70 hover:text-foreground'
            )}
        >
            <span
                className={clsx(
                    'relative grid size-9 shrink-0 place-items-center rounded-xl transition-transform',
                )}
            >
                {item.image ? (
                    <Image alt="" src={item.image} width={26} height={26} />
                ) : (
                    <Icon className={clsx('size-4.5', active ? 'text-brand' : 'text-muted-foreground')} />
                )}

                {/* collapsed: show a small dot instead of the badge */}
                {collapsed && item.badge && (
                    <span className="absolute -right-0.5 -top-0.5 hidden size-2.5 rounded-full bg-gold ring-2 ring-sidebar lg:block" />
                )}
            </span>

            <span className={clsx('truncate', collapsed && 'lg:hidden')}>{item.label}</span>

            {item.badge && (
                <span
                    className={clsx(
                        'ml-auto min-w-6 rounded-full bg-gold px-2 py-0.5 text-center text-[11px] font-bold text-brand-dark shadow-sm',
                        collapsed && 'lg:hidden'
                    )}
                >
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

/* -------------------------------------------------------------------------- */
/*                             Subscription card                              */
/* -------------------------------------------------------------------------- */

function SubscriptionCard({
    collapsed,
    onNavigate,
    hasAnySubscription,
    hasGlobalSubscription,
    expiresAt,
    subjectCount,
}: {
    collapsed: boolean;
    onNavigate: () => void;
    hasAnySubscription: boolean;
    hasGlobalSubscription: boolean;
    expiresAt?: string | Date;
    subjectCount: number;
}) {
    /* collapsed (desktop): just a crown button */
    const collapsedButton = (
        <Link
            href="/plans"
            onClick={onNavigate}
            title="প্ল্যান দেখো"
            className="mx-auto hidden size-11 place-items-center rounded-xl bg-gradient-to-b from-[#f8d77a] to-[#d9961f] text-brand-dark shadow-md transition hover:brightness-110 lg:grid"
        >
            <Crown className="size-5" />
        </Link>
    );

    return (
        <div className="mt-auto shrink-0 pt-8">
            {collapsed && collapsedButton}

            <div className={clsx(collapsed && 'lg:hidden')}>
                {hasAnySubscription ? (
                    /* ------------------------- active subscription ------------------------- */
                    <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 via-brand-soft/60 to-transparent p-4">
                        <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gold/15" />

                        <div className="relative flex items-center gap-3">
                            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-[#f8d77a] to-[#d9961f] text-brand-dark shadow-md">
                                <Crown className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-tiro text-sm text-foreground">প্রিমিয়াম অ্যাকটিভ</h4>
                                <p className="text-[11px] text-muted-foreground">তোমার সাবস্ক্রিপশন চালু আছে</p>
                            </div>
                        </div>

                        <div className="relative mt-4">
                            <div className="mb-1.5 flex items-center justify-between text-[11px]">
                                {hasGlobalSubscription && expiresAt ? (
                                    <>
                                        <span className="text-muted-foreground">মেয়াদ শেষ হবে</span>
                                        <span className="font-semibold text-foreground">
                                            {formatBengaliDate(expiresAt)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-muted-foreground">
                                        {subjectCount} টি বিষয়ে সাবস্ক্রিপশন চালু আছে।
                                    </span>
                                )}
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                                <div className="h-full w-full rounded-full bg-gradient-to-r from-gold to-[#f8d77a]" />
                            </div>

                            <PressButton variant="secondary" size="sm" className="mt-4 w-full text-[12px]">
                                <Link href="/plans" onClick={onNavigate}>
                                    অন্যান্য প্ল্যান দেখো →
                                </Link>
                            </PressButton>
                        </div>
                    </div>
                ) : (
                    /* ------------------------------- upsell -------------------------------- */
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#392078] to-[#1b0851] p-4 text-white">
                        <div className="pointer-events-none absolute -right-3 -top-3 size-17.5 rounded-full border-2 border-dashed border-white/25" />
                        <div className="pointer-events-none absolute -bottom-10 -left-6 size-24 rounded-full bg-gold/15 blur-xl" />

                        <div className="relative mb-4 flex items-center gap-2">
                            <Image src={'/img/icons/super.svg'} className="size-8" width={32} height={32} alt="অনুশীলন প্রিমিয়াম" />
                            <h4 className="font-tiro text-base">অনুশীলন প্রিমিয়াম</h4>
                        </div>

                        <PressButton variant="premium" size="sm" className="relative w-full text-[12.5px]">
                            <Link href="/plans" onClick={onNavigate}>
                                আপগ্রেড করো →
                            </Link>
                        </PressButton>
                    </div>
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  Sidebar                                   */
/* -------------------------------------------------------------------------- */

export function Sidebar({ layout }: { layout: 'admin' | 'student' }) {
    const pathname = usePathname();
    const { mobileMenuOpen, closeMobileMenu, collapsed, toggleCollapsed } = useSidebar();
    const { data: countData } = useDueCount();
    const { data: user } = useUserProfile();

    const isActive = (href: string) => {
        if (href === '/dashboard' && (pathname === '/dashboard' || pathname === '/')) return true;
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const navItems = layout === 'student' ? getStudentNav(countData?.count) : ADMIN_NAV;

    const subscribedSubjectCount = (user?.subjectWiseSubscription ?? []).filter((sub) =>
        hasActiveSubjectSubscription(sub)
    ).length;
    const hasGlobalSubscription = !!user && hasActiveSubscription(user);
    const hasAnySubscription = hasGlobalSubscription || subscribedSubjectCount > 0;

    const userClass = user?.class?.name;
    const userStream = user?.stream;

    return (
        <>
            {/* Mobile backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity lg:hidden"
                    onClick={closeMobileMenu}
                />
            )}
            <aside
                className={clsx(
                    'print:hidden fixed left-0 top-0 z-50 flex h-dvh w-72 shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground transition-all duration-300 ease-in-out',
                    'lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 lg:w-(--sidebar-w)',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    collapsed ? 'lg:px-3' : 'lg:px-5'
                )}
            >
                {/* ---------------------------- Brand header ---------------------------- */}
                <div
                    className={clsx(
                        'mb-6 flex shrink-0 items-center gap-3 px-1',
                        collapsed ? 'justify-between lg:flex-col lg:gap-3' : 'justify-between'
                    )}
                >
                    <Link href="/" onClick={closeMobileMenu} className="flex min-w-0 items-center gap-3">
                        <Logo />
                        <div className={clsx('flex min-w-0 flex-col gap-1', collapsed && 'lg:hidden')}>
                            <span className="truncate text-xl font-bold leading-tight tracking-tight text-foreground">
                                {userClass ? getClassNameBn(userClass) : 'অনুশীলন'}
                            </span>
                            {userStream && (
                                <span className="w-fit rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
                                    {userStream}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* Collapse toggle (desktop) */}
                    <button
                        onClick={toggleCollapsed}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="hidden shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:flex"
                    >
                        {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
                    </button>

                    {/* Close drawer (mobile) */}
                    <button
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* -------------------------------- Nav -------------------------------- */}
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            item={item}
                            active={isActive(item.href)}
                            collapsed={collapsed}
                            onClick={closeMobileMenu}
                        />
                    ))}
                </nav>

                {/* ---------------------------- Subscription ---------------------------- */}
                {layout === 'student' && (
                    <SubscriptionCard
                        collapsed={collapsed}
                        onNavigate={closeMobileMenu}
                        hasAnySubscription={hasAnySubscription}
                        hasGlobalSubscription={hasGlobalSubscription}
                        expiresAt={hasGlobalSubscription ? user?.subscription?.expiresAt : undefined}
                        subjectCount={subscribedSubjectCount}
                    />
                )}
            </aside>
        </>
    );
}