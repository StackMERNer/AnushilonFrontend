"use client";

import { useProfiles } from "@/hooks/use-profiles";
import { getProfileIdClient, setProfileIdClient } from "@/lib/profile-cookie";
import { trackLabel } from "@/lib/track-label";
import clsx from "clsx";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ProfileSwitcher() {
    const { data } = useProfiles();
    const ref = useRef<HTMLDetailsElement>(null);
    const profiles = data?.items ?? [];
    const cookieId = getProfileIdClient();
    const active = profiles.find((p) => p._id === cookieId) ?? profiles.find((p) => p.isDefault);

    // a stale cookie (profile archived elsewhere): reset to default once
    useEffect(() => {
        if (!profiles.length || !cookieId) return;
        if (!profiles.some((p) => p._id === cookieId)) {
            const def = profiles.find((p) => p.isDefault);
            if (def) {
                setProfileIdClient(def._id);
                window.location.reload();
            }
        }
    }, [profiles, cookieId]);

    if (!active || profiles.length < 2) return null; // single-profile users see nothing new

    const choose = (id: string) => {
        if (id === active._id) return void (ref.current && (ref.current.open = false));
        setProfileIdClient(id);
        window.location.assign("/dashboard");
    };

    return (
        <details ref={ref} className="relative mb-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                <span className="truncate">{active.name}</span>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </summary>
            <ul className="absolute inset-x-0 z-20 mt-1 rounded-xl border border-line bg-card p-1 shadow-lg">
                {profiles.map((p) => (
                    <li key={p._id}>
                        <button
                            type="button"
                            onClick={() => choose(p._id)}
                            className={clsx(
                                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent",
                                p._id === active._id && "bg-brand-soft text-brand",
                            )}
                        >
                            <span className="min-w-0">
                                <span className="block truncate font-medium">{p.name}</span>
                                <span className="block truncate text-xs text-muted-foreground">
                                    {p.tracks[0] ? trackLabel(p.tracks[0]) : "ক্লাস বাছাই বাকি"}
                                    {p.tracks.length > 1 && ` +${p.tracks.length - 1}`}
                                </span>
                            </span>
                            {p._id === active._id && <Check className="size-4 shrink-0" />}
                        </button>
                    </li>
                ))}
            </ul>
        </details>
    );
}