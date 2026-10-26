"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Building2, CreditCard, Menu, User } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function Topbar() {
    const pathname = usePathname();
    const { data: userProfile } = useUserProfile();
    const { toggleMobileMenu } = useSidebar();

    const isDashboard = pathname === "/dashboard" || pathname === "/";

    const hideTopbarPages = [
        "/add-questions",
        "/my-papers",
        "/content-library",
        "/question-bank",
    ];


    const hideTopbar = hideTopbarPages.some((page) => pathname.startsWith(page));

    if (hideTopbar) {
        return null;
    }

    const isAdmin = userProfile?.role === "admin";

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

            {/* Spacer */}
            <div className="flex-1">
                {isDashboard && null}
            </div>

            {/* Profile */}
            {userProfile && (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Open profile menu"
                    >
                        <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
                            <Image
                                src={userProfile.photoURL!}
                                alt="Profile"
                                fill
                                sizes="36px"
                                className="object-cover"
                            />
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-56"
                    >
                        {!isAdmin && <div className="px-2 py-2">
                            <p className="truncate text-sm font-medium">
                                {userProfile.name}
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                                {userProfile.email}
                            </p>
                        </div>}
                        {isAdmin && <DropdownMenuItem>
                            <Link href="/admin-dashboard" className="flex w-full items-center">
                                <User className="mr-2 h-4 w-4" />
                                অ্যাডমিন ড্যাশবোর্ড
                            </Link>
                        </DropdownMenuItem>}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                            <Link href="/profile" className="flex w-full items-center">
                                <User className="mr-2 h-4 w-4" />
                                প্রোফাইল
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                            <Link href="/my-institute" className="flex w-full items-center">
                                <Building2 className="mr-2 h-4 w-4" />
                                আমার প্রতিষ্ঠান
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
            )}
        </div>
    );
}