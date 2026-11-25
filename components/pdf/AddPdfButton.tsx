"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCreateBook } from "@/hooks/use-pdf";
import { useAcademicTree } from "@/hooks/use-academic";

const EMPTY = { title: "", subject: "", chapter: "", fileUrl: "" };

export default function AddPdfButton() {
    const router = useRouter();
    const { data: user } = useUserProfile();
    const isAdmin = user?.role === "teacher" || user?.role === "admin";
    const { data: subjects = [] } = useAcademicTree({
        upto: "chapter", enabled: !!user?.profile && isAdmin, trackKey: user?.activeTrackId ?? undefined,
    });
    const create = useCreateBook();
    const [open, setOpen] = useState(false);
    const [f, setF] = useState(EMPTY);
    const [err, setErr] = useState("");

    const chapters: any[] = useMemo(
        () => (subjects as any[]).find(s => s._id === f.subject)?.chapters ?? [],
        [subjects, f.subject],
    );

    if (!isAdmin) return null;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr("");
        if (!f.title.trim() || !f.subject || !f.chapter || !/^https:\/\/\S+$/.test(f.fileUrl.trim()))
            return setErr("Fill every field. The link must start with https://");
        try {
            await create.mutateAsync({ ...f, title: f.title.trim(), fileUrl: f.fileUrl.trim() });
            setOpen(false); setF(EMPTY);
            router.refresh();
        } catch (e: any) { setErr(e.message); }
    }

    const input = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

    return (
        <>
            <button onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">
                <Plus className="size-3.5" /> PDF যোগ করো
            </button>

            {open && (
                <div onClick={() => setOpen(false)} className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 p-4">
                    <form onClick={e => e.stopPropagation()} onSubmit={submit}
                        className="w-full max-w-md space-y-3 rounded-2xl bg-background p-5 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold">নতুন PDF</h3>
                            <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full hover:bg-muted"><X className="size-5" /></button>
                        </div>
                        <input className={input} placeholder="শিরোনাম" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
                        <select className={input} value={f.subject} onChange={e => setF({ ...f, subject: e.target.value, chapter: "" })}>
                            <option value="">বিষয় নির্বাচন করো</option>
                            {(subjects as any[]).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <select className={input} value={f.chapter} disabled={!f.subject} onChange={e => setF({ ...f, chapter: e.target.value })}>
                            <option value="">অধ্যায় নির্বাচন করো</option>
                            {chapters.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <input className={input} placeholder="PDF লিংক (https://...)" value={f.fileUrl} onChange={e => setF({ ...f, fileUrl: e.target.value })} />
                        {err && <p className="text-sm text-red-500">{err}</p>}
                        <button disabled={create.isPending} className="w-full rounded-full bg-primary py-2 text-white disabled:opacity-50">
                            {create.isPending ? "সেভ হচ্ছে..." : "সেভ করো"}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}