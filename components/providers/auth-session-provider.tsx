"use client";
import { useEffect } from "react";
import { initSessionSync } from "@/app/api/auth/session-sync";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initSessionSync();
    }, []);
    return <>{children}</>;
}