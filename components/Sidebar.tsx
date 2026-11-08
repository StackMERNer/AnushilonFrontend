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
import Image from 'next/image';
import { Badge } from './ui/badge';
import { getClassNameBn } from '@/lib/constants';

export function Sidebar({ layout }: { layout: 'admin' | 'student' }) {
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
        image?: string;
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
            label: "প্রশ্নসমূহ",
            href: '/analytics/question-analytics',
            icon: File
        }
    ]

    const studentNavItems: MenuItem[] = [
        { label: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard, image: '/images/dashboard.svg' },
        { label: 'মক পরীক্ষা', href: '/mock-exam', icon: FilePlus, image: '/images/mock-exam.svg' },
        {
            label: 'রিভিউ',
            href: '/review',
            icon: BookOpen,
            image: '/images/review.svg'
        },
        {
            label: 'আমার প্রগ্রেস',
            href: '/progress',
            icon: FileText,
            image: '/images/progress.svg'
        },
        {
            label: 'প্রশ্নব্যাংক',
            href: '/question-bank',
            icon: File,
            image: '/images/bank.svg'
        },
        {
            label: "পেমেন্ট হিস্টোরি", href: '/payment-history', icon: Clock,
            image: '/images/payments.svg'
        },
        {
            label: "সহায়তা", href: '/help', icon: HelpCircle,
            image: '/images/help.svg'
        }
    ];

    const targetMainNavItems = layout === 'student' ? studentNavItems : adminNavItems;


    const { data: user } = useUserProfile();


    const subscribedSubjects = (user?.subjectWiseSubscription
        ?? []).filter((sub) => hasActiveSubjectSubscription(sub));
    const subscribedSubectCount = subscribedSubjects.length;

    const hasGlobalSubscription = user && hasActiveSubscription(user);
    const hasAnySubscription = hasGlobalSubscription || subscribedSubectCount > 0;
    const userClass = user?.class.name;
    const userStream = user?.stream;

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
                    'print:hidden fixed top-0 left-0 z-50 h-screen w-72 border-r-2  border-sidebar-border p-6 text-sidebar-foreground transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:z-auto lg:h-screen lg:flex lg:flex-col lg:sticky lg:top-0 lg:overflow-y-auto lg:overflow-x-hidden shrink-0 lg:w-auto dark:bg-black bg-white',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    collapsed && 'lg:px-3'
                )}
            >
                {/* Brand Header */}
                <div className={clsx('flex items-center gap-3 mb-8 px-1 shrink-0', collapsed ? 'lg:flex-col lg:gap-2' : 'justify-between')}>
                    <div
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                    >
                        <Logo />

                        <div className={clsx(
                            'flex flex-col min-w-0 gap-1 pl-1',
                            collapsed && 'lg:hidden'
                        )}>
                            <span className="text-xl font-bold tracking-tight text-foreground leading-tight">
                                {getClassNameBn(userClass!)}
                            </span>

                            {userStream && (
                                <span className="w-fit rounded-md bg-primary/10 dark:bg-primary px-2 py-0.5 text-xs font-semibold text-primary dark:text-neutral-400">
                                    {userStream}
                                </span>
                            )}
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
                <nav className="space-y-1">
                    {targetMainNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        const imgSrc = item.image;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                title={collapsed ? item.label : undefined}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900',
                                    collapsed && 'lg:justify-center',
                                    active ? 'dark:bg-neutral-900 dark:text-white bg-neutral-100' : 'text-foreground hover:bg-teal-tint'
                                )}
                            >
                                {imgSrc ? <Image alt={item.label} src={imgSrc} width={28} height={28} className={`shrink-0 ${active ? 'text-white' : 'text-muted-foreground'}`} /> : <Icon
                                    className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-muted-foreground'}`}
                                />}
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
                {/* Subscription Card */}
                {layout === 'student' && (
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
                                            তোমার সাবস্ক্রিপশন চালু আছে
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
                                        'flex items-center gap-1.5 mb-3',
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
                                        অনুশীলন প্রিমিয়াম
                                    </h4>
                                </div>
                                <div className={clsx(collapsed && 'lg:hidden')}>
                                    <Link
                                        href="/plans"
                                        onClick={closeMobileMenu}
                                        className="bg-white text-primary px-3.5 py-2 rounded-lg font-semibold text-[12.5px] cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        আপগ্রেড করো →
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