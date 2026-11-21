// components/track-switcher.tsx
"use client";
import clsx from "clsx";
import { useActiveTrack } from "@/hooks/use-active-track";
import { trackLabel } from "@/lib/track-label";

export default function TrackSwitcher() {
    const [active, setActive, tracks] = useActiveTrack();
    if (tracks.length < 2) return null; // single-track users see nothing new

    const chip = (on: boolean) =>
        clsx(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
            on ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/40",
        );

    return (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="ট্র্যাক">
            <button role="tab" aria-selected={!active} onClick={() => setActive("")} className={chip(!active)}>
                সব
            </button>
            {tracks.map((t) => (
                <button key={t._id} role="tab" aria-selected={active === t._id} onClick={() => setActive(t._id)} className={chip(active === t._id)}>
                    {trackLabel(t)}
                </button>
            ))}
        </div>
    );
}