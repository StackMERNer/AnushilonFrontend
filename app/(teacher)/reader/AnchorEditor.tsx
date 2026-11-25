// AnchorEditor.tsx
"use client";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import QuestionCard, { CardQuestion } from "@/components/QuestionCard"; // adjust path

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

type Rect = { x: number; y: number; w: number; h: number };
type Anchor = { _id: string; page: number; rect: Rect; questions: string[] };
type Sel = { _id?: string; page: number; rect: Rect };

// swap for your existing http client / base URL
async function api<T>(url: string, method = "GET", body?: unknown): Promise<T> {
    const r = await fetch(url, {
        method, credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
    return r.json();
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const frac = (e: React.PointerEvent, el: HTMLElement) => {
    const b = el.getBoundingClientRect();
    return { x: clamp((e.clientX - b.left) / b.width), y: clamp((e.clientY - b.top) / b.height) };
};

async function cropBlob(page: number, r: Rect) {
    const src = document.querySelector(`#pg-${page} canvas`) as HTMLCanvasElement | null;
    if (!src) throw new Error("Page not rendered yet");
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(r.w * src.width));
    c.height = Math.max(1, Math.round(r.h * src.height));
    c.getContext("2d")!.drawImage(src, r.x * src.width, r.y * src.height, c.width, c.height, 0, 0, c.width, c.height);
    return new Promise<Blob>((ok, no) => c.toBlob(b => (b ? ok(b) : no(new Error("Crop failed"))), "image/png"));
}

export default function AnchorEditor({ fileUrl, versionId, exportId }: {
    fileUrl: string; versionId: string; exportId: string;
}) {
    const [numPages, setNumPages] = useState(0);
    const [anchors, setAnchors] = useState<Anchor[]>([]);
    const [draft, setDraft] = useState<{ page: number; x0: number; y0: number; x1: number; y1: number } | null>(null);
    const [sel, setSel] = useState<Sel | null>(null);
    const [pasted, setPasted] = useState("");
    const [qs, setQs] = useState<CardQuestion[]>([]);
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [unknown, setUnknown] = useState<number[]>([]);
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api<Anchor[]>(`/pdf/anchors?version=${versionId}`).then(setAnchors).catch(e => setMsg(e.message));
    }, [versionId]);

    async function select(s: Sel, ids: string[] = []) {
        setSel(s); setPasted(""); setUnknown([]); setMsg(""); setQs([]); setChecked(new Set());
        if (!ids.length) return;
        const r = await api<{ questions: CardQuestion[] }>("/api/admin/pdf/questions", "POST", { ids });
        setQs(r.questions);
        setChecked(new Set(r.questions.map(q => q._id)));
    }

    async function copyImage() {
        if (!sel) return;
        try {
            const blob = await cropBlob(sel.page, sel.rect);
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            setMsg("Image copied. Paste it into Gemini.");
        } catch {
            downloadImage(); // clipboard needs https or localhost
        }
    }

    async function downloadImage() {
        if (!sel) return;
        const url = URL.createObjectURL(await cropBlob(sel.page, sel.rect));
        const a = document.createElement("a");
        a.href = url; a.download = `page-${sel.page}.png`; a.click();
        URL.revokeObjectURL(url);
    }

    async function find() {
        setBusy(true); setMsg("");
        try {
            const r = await api<{ questions: CardQuestion[]; unknown: number[] }>(
                "/api/admin/pdf/resolve-ids", "POST", { exportId, text: pasted });
            setUnknown(r.unknown);
            setQs(prev => {
                const seen = new Set(prev.map(q => q._id));
                return [...prev, ...r.questions.filter(q => !seen.has(q._id))];
            });
            setChecked(prev => new Set([...prev, ...r.questions.map(q => q._id)]));
            setPasted("");
        } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
    }

    async function save() {
        if (!sel) return;
        const questions = qs.filter(q => checked.has(q._id)).map(q => q._id);
        if (!questions.length) return setMsg("Tick at least one question.");
        setBusy(true);
        try {
            if (sel._id) {
                const a = await api<Anchor>(`/api/admin/pdf/anchors/${sel._id}`, "PATCH", { rect: sel.rect, questions });
                setAnchors(p => p.map(x => (x._id === a._id ? a : x)));
            } else {
                const a = await api<Anchor>("/api/admin/pdf/anchors", "POST",
                    { version: versionId, page: sel.page, rect: sel.rect, questions });
                setAnchors(p => [...p, a]);
                setSel({ ...sel, _id: a._id });
            }
            setMsg("Saved.");
        } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
    }

    async function remove() {
        if (!sel?._id || !confirm("Delete this region?")) return;
        await api(`/api/admin/pdf/anchors/${sel._id}`, "DELETE");
        setAnchors(p => p.filter(a => a._id !== sel._id));
        setSel(null); setQs([]);
    }

    function onUp(page: number) {
        if (!draft || draft.page !== page) return;
        const rect = {
            x: Math.min(draft.x0, draft.x1), y: Math.min(draft.y0, draft.y1),
            w: Math.abs(draft.x1 - draft.x0), h: Math.abs(draft.y1 - draft.y0),
        };
        setDraft(null);
        if (rect.w > 0.01 && rect.h > 0.01) select({ page, rect });
    }

    const box = (r: Rect): React.CSSProperties => ({
        position: "absolute", left: `${r.x * 100}%`, top: `${r.y * 100}%`,
        width: `${r.w * 100}%`, height: `${r.h * 100}%`,
    });

    return (
        <div className="flex gap-4 p-4">
            {/* PDF */}
            <div className="min-w-0 flex-1 overflow-auto">
                <Document file={fileUrl} onLoadSuccess={d => setNumPages(d.numPages)}>
                    {Array.from({ length: numPages }, (_, i) => {
                        const page = i + 1;
                        return (
                            <div key={page} id={`pg-${page}`}
                                style={{ position: "relative", width: 900, margin: "0 auto 16px", cursor: "crosshair", userSelect: "none" }}
                                onPointerDown={e => {
                                    if (e.button !== 0) return;
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    const p = frac(e, e.currentTarget);
                                    setDraft({ page, x0: p.x, y0: p.y, x1: p.x, y1: p.y });
                                }}
                                onPointerMove={e => {
                                    if (draft?.page !== page) return;
                                    const p = frac(e, e.currentTarget);
                                    setDraft({ ...draft, x1: p.x, y1: p.y });
                                }}
                                onPointerUp={() => onUp(page)}
                            >
                                <Page pageNumber={page} width={900} devicePixelRatio={2}
                                    renderTextLayer={false} renderAnnotationLayer={false} />

                                {anchors.filter(a => a.page === page).map(a => {
                                    const active = sel?._id === a._id;
                                    return (
                                        <div key={a._id}
                                            onPointerDown={e => e.stopPropagation()}
                                            onClick={() => select({ _id: a._id, page, rect: a.rect }, a.questions)}
                                            style={{
                                                ...box(a.rect), cursor: "pointer",
                                                border: `2px ${active ? "solid" : "dashed"} #e67e22`,
                                                background: active ? "rgba(230,126,34,.12)" : "transparent",
                                            }}>
                                            <span style={{
                                                position: "absolute", right: -10, top: -10, background: "#e67e22", color: "#fff",
                                                borderRadius: 999, minWidth: 24, height: 24, display: "grid", placeItems: "center", fontSize: 12
                                            }}>
                                                {a.questions.length}
                                            </span>
                                        </div>
                                    );
                                })}

                                {draft?.page === page && (
                                    <div style={{
                                        ...box({
                                            x: Math.min(draft.x0, draft.x1), y: Math.min(draft.y0, draft.y1),
                                            w: Math.abs(draft.x1 - draft.x0), h: Math.abs(draft.y1 - draft.y0)
                                        }),
                                        border: "2px solid #2563eb", background: "rgba(37,99,235,.1)", pointerEvents: "none",
                                    }} />
                                )}
                                {sel && !sel._id && sel.page === page && (
                                    <div style={{ ...box(sel.rect), border: "2px solid #2563eb", pointerEvents: "none" }} />
                                )}
                            </div>
                        );
                    })}
                </Document>
            </div>

            {/* Side panel */}
            <aside className="sticky top-4 h-[calc(100vh-2rem)] w-[440px] shrink-0 space-y-3 overflow-y-auto rounded-2xl border border-line bg-card p-4">
                {!sel ? (
                    <p className="text-sm text-muted-foreground">
                        Drag on a page to select a region, or click an existing dashed region to edit it.
                    </p>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2">
                            <b>Page {sel.page}</b>
                            <button onClick={copyImage} className="rounded-full bg-brand px-3 py-1 text-sm text-white">Copy image</button>
                            <button onClick={downloadImage} className="rounded-full border px-3 py-1 text-sm">Download</button>
                            {sel._id && <button onClick={remove} className="ml-auto rounded-full border px-3 py-1 text-sm text-red-500">Delete region</button>}
                        </div>

                        <textarea value={pasted} onChange={e => setPasted(e.target.value)} rows={3}
                            placeholder="Paste Gemini's answer here, e.g. [1], [6], [7]"
                            className="w-full rounded-xl border border-line bg-background p-2 text-sm" />
                        <button onClick={find} disabled={busy || !pasted.trim()}
                            className="rounded-full bg-brand px-4 py-1.5 text-sm text-white disabled:opacity-50">
                            Find questions
                        </button>

                        {unknown.length > 0 && (
                            <p className="text-sm text-red-500">Not in the export: {unknown.join(", ")}</p>
                        )}

                        <div className="space-y-3">
                            {qs.map((q, i) => (
                                <label key={q._id} className="block">
                                    <div className="mb-1 flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={checked.has(q._id)}
                                            onChange={e => setChecked(p => { const n = new Set(p); e.target.checked ? n.add(q._id) : n.delete(q._id); return n; })} />
                                        Include ({i + 1})
                                    </div>
                                    <QuestionCard question={q} showActions={false} />
                                </label>
                            ))}
                        </div>

                        <div className="sticky bottom-0 flex items-center gap-3 bg-card pt-2">
                            <button onClick={save} disabled={busy || checked.size === 0}
                                className="rounded-full bg-brand px-5 py-2 text-white disabled:opacity-50">
                                {sel._id ? "Update" : "Save"} ({checked.size})
                            </button>
                            <span className="text-sm text-muted-foreground">{msg}</span>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}