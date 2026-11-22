"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useProfileActions, useProfiles } from "@/hooks/use-profiles";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toBnDigits } from "@/lib/helpers";
import ProfileCard from "./profile-card";
import TrackForm from "./track-form";

export default function ProfilesManager() {
    const { data, isLoading, isError } = useProfiles();
    const { data: user } = useUserProfile();
    const actions = useProfileActions();
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");

    if (isLoading) return <div className="animate-pulse p-8 text-muted-foreground">লোড হচ্ছে…</div>;
    if (isError || !data) return <div className="p-8 text-red">তথ্য লোড করা যায়নি</div>;

    const used = data.items.length;
    const full = used >= data.maxProfiles;

    return (
        <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    প্রোফাইল {toBnDigits(used)}/{toBnDigits(data.maxProfiles)}
                </p>
                {!creating && (
                    <button
                        disabled={full}
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    >
                        <Plus className="size-4" /> নতুন প্রোফাইল
                    </button>
                )}
            </div>
            {/* {full && !creating && (
                <p className="text-xs text-muted-foreground">আরও প্রোফাইল দরকার হলে আমাদের সাথে যোগাযোগ করো।</p>
            )} */}

            {creating && (
                <section className="space-y-3 rounded-2xl border border-line bg-card p-4 sm:p-5">
                    <h3 className="font-bold">নতুন প্রোফাইল</h3>
                    <input
                        value={name}
                        maxLength={40}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="শিক্ষার্থীর নাম"
                        className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                    <TrackForm
                        submitLabel="প্রোফাইল তৈরি করো"
                        extraValid={name.trim().length > 0}
                        busy={actions.create.isPending}
                        onCancel={() => { setCreating(false); setName(""); }}
                        onSubmit={(track) =>
                            actions.create.mutate(
                                { name: name.trim(), track },
                                { onSuccess: () => { toast.success("প্রোফাইল তৈরি হয়েছে"); setCreating(false); setName(""); } },
                            )
                        }
                    />
                </section>
            )}

            {data.items.map((p) => (
                <ProfileCard key={p._id} profile={p} isActive={p._id === user?.profile?._id} />
            ))}
        </div>
    );
}