// app/admin/layout.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function AdminRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { data: user, isLoading } = useUserProfile();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (user.role !== "admin") {
            router.replace("/dashboard");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                যাচাই করা হচ্ছে...
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return children;
}