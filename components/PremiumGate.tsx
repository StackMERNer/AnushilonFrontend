"use client";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function PremiumGate({
    locked,
    children,
    onUpgradeClick,
}: {
    locked: boolean;
    children: React.ReactNode;
    onUpgradeClick?: () => void;
}) {
    const router = useRouter();
    if (!locked) return <>{children}</>;
    const handleUpgradeClick = () => {
        if (onUpgradeClick) onUpgradeClick();
        router.push("/plans")
    };
    return (
        <div className="relative">
            <div className="pointer-events-none select-none blur-[1.5px]">
                {children}
            </div>
            <button
                type="button"
                onClick={handleUpgradeClick}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-background/60"
            >
                <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                    <Lock className="h-3 w-3" />
                    প্রিমিয়াম
                </span>
                <span className="text-[11px] text-muted-foreground">
                    আনলক করতে সাবস্ক্রাইব করুন
                </span>
            </button>
        </div>
    );
}