'use client';

import { useSidebar } from '@/context/SidebarContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatBengaliDate, hasActiveSubjectSubscription, hasActiveSubscription } from '@/lib/helpers';
import clsx from 'clsx';
import {
    Banknote,
    BookOpen,
    ChartSpline,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    Crown,
    File,
    FilePlus,
    FileText,
    HelpCircle,
    LayoutDashboard,
    LucideIcon,
    Notebook,
    User,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export function Sidebar({ layout }: { layout: 'admin' | 'teacher' }) {
    const pathname = usePathname();
    const { mobileMenuOpen, closeMobileMenu, collapsed, toggleCollapsed } = useSidebar();

    const isActive = (href: string) => {
        if (href === '/dashboard' && (pathname === '/dashboard' || pathname === '/')) {
            return true;
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    interface MenuItem {
        label: string;
        href: string;
        icon: LucideIcon;
        badge?: string;
    }

    const adminNavItems: MenuItem[] = [
        {
            label: "অ্যাডমিন",
            href: '/admin-dashboard',
            icon: User
        },
        {
            label: "পেমেন্টস",
            href: "/payments",
            icon: Banknote
        },
        {
            label: "সেলস",
            href: "/analytics/sales",
            icon: ChartSpline
        },
        {
            label: "বিষয় সমূহ",
            href: "/subjects",
            icon: Notebook,
        },
        {
            label: "প্রশ্নসেট",
            href: '/create-question-set',
            icon: File
        },
        {
            label: "প্রশ্নসমূহ",
            href: '/analytics/question-analytics',
            icon: File
        }
    ]

    const teacherNavItems: MenuItem[] = [
        { label: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard },
        { label: 'নতুন প্রশ্নপত্র', href: '/create-paper', icon: FilePlus },
        {
            label: 'আমার প্রশ্নপত্র',
            href: '/my-papers',
            icon: FileText,
        },
        // {
        //     label: "কন্টেন্ট লাইব্রেরি",
        //     href: '/content-library',
        //     icon: Crown
        // }
    ];

    const teacherGeneralNavItems: MenuItem[] = [
        {
            label: "বুকলেট তৈরী", href: '/tools/booklet', icon: BookOpen
        },
        {
            label: 'প্রতিষ্ঠানের তথ্য', href: '/my-institute', icon: User,

        },
        {
            label: "পেমেন্ট হিস্টোরি", href: '/payment-history', icon: Clock
        },
        {
            label: "সহায়তা", href: '/help', icon: HelpCircle
        }
    ];
    const adminGeneralNavItems: MenuItem[] = [];

    const targetMainNavItems = layout === 'teacher' ? teacherNavItems : adminNavItems;
    const targetGeneralNavItems: MenuItem[] = layout === 'teacher' ? teacherGeneralNavItems : adminGeneralNavItems;

    const { data: user } = useUserProfile();


    const subscribedSubjects = (user?.subjectWiseSubscription
        ?? []).filter((sub) => hasActiveSubjectSubscription(sub));
    const subscribedSubectCount = subscribedSubjects.length;

    const hasGlobalSubscription = user && hasActiveSubscription(user);
    const hasAnySubscription = hasGlobalSubscription || subscribedSubectCount > 0;

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar Drawer */}
            <aside
                className={clsx(
                    'print:hidden fixed top-0 left-0 z-50 h-screen w-72 bg-card border-r-2 border-dashed border-border p-6 text-foreground transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:z-auto lg:h-screen lg:flex lg:flex-col lg:sticky lg:top-0 lg:overflow-y-auto lg:overflow-x-hidden shrink-0 lg:w-auto',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    collapsed && 'lg:px-3'
                )}
            >
                {/* Brand Header */}
                <div className={clsx('flex items-center gap-3 mb-8 px-1 shrink-0', collapsed ? 'lg:flex-col lg:gap-2' : 'justify-between')}>
                    <div
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3"
                    >
                        <Logo />
                        <div className={clsx(collapsed && 'lg:hidden')}>
                            <div className="font-li-shohid text-[28px] text-primary leading-none">
                                অনুশীলন
                            </div>
                            <div className="text-[11px] text-muted-foreground tracking-wide mt-1">
                                সফলতার নির্ভরযোগ্য সূত্র
                            </div>
                        </div>
                    </div>

                    {/* Collapse toggle — desktop only */}
                    <button
                        onClick={toggleCollapsed}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-teal-tint text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                        {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                    </button>

                    {/* Close drawer — mobile only */}
                    <button
                        onClick={closeMobileMenu}
                        className="p-1 rounded-lg hover:bg-teal-tint text-muted-foreground hover:text-foreground lg:hidden"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Section */}
                <div className={clsx('text-[11px] uppercase tracking-wider text-muted-foreground my-2 mx-2 font-semibold shrink-0', collapsed && 'lg:hidden')}>
                    মেনু
                </div>
                <nav className="space-y-1">
                    {targetMainNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                title={collapsed ? item.label : undefined}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium transition-colors',
                                    collapsed && 'lg:justify-center',
                                    active ? 'bg-primary text-white shadow-sm' : 'text-foreground hover:bg-teal-tint'
                                )}
                            >
                                <Icon
                                    className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-muted-foreground'}`}
                                />
                                <span className={clsx(collapsed && 'lg:hidden')}>{item.label}</span>
                                {item.badge && (
                                    <span
                                        className={clsx(
                                            'ml-auto text-[10.5px] px-2 py-0.5 rounded-full font-semibold',
                                            collapsed && 'lg:hidden',
                                            active ? 'bg-white/20 text-white' : 'bg-destructive text-white'
                                        )}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* General Section */}
                {(targetGeneralNavItems.length > 0) && <div className={clsx('text-[11px] uppercase tracking-wider text-muted-foreground mt-6 mb-2 mx-2 font-semibold shrink-0', collapsed && 'lg:hidden')}>
                    সাধারণ
                </div>}
                <nav className="space-y-1">
                    {targetGeneralNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                title={collapsed ? item.label : undefined}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium transition-colors',
                                    collapsed && 'lg:justify-center',
                                    active ? 'bg-primary text-white shadow-sm' : 'text-foreground hover:bg-teal-tint'
                                )}
                            >
                                <Icon
                                    className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-muted-foreground'}`}
                                />
                                <span className={clsx(collapsed && 'lg:hidden')}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Upgrade Banner */}
                {/* Subscription Card */}
                {layout === 'teacher' && (
                    <div
                        className={clsx(
                            'mt-8 lg:mt-auto rounded-2xl relative overflow-hidden shrink-0',
                            collapsed ? 'lg:p-2' : 'p-4',
                            hasAnySubscription
                                ? 'bg-primary/10 border border-primary/15'
                                : 'bg-primary text-white'
                        )}
                    >
                        {hasAnySubscription ? (
                            <>
                                {/* Decorative circle */}
                                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/5 pointer-events-none" />

                                <div
                                    className={clsx(
                                        'flex items-center gap-2 mb-2',
                                        collapsed && 'lg:justify-center lg:mb-0'
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                                        <Crown className="w-4 h-4 text-gold" />
                                    </div>

                                    <div className={clsx(collapsed && 'lg:hidden')}>
                                        <h4 className="font-tiro text-sm font-normal text-primary">
                                            প্রিমিয়াম অ্যাকটিভ
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground">
                                            আপনার সাবস্ক্রিপশন চালু আছে
                                        </p>
                                    </div>
                                </div>

                                <div className={clsx('mt-3', collapsed && 'lg:hidden')}>
                                    {hasGlobalSubscription ? <div className="flex items-center justify-between text-[11px] mb-1.5">
                                        <span className="text-muted-foreground">
                                            মেয়াদ শেষ হবে
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {formatBengaliDate(user.subscription.expiresAt)}
                                        </span>
                                    </div> : <div className="flex items-center justify-between text-[11px] mb-1.5">
                                        {subscribedSubectCount} টি বিষয়ে সাবস্ক্রিপশন চালু আছে।
                                    </div>}

                                    <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-primary rounded-full" />
                                    </div>

                                    <Link
                                        href="/plans"
                                        onClick={closeMobileMenu}
                                        className="mt-3 flex items-center justify-center w-full py-2 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-colors"
                                    >
                                        অন্যান্য প্ল্যান দেখুন →
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute -top-2.5 -right-2.5 w-17.5 h-17.5 border-2 border-dashed border-white/25 rounded-full pointer-events-none" />

                                <div
                                    className={clsx(
                                        'flex items-center gap-1.5 mb-1.5',
                                        collapsed && 'lg:justify-center lg:mb-0'
                                    )}
                                >
                                    <Crown className="w-4 h-4 text-gold shrink-0" />

                                    <h4
                                        className={clsx(
                                            'font-tiro text-base font-normal',
                                            collapsed && 'lg:hidden'
                                        )}
                                    >
                                        সাবস্ক্রিপশন নিন
                                    </h4>
                                </div>

                                <div className={clsx(collapsed && 'lg:hidden')}>
                                    <p className="text-[12.5px] opacity-85 leading-relaxed mb-3.5">
                                        বোর্ড ফরম্যাটে PDF এক্সপোর্ট ও আনলিমিটেড প্রশ্ন ব্যাংক আনলক করুন।
                                    </p>

                                    <Link
                                        href="/plans"
                                        onClick={closeMobileMenu}
                                        className="bg-white text-primary px-3.5 py-2 rounded-lg font-semibold text-[12.5px] cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        সাবস্ক্রিপশন নিন →
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </aside>
        </>
    );
}