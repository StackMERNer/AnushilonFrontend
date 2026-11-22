"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/context/SidebarContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Check, CreditCard, Menu, Plus, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StreakBadge } from "./streak-badge";
import { ThemeToggle } from "./theme-toggle";
import { useProfiles } from "@/hooks/use-profiles";
import { useEffect } from "react";
import { getProfileIdClient, setProfileIdClient } from "@/lib/profile-cookie";
import { trackLabel } from "@/lib/track-label";
import ProfileTrackMenu from "./profile-track-menu";

function greeting() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "শুভ সকাল";
    if (h >= 12 && h < 16) return "শুভ দুপুর";
    if (h >= 16 && h < 18) return "শুভ বিকেল";

    return "শুভ সন্ধ্যা";
}

// Route title mapping
const ROUTE_TITLES: Record<string, string> = {
    "/bookmarks": "বুকমার্কস",
    "/review": "রিভিউ",
    "/browse": "অধ্যায় সমূহ",
    "/question-bank": "প্রশ্নব্যাংক",
    "/payment-history": "পেমেন্ট হিস্টোরি",
    "/profile": "প্রোফাইল",
    "/plans": "প্রিমিয়াম প্ল্যান",
    "/admin-dashboard": "অ্যাডমিন ড্যাশবোর্ড",
    "/payments": "পেমেন্টস",
    "/analytics/sales": "সেলস অ্যানালিটিক্স",
    "/subjects": "বিষয়সমূহ",
    "/profiles": "প্রোফাইল ও ট্র্যাক"
};

const HIDE_TOPBAR_PAGES = [
    "/add-questions",
    "/my-papers",
    "/content-library",
    "/question-bank/questions",
];

export function Topbar() {
    const pathname = usePathname();
    const { data: user } = useUserProfile();
    const { data: pdata } = useProfiles();
    const activeId = user?.profile?._id;
    const { toggleMobileMenu } = useSidebar();

    const isDashboard = pathname === "/dashboard" || pathname === "/";
    const hideTopbar = HIDE_TOPBAR_PAGES.some((page) =>
        pathname.startsWith(page)
    );

    useEffect(() => {
        if (activeId && getProfileIdClient() !== activeId) setProfileIdClient(activeId);
    }, [activeId]);

    const switchTo = (id: string) => {
        if (id === activeId) return;
        setProfileIdClient(id);
        window.location.assign("/dashboard"); // full reload resets every cache and local store
    };

    const displayName = user?.profile?.name ?? user?.name;
    const firstName = displayName?.trim().split(" ")[0]; // greeting uses the profile's name

    if (hideTopbar) return null;

    const isAdmin = user?.role === "admin";

    // Match exact routes or their nested routes
    const routeTitle = Object.entries(ROUTE_TITLES)
        .sort(([a], [b]) => b.length - a.length)
        .find(([route]) =>
            pathname === route || pathname.startsWith(`${route}/`)
        )?.[1];

    return (
        <div className="flex items-center justify-between gap-4 p-4 sm:px-8">
            {/* Mobile Menu */}
            <button
                onClick={toggleMobileMenu}
                className="rounded-xl border border-border bg-card p-2 text-foreground lg:hidden"
                aria-label="Toggle Navigation"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Page Title */}
            <div className="min-w-0 flex-1 hidden sm:block">
                {isDashboard ? (
                    user ? (
                        <h1 className="font-display text-xl font-bold text-foreground sm:text-3xl">
                            {greeting()}
                            {firstName ? `, ${firstName}` : ""}
                        </h1>
                    ) : (
                        <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
                    )
                ) : (
                    <h1 className="truncate font-display text-xl font-bold text-neutral-800 dark:text-neutral-100 sm:text-2xl">
                        {routeTitle ?? "অনুশীলন"}
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-4">
                <StreakBadge />
                <ProfileTrackMenu />
                {/* Theme Toggle */}
                <ThemeToggle />
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Open profile menu"
                        >
                            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
                                {user.photoURL && (
                                    <Image
                                        src={user.photoURL}
                                        alt="Profile"
                                        fill
                                        sizes="36px"
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                            {(pdata?.items.length ?? 0) > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    {/* <DropdownMenuLabel className="text-xs text-muted-foreground">প্রোফাইল</DropdownMenuLabel> */}
                                    {pdata!.items.map((p) => (
                                        <DropdownMenuItem key={p._id} onClick={() => switchTo(p._id)} className="justify-between gap-2">
                                            <span className="min-w-0">
                                                <span className="block truncate">{p.name}</span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {p.tracks[0] ? trackLabel(p.tracks[0]) : "ক্লাস বাছাই বাকি"}
                                                    {p.tracks.length > 1 && ` +${p.tracks.length - 1}`}
                                                </span>
                                            </span>
                                            {p._id === activeId && <Check className="size-4 shrink-0" />}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuItem>
                                        <Link href="/profiles" className="flex w-full items-center">
                                            <Plus className="mr-2 h-4 w-4" />
                                            প্রোফাইল ও ট্র্যাক
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}

                            {isAdmin && (
                                <DropdownMenuItem>
                                    <Link href="/admin-dashboard" className="flex w-full items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        অ্যাডমিন ড্যাশবোর্ড
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                                <Link href="/account" className="flex w-full items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    অ্যাকাউন্ট
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <Link href="/payment-history" className="flex w-full items-center">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    পেমেন্ট হিস্টোরি
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}</div>
        </div>
    );
}
