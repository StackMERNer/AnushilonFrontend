"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function FreshDataGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isRefreshing, startTransition] = useTransition();

    useEffect(() => {
        startTransition(() => {
            router.refresh();
        });
    }, [router]);

    return (
        <div className="relative">
            {/* inert blocks mouse, touch AND keyboard interaction */}
            <div inert={isRefreshing} className={isRefreshing ? "opacity-60" : ""}>
                {children}
            </div>

            {isRefreshing && (
                <div className="absolute inset-x-0 top-24 z-20 flex justify-center pointer-events-none">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )}
        </div>
    );
}