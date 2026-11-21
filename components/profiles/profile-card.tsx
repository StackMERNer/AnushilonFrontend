"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProfileActions } from "@/hooks/use-profiles";
import { setProfileIdClient } from "@/lib/profile-cookie";
import { trackLabel } from "@/lib/track-label";
import { IProfile, ITrack } from "@/types/profile";
import TrackForm from "./track-form";
import { useProfileSwitching } from "@/hooks/use-profile-switching";

export default function ProfileCard({ profile, isActive }: { profile: IProfile; isActive: boolean }) {
    const a = useProfileActions();
    const [renaming, setRenaming] = useState(false);
    const [name, setName] = useState(profile.name);
    const [form, setForm] = useState<null | { track?: ITrack }>(null);

    const { switchProfile, switchTrack } = useProfileSwitching();
    const switchTo = () => switchProfile(profile._id);

    const saveName = () =>
        a.rename.mutate(
            { id: profile._id, name },
            { onSuccess: () => { setRenaming(false); toast.success("নাম বদলানো হয়েছে"); } },
        );

    const submitTrack = (input: Parameters<typeof a.addTrack.mutate>[0]["input"]) => {
        const done = {
            onSuccess: (p: IProfile) => {
                setForm(null);
                toast.success("ট্র্যাক সংরক্ষণ হয়েছে");
                if (isActive && !form?.track) switchTrack(profile._id, p.tracks[p.tracks.length - 1]._id);
            },
        };
        if (form?.track) a.updateTrack.mutate({ id: profile._id, trackId: form.track._id, input }, done);
        else a.addTrack.mutate({ id: profile._id, input }, done);
    };

    // const switchTo = () => {
    //     setProfileIdClient(profile._id);
    //     window.location.assign("/dashboard");
    // };

    const subtitle = (t: ITrack) =>
        t.subjects?.length ? t.subjects.slice(0, 4).map((s) => s.name).join(", ") + (t.subjects.length > 4 ? "…" : "") : "";

    return (
        <section className="rounded-2xl border border-line bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                {renaming ? (
                    <div className="flex items-center gap-2">
                        <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm outline-none focus:border-brand" />
                        <button onClick={saveName} disabled={!name.trim() || a.rename.isPending} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40">সেভ</button>
                        <button onClick={() => { setRenaming(false); setName(profile.name); }} className="text-sm text-muted-foreground">বাতিল</button>
                    </div>
                ) : (
                    <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        {profile.name}
                        <button onClick={() => setRenaming(true)} aria-label="নাম বদলাও" className="text-muted-foreground hover:text-foreground">
                            <Pencil className="size-4" />
                        </button>
                        {profile.isDefault && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">ডিফল্ট</span>}
                    </h3>
                )}

                {isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <Check className="size-3.5" /> সক্রিয়
                    </span>
                ) : (
                    <button onClick={switchTo} className="rounded-xl bg-brand px-3.5 py-1.5 text-sm font-semibold text-white hover:opacity-90">
                        এই প্রোফাইলে যাও
                    </button>
                )}
            </div>

            <ul className="mt-3 space-y-2">
                {profile.tracks.length === 0 && <li className="text-sm text-muted-foreground">এখনও কোনো ট্র্যাক নেই</li>}
                {profile.tracks.map((t) => (
                    <li key={t._id} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{trackLabel(t)}</p>
                            {subtitle(t) && <p className="truncate text-xs text-muted-foreground">{subtitle(t)}</p>}
                        </div>
                        <div className="flex shrink-0 gap-1">
                            <button onClick={() => setForm({ track: t })} aria-label="ট্র্যাক সম্পাদনা" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                                <Pencil className="size-4" />
                            </button>
                            <button
                                disabled={profile.tracks.length <= 1}
                                onClick={() =>
                                    confirm("এই ট্র্যাকটি সরিয়ে ফেলবে? তোমার অগ্রগতি মুছবে না।") &&
                                    a.removeTrack.mutate({ id: profile._id, trackId: t._id }, { onSuccess: () => toast.success("ট্র্যাক সরানো হয়েছে") })
                                }
                                aria-label="ট্র্যাক সরাও"
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-tint hover:text-red disabled:opacity-30"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {form ? (
                <div className="mt-3">
                    <TrackForm
                        key={form.track?._id ?? "new"}
                        initial={form.track}
                        busy={a.addTrack.isPending || a.updateTrack.isPending}
                        onSubmit={submitTrack}
                        onCancel={() => setForm(null)}
                    />
                </div>
            ) : (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setForm({})}
                        disabled={profile.tracks.length >= 10}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-brand/50 px-3.5 py-2 text-sm font-semibold text-brand hover:bg-brand-soft disabled:opacity-40"
                    >
                        <Plus className="size-4" /> ট্র্যাক যোগ করো
                    </button>
                    {!profile.isDefault && (
                        <button
                            onClick={() =>
                                confirm("প্রোফাইলটি সরিয়ে ফেলবে? এর অগ্রগতি সংরক্ষিত থাকবে।") &&
                                a.archive.mutate(profile._id, { onSuccess: () => toast.success("প্রোফাইল সরানো হয়েছে") })
                            }
                            className="ml-auto text-sm text-muted-foreground hover:text-red"
                        >
                            প্রোফাইল সরাও
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}