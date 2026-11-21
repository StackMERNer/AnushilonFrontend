"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, ChevronDown, Settings2, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileSwitching } from "@/hooks/use-profile-switching";
import { useProfiles } from "@/hooks/use-profiles";
import { useUserProfile } from "@/hooks/useUserProfile";
import { trackLabel } from "@/lib/track-label";

export default function ProfileTrackMenu() {
    const { data: user } = useUserProfile();
    const { data: pdata } = useProfiles();
    const { switchProfile, switchTrack } = useProfileSwitching();
    const [showProfiles, setShowProfiles] = useState(false);

    const profiles = pdata?.items ?? [];
    const profile = user?.profile;
    const tracks = profile?.tracks ?? [];
    const activeTrack = tracks.find((t) => t._id === user?.activeTrackId) ?? tracks[0];

    if (!profile || (profiles.length < 2 && tracks.length < 2)) return null;

    return (
        <DropdownMenu onOpenChange={(open) => !open && setShowProfiles(false)}>
            <DropdownMenuTrigger
                className="flex max-w-[9rem] items-center gap-1.5 rounded-xl border border-line bg-card px-2.5 py-1.5 text-sm font-semibold outline-none transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary sm:max-w-[16rem]"
                aria-label="প্রোফাইল ও ট্র্যাক"
            >
                <span className="truncate">{activeTrack ? trackLabel(activeTrack) : profile.name}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-64">
                {/* active profile: click to expand the list of profiles */}
                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault(); // keep the menu open
                        if (profiles.length > 1) setShowProfiles((v) => !v);
                    }}
                    className="justify-between gap-2"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <Users className="size-4 shrink-0" />
                        <span className="truncate font-semibold">{profile.name}</span>
                    </span>
                    {profiles.length > 1 && (
                        <ChevronDown className={clsx("size-4 shrink-0 transition-transform", showProfiles && "rotate-180")} />
                    )}
                </DropdownMenuItem>

                {showProfiles &&
                    profiles
                        .filter((p) => p._id !== profile._id)
                        .map((p) => (
                            <DropdownMenuItem key={p._id} onClick={() => {
                                console.log('switching profile');
                                switchProfile(p._id);
                            }} className="ml-6 flex-col items-start gap-0">
                                <span className="w-full truncate">{p.name}</span>
                                <span className="w-full truncate text-xs text-muted-foreground">
                                    {p.tracks[0] ? trackLabel(p.tracks[0]) : "ক্লাস বাছাই বাকি"}
                                    {p.tracks.length > 1 && ` +${p.tracks.length - 1}`}
                                </span>
                            </DropdownMenuItem>
                        ))}

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">ট্র্যাক</DropdownMenuLabel>

                {tracks.map((t) => (
                    <DropdownMenuItem key={t._id} onClick={() => {
                        console.log('clicked');
                        switchTrack(profile._id, t._id)
                    }} className="justify-between gap-2">
                        <span className="truncate">{trackLabel(t)}</span>
                        {t._id === activeTrack?._id && <Check className="size-4 shrink-0" />}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href="/profiles" className="flex w-full items-center">
                        <Settings2 className="mr-2 h-4 w-4" />
                        প্রোফাইল ও ট্র্যাক পরিচালনা
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}