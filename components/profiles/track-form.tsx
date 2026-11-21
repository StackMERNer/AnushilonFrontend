"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useProfileOptions } from "@/hooks/use-profiles";
import { STREAMS, STREAM_REQUIRED_CLASS_IDS } from "@/lib/stream-classes";
import { VERSION_BN } from "@/lib/track-label";
import { toBnDigits } from "@/lib/helpers";
import type { TrackInput } from "@/services/profile.service";
import { ITrack } from "@/types/profile";

const MAX_SUBJECTS = 40;

const chip = (on: boolean) =>
    clsx(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        on ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/40",
    );

export default function TrackForm({
    initial,
    submitLabel = "সংরক্ষণ করো",
    busy,
    extraValid = true,
    onSubmit,
    onCancel,
}: {
    initial?: ITrack;
    submitLabel?: string;
    busy?: boolean;
    extraValid?: boolean;
    onSubmit: (t: TrackInput) => void;
    onCancel?: () => void;
}) {
    const { data: opts, isLoading } = useProfileOptions();

    const [mode, setMode] = useState<"class" | "subjects">(initial?.subjects?.length ? "subjects" : "class");
    const [name, setName] = useState(initial?.name ?? "");
    const [classId, setClassId] = useState(initial?.class?._id ?? "");
    const [stream, setStream] = useState<string>(initial?.stream ?? "");
    const [version, setVersion] = useState(initial?.version ?? "");
    const [picked, setPicked] = useState<string[]>(initial?.subjects?.map((s) => s._id) ?? []);
    const [q, setQ] = useState("");

    const groups = useMemo(() => {
        const map = new Map<string, { name: string; order: number; items: NonNullable<typeof opts>["subjects"] }>();
        (opts?.subjects ?? [])
            .filter((s) => !q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase()))
            .forEach((s) => {
                const g = map.get(s.classId) ?? { name: s.className, order: s.classOrder, items: [] };
                g.items.push(s);
                map.set(s.classId, g);
            });
        return [...map.values()].sort((a, b) => a.order - b.order);
    }, [opts, q]);

    if (isLoading || !opts) return <p className="animate-pulse text-sm text-muted-foreground">লোড হচ্ছে…</p>;

    const needsStream = STREAM_REQUIRED_CLASS_IDS.includes(classId);
    const valid =
        extraValid &&
        (mode === "class"
            ? !!classId && (!needsStream || !!stream)
            : picked.length > 0 && picked.length <= MAX_SUBJECTS);

    const toggle = (id: string) =>
        setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_SUBJECTS ? p : [...p, id]));

    const submit = () =>
        onSubmit(
            mode === "class"
                ? { name: name.trim() || undefined, class: classId, stream: needsStream ? stream : undefined, version: version || undefined }
                : { name: name.trim() || undefined, subjects: picked },
        );

    return (
        <div className="space-y-4 rounded-xl border border-line bg-muted/30 p-3 sm:p-4">
            <div className="flex gap-2">
                <button type="button" onClick={() => setMode("class")} className={chip(mode === "class")}>ক্লাস অনুযায়ী</button>
                <button type="button" onClick={() => setMode("subjects")} className={chip(mode === "subjects")}>বিষয় বেছে নাও</button>
            </div>

            {mode === "class" ? (
                <>
                    <div>
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">ক্লাস</p>
                        <div className="flex flex-wrap gap-2">
                            {opts.classes.map((c) => (
                                <button key={c._id} type="button" onClick={() => { setClassId(c._id); setStream(""); }} className={chip(classId === c._id)}>
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {needsStream && (
                        <div>
                            <p className="mb-2 text-xs font-semibold text-muted-foreground">বিভাগ</p>
                            <div className="flex flex-wrap gap-2">
                                {STREAMS.map((s) => (
                                    <button key={s.id} type="button" onClick={() => setStream(s.id)} className={chip(stream === s.id)}>
                                        {s.icon} {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {opts.versions.length > 1 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold text-muted-foreground">ভার্সন</p>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => setVersion("")} className={chip(!version)}>ডিফল্ট</button>
                                {opts.versions.map((v) => (
                                    <button key={v} type="button" onClick={() => setVersion(v)} className={chip(version === v)}>
                                        {VERSION_BN[v] ?? v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                            বিষয় ({toBnDigits(picked.length)}/{toBnDigits(MAX_SUBJECTS)})
                        </p>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="বিষয় খোঁজো…"
                            className="w-40 rounded-lg border border-line bg-card px-2.5 py-1 text-sm outline-none focus:border-brand"
                        />
                    </div>
                    <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                        {groups.map((g) => (
                            <div key={g.name}>
                                <p className="mb-1.5 text-xs font-bold text-foreground">{g.name}</p>
                                <div className="flex flex-wrap gap-2">
                                    {g.items.map((s) => (
                                        <button key={s._id} type="button" onClick={() => toggle(s._id)} className={chip(picked.includes(s._id))}>
                                            {s.name}
                                            {s.stream && !["general", "generel"].includes(s.stream) && (
                                                <span className="ml-1 text-xs opacity-70">· {STREAMS.find((x) => x.id === s.stream)?.label.split(" ")[0] ?? s.stream}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {groups.length === 0 && <p className="text-sm text-muted-foreground">কোনো বিষয় পাওয়া যায়নি</p>}
                    </div>
                </div>
            )}

            <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">ট্র্যাকের নাম (ঐচ্ছিক)</label>
                <input
                    value={name}
                    maxLength={40}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: গণিত ঝালাই"
                    className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none focus:border-brand"
                />
            </div>

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-accent">
                        বাতিল
                    </button>
                )}
                <button
                    type="button"
                    disabled={!valid || busy}
                    onClick={submit}
                    className="rounded-xl bg-gold px-5 py-2 text-sm font-bold text-brand-dark shadow-[0_3px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-40"
                >
                    {busy ? "সংরক্ষণ হচ্ছে…" : submitLabel}
                </button>
            </div>
        </div>
    );
}