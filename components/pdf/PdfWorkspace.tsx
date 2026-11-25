"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Document, Page, Thumbnail, pdfjs } from "react-pdf";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowDown, ArrowUp, ChevronLeft, Copy, PanelLeftClose, PanelLeftOpen,
    Pencil, Trash2, X, ZoomIn, ZoomOut,
} from "lucide-react";
import clsx from "clsx";
import QuestionCard, { CardQuestion } from "@/components/QuestionCard"; // adjust path
import { useUserProfile } from "@/hooks/useUserProfile";
import { pdfService, useAnchorMutations, useBookExport, usePdfAnchors } from "@/hooks/use-pdf";
import type { IPdfAnchor, PdfRect } from "@/services/pdf.service";
import { getAnchorQuestions } from "@/app/(teacher)/pdf/actions";
import QuestionListSkeleton from "../QuestionListSkeleton";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

// Stable references so react-pdf doesn't reload the document on re-render
const PDF_OPTIONS = {};
const LOADING_EL = <p className="p-4">Loading PDF...</p>;
const ERROR_EL = <p className="p-4">Failed to load PDF.</p>;
const EMPTY: IPdfAnchor[] = [];

const MIN = 0.01;
const DEFAULT_RATIO = 1.4142;
const GAP = 16;          // space under each page
const THUMB_W = 116;
const thumbH = (ratio: number) => THUMB_W * ratio + 40; // border + label + spacing

type Dir = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
const HANDLES: { dir: Dir; cursor: string }[] = [
    { dir: "nw", cursor: "nwse-resize" }, { dir: "n", cursor: "ns-resize" },
    { dir: "ne", cursor: "nesw-resize" }, { dir: "e", cursor: "ew-resize" },
    { dir: "se", cursor: "nwse-resize" }, { dir: "s", cursor: "ns-resize" },
    { dir: "sw", cursor: "nesw-resize" }, { dir: "w", cursor: "ew-resize" },
];

type Sel = { _id?: string; page: number; rect: PdfRect; ids: string[] };
type Drag = { mode: "draw" | "move" | Dir; page: number; start: { x: number; y: number }; orig: PdfRect };

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const strip = (s = "") => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const pageEl = (page: number) => document.getElementById(`pg-${page}`)!;
const frac = (e: React.PointerEvent, el: HTMLElement) => {
    const b = el.getBoundingClientRect();
    return { x: clamp((e.clientX - b.left) / b.width), y: clamp((e.clientY - b.top) / b.height) };
};
const box = (r: PdfRect): React.CSSProperties => ({
    position: "absolute",
    left: `${r.x * 100}%`, top: `${r.y * 100}%`,
    width: `${r.w * 100}%`, height: `${r.h * 100}%`,
});

function applyDrag(d: Drag, p: { x: number; y: number }): PdfRect {
    if (d.mode === "draw") {
        return { x: Math.min(d.start.x, p.x), y: Math.min(d.start.y, p.y), w: Math.abs(p.x - d.start.x), h: Math.abs(p.y - d.start.y) };
    }
    const o = d.orig;
    if (d.mode === "move") {
        return { x: clamp(o.x + p.x - d.start.x, 0, 1 - o.w), y: clamp(o.y + p.y - d.start.y, 0, 1 - o.h), w: o.w, h: o.h };
    }
    let l = o.x, t = o.y, r = o.x + o.w, b = o.y + o.h;
    if (d.mode.includes("w")) l = Math.min(p.x, r - MIN);
    if (d.mode.includes("e")) r = Math.max(p.x, l + MIN);
    if (d.mode.includes("n")) t = Math.min(p.y, b - MIN);
    if (d.mode.includes("s")) b = Math.max(p.y, t + MIN);
    return { x: l, y: t, w: r - l, h: b - t };
}

async function cropBlob(page: number, r: PdfRect) {
    const src = document.querySelector(`#pg-${page} canvas`) as HTMLCanvasElement | null;
    if (!src) throw new Error("Page not rendered yet");
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(r.w * src.width));
    c.height = Math.max(1, Math.round(r.h * src.height));
    c.getContext("2d")!.drawImage(src, r.x * src.width, r.y * src.height, c.width, c.height, 0, 0, c.width, c.height);
    return new Promise<Blob>((ok, no) => c.toBlob(b => (b ? ok(b) : no(new Error("Crop failed"))), "image/png"));
}

/* ----------------------- scroll-position virtualization ------------------ */
// Every item keeps a fixed height, so nothing ever changes the scroll height.
// Only the *contents* of items near the viewport are mounted.

function buildOffsets(heights: number[]) {
    const offsets: number[] = [];
    let t = 0;
    for (const h of heights) { offsets.push(t); t += h; }
    return offsets;
}
function indexAt(offsets: number[], y: number) {
    let lo = 0, hi = offsets.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (offsets[mid] <= y) lo = mid; else hi = mid - 1;
    }
    return lo;
}

function useWindow(ref: React.RefObject<HTMLElement | null>, offsets: number[], overscan: number, active = true) {
    const [mid, setMid] = useState(0);
    const [win, setWin] = useState({ from: 0, to: 1 });

    useEffect(() => {
        const el = ref.current;
        if (!active || !el || !offsets.length) return;
        let raf = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const updateMid = () => setMid(indexAt(offsets, el.scrollTop + el.clientHeight / 2));
        const settle = () => {
            const top = el.scrollTop, h = el.clientHeight;
            const from = indexAt(offsets, Math.max(0, top - overscan));
            const to = indexAt(offsets, top + h + overscan);
            setWin(w => (w.from === from && w.to === to ? w : { from, to }));
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(() => { raf = 0; updateMid(); });
            clearTimeout(timer);
            timer = setTimeout(settle, 90);   // mount/unmount only after scrolling calms down
        };

        updateMid(); settle();
        el.addEventListener("scroll", onScroll, { passive: true });
        const ro = new ResizeObserver(() => { updateMid(); settle(); });
        ro.observe(el);
        return () => {
            cancelAnimationFrame(raf); clearTimeout(timer);
            el.removeEventListener("scroll", onScroll); ro.disconnect();
        };
    }, [ref, offsets, overscan, active]);

    return { mid, ...win };
}

/* ------------------------------------------------------------------ */

export default function PdfWorkspace({ title, fileUrl, versionId, bookId = "", initialAnchors }: {
    title: string; fileUrl: string; versionId: string; bookId?: string; initialAnchors: IPdfAnchor[];
}) {
    const { data: me } = useUserProfile();
    const isAdmin = me?.role === "admin";

    const [numPages, setNumPages] = useState(0);
    const [ratios, setRatios] = useState<number[]>([]);
    const [editing, setEditing] = useState(false);
    // const [thumbsOpen, setThumbsOpen] = useState(true);
    const [thumbsOpen, setThumbsOpen] = useState(() => window.innerWidth >= 768);

    const scrollRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const navHover = useRef(false);
    const drag = useRef<Drag | null>(null);

    const ZOOMS = [0.75, 1, 1.25, 1.5, 2, 3];

    const [zoom, setZoom] = useState(1);
    const [boxW, setBoxW] = useState(0);
    const [renderWidth, setRenderWidth] = useState(800);

    // measure the scroll area (runs again once the pages container exists)
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
        ro.observe(el);
        setBoxW(el.clientWidth);
        return () => ro.disconnect();
    }, [numPages]);

    // 100% = fit the screen, capped on big monitors; 12px gutters keep the badges from being clipped
    const fitW = Math.max(240, Math.min(boxW - 24, 900));
    const width = Math.round(fitW * zoom);

    const stepZoom = (d: 1 | -1) =>
        setZoom(z => {
            const i = ZOOMS.findIndex(v => v >= z);
            return ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, i + d))];
        });



    const [viewing, setViewing] = useState<IPdfAnchor | null>(null);

    const [sel, setSel] = useState<Sel | null>(null);
    const [draft, setDraft] = useState<{ page: number; rect: PdfRect } | null>(null);
    const [dirty, setDirty] = useState(false);
    const [qCache, setQCache] = useState<Record<string, CardQuestion>>({});
    const cacheRef = useRef(qCache);
    useEffect(() => { cacheRef.current = qCache; }, [qCache]);
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);

    const { data: anchorData } = usePdfAnchors(versionId, isAdmin, initialAnchors);
    const anchors = anchorData ?? EMPTY;
    const { create, update, remove } = useAnchorMutations(versionId);

    const editOn = isAdmin && editing;

    useEffect(() => {
        const t = setTimeout(() => setRenderWidth(width), 200);
        return () => clearTimeout(t);
    }, [width]);

    const anchorsByPage = useMemo(() => {
        const m = new Map<number, IPdfAnchor[]>();
        anchors.forEach(a => m.set(a.page, [...(m.get(a.page) ?? []), a]));
        return m;
    }, [anchors]);

    const ratioOf = useCallback((page: number) => ratios[page - 1] ?? ratios[0] ?? DEFAULT_RATIO, [ratios]);

    // layout: fixed heights for every page and thumbnail
    const pageOffsets = useMemo(
        () => buildOffsets(Array.from({ length: numPages }, (_, i) => width * ratioOf(i + 1) + GAP)),
        [numPages, width, ratioOf],
    );
    const thumbOffsets = useMemo(
        () => buildOffsets(Array.from({ length: numPages }, (_, i) => thumbH(ratioOf(i + 1)))),
        [numPages, ratioOf],
    );

    const pw = useWindow(scrollRef, pageOffsets, 1200);
    const tw = useWindow(navRef, thumbOffsets, 800, thumbsOpen);
    const current = pw.mid + 1;

    // keep the zoomed page in view when the width changes
    const currentRef = useRef(1);
    useEffect(() => { currentRef.current = current; }, [current]);

    useEffect(() => {
        if (scrollRef.current && pageOffsets.length)
            // eslint-disable-next-line react-hooks/immutability
            scrollRef.current.scrollTop = pageOffsets[currentRef.current - 1] ?? 0;
        //  eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width]);

    // keep the active thumbnail visible, but never fight the user while they use the thumbnail panel
    useEffect(() => {
        const nav = navRef.current;
        if (!thumbsOpen || !nav || navHover.current || !thumbOffsets.length) return;
        const top = thumbOffsets[current - 1] ?? 0;
        const bottom = top + thumbH(ratioOf(current));
        if (top < nav.scrollTop || bottom > nav.scrollTop + nav.clientHeight) nav.scrollTop = Math.max(0, top - 8);
    }, [current, thumbsOpen, thumbOffsets, ratioOf]);

    const goTo = (p: number) => scrollRef.current?.scrollTo({ top: pageOffsets[p - 1] ?? 0 });

    const onLoadSuccess = useCallback(async (d: any) => {
        setNumPages(d.numPages);
        const rs = await Promise.all(Array.from({ length: d.numPages }, async (_, i) => {
            const p = await d.getPage(i + 1);
            const [x1, y1, x2, y2] = p.view;
            const r = (y2 - y1) / (x2 - x1);
            return Number.isFinite(r) && r > 0 ? r : DEFAULT_RATIO;
        }));
        setRatios(rs);
    }, []);

    /* ----------------------------- editor logic ---------------------------- */

    const confirmLeave = () => !dirty || confirm("Discard unsaved changes?");

    async function ensureQuestions(ids: string[]) {
        const missing = ids.filter(id => !cacheRef.current[id]);
        if (!missing.length) return;
        try {
            const r = await pdfService.getQuestions(missing);
            setQCache(p => ({ ...p, ...Object.fromEntries(r.questions.map(q => [q._id, q])) }));
        } catch (e: any) { setMsg(e.message); }
    }

    function selectAnchor(a: IPdfAnchor) {
        if (!confirmLeave()) return;
        const ids = a.questions ?? [];
        setSel({ _id: a._id, page: a.page, rect: a.rect, ids });
        setDirty(false); setMsg("");
        ensureQuestions(ids);
    }

    function addQuestions(qs: CardQuestion[]) {
        setQCache(p => ({ ...p, ...Object.fromEntries(qs.map(q => [q._id, q])) }));
        setSel(s => s && { ...s, ids: [...s.ids, ...qs.map(q => q._id).filter(id => !s.ids.includes(id))] });
        setDirty(true);
    }

    function move(i: number, d: -1 | 1) {
        setSel(s => {
            if (!s) return s;
            const j = i + d;
            if (j < 0 || j >= s.ids.length) return s;
            const ids = [...s.ids];
            [ids[i], ids[j]] = [ids[j], ids[i]];
            return { ...s, ids };
        });
        setDirty(true);
    }

    async function save() {
        if (!sel) return;
        if (!sel.ids.length) return setMsg("Add at least one question.");
        setBusy(true);
        try {
            if (sel._id) {
                await update.mutateAsync({ id: sel._id, rect: sel.rect, questions: sel.ids });
            } else {
                const a = await create.mutateAsync({ page: sel.page, rect: sel.rect, questions: sel.ids });
                setSel(s => s && { ...s, _id: a._id });
            }
            setDirty(false); setMsg("Saved.");
        } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
    }

    async function del() {
        if (!sel?._id || !confirm("Delete this region?")) return;
        try {
            await remove.mutateAsync(sel._id);
            setSel(null); setDirty(false);
        } catch (e: any) { setMsg(e.message); }
    }

    async function copyImage() {
        if (!sel) return;
        try {
            const blob = await cropBlob(sel.page, sel.rect);
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            setMsg("Image copied. Paste it into AI.");
        } catch (e: any) { setMsg(e.message || "Copy failed (needs https or localhost)"); }
    }

    /* ----------------------------- pointer events -------------------------- */

    function onDown(e: React.PointerEvent<HTMLDivElement>, page: number) {
        if (!editOn || e.button !== 0 || !confirmLeave()) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { mode: "draw", page, start: frac(e, e.currentTarget), orig: { x: 0, y: 0, w: 0, h: 0 } };
    }
    function onMove(e: React.PointerEvent<HTMLDivElement>, page: number) {
        const d = drag.current;
        if (!d || d.page !== page) return;
        const r = applyDrag(d, frac(e, e.currentTarget));
        if (d.mode === "draw") setDraft({ page, rect: r });
        else { setSel(s => s && { ...s, rect: r }); setDirty(true); }
    }
    function onUp(e: React.PointerEvent<HTMLDivElement>, page: number) {
        const d = drag.current;
        drag.current = null;
        if (!d || d.page !== page) return;
        if (d.mode === "draw") {
            const r = applyDrag(d, frac(e, e.currentTarget));
            setDraft(null);
            if (r.w > MIN && r.h > MIN) {
                setSel({ page, rect: r, ids: [] });
                setDirty(true); setMsg("");
            }
        }
    }
    function startDrag(e: React.PointerEvent<HTMLElement>, mode: Drag["mode"]) {
        if (!sel) return;
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { mode, page: sel.page, start: frac(e, pageEl(sel.page)), orig: sel.rect };
    }

    /* --------------------------------- UI ---------------------------------- */

    const dpr = typeof window === "undefined" ? 1 : Math.min(editOn ? 2 : 1.5, window.devicePixelRatio || 1);

    const questionsByPage = useMemo(() => {
        const m = new Map<number, number>();
        anchors.forEach(a => m.set(a.page, (m.get(a.page) ?? 0) + a.count));
        return m;
    }, [anchors]);

    return (
        <div className="flex h-dvh flex-col bg-muted/30">
            {/* toolbar */}
            <div className="flex items-center gap-2 border-b border-line bg-card px-3 py-2 text-sm">
                <Link href="/pdf" className="grid size-8 place-items-center rounded-full hover:bg-muted md:hidden" aria-label="Back">
                    <ChevronLeft className="size-5" />
                </Link>
                <button onClick={() => setThumbsOpen(v => !v)} title={thumbsOpen ? "Hide thumbnails" : "Show thumbnails"}
                    className="grid size-8 place-items-center rounded-full hover:bg-muted">
                    {thumbsOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
                </button>
                <b className="min-w-0 flex-1 truncate sm:flex-none sm:max-w-[40%]">{title}</b>
                <span className="text-muted-foreground text-xs md:text-base">{numPages ? `${current} / ${numPages}` : "…"}</span>
                <button className="rounded-full border p-1.5" onClick={() => stepZoom(-1)}><ZoomOut className="size-4" /></button>
                <button onClick={() => setZoom(1)} className="w-12 text-center text-xs">{Math.round(zoom * 100)}%</button>
                <button className="rounded-full border p-1.5" onClick={() => stepZoom(1)}><ZoomIn className="size-4" /></button>
                {isAdmin && (
                    <button
                        onClick={() => { if (editing && !confirmLeave()) return; setEditing(v => !v); setSel(null); setDirty(false); }}
                        className={clsx("ml-auto hidden items-center gap-1.5 rounded-full px-4 py-1.5 font-semibold md:inline-flex",
                            editing ? "bg-brand text-white" : "border")}
                    >
                        <Pencil className="size-4" /> {editing ? "Editing" : "Edit"}
                    </button>
                )}
            </div>

            <Document
                file={fileUrl}
                options={PDF_OPTIONS}
                className="relative flex min-h-0 flex-1"
                loading={LOADING_EL}
                error={ERROR_EL}
                onLoadSuccess={onLoadSuccess}
                onItemClick={({ pageNumber }) => { goTo(pageNumber); if (window.innerWidth < 768) setThumbsOpen(false); }}
            >
                {/* thumbnails (collapsible) */}
                {thumbsOpen && <div className="absolute inset-0 z-20 bg-black/30 md:hidden" onClick={() => setThumbsOpen(false)} />}
                {thumbsOpen && (
                    <nav
                        ref={navRef}
                        onMouseEnter={() => { navHover.current = true; }}
                        onMouseLeave={() => { navHover.current = false; }}
                        className="absolute inset-y-0 left-0 z-30 w-36 shrink-0 overflow-y-auto border-r border-line bg-card shadow-xl md:static md:z-auto md:shadow-none"
                        style={{ overflowAnchor: "none" }}
                    >
                        {Array.from({ length: numPages }, (_, i) => {
                            const p = i + 1;
                            const near = i >= tw.from && i <= tw.to;
                            const count = questionsByPage.get(p) ?? 0;
                            return (
                                <button key={p}
                                    onClick={() => { goTo(p); if (window.innerWidth < 768) setThumbsOpen(false); }}
                                    className="block w-full overflow-hidden text-center"
                                    style={{ height: thumbH(ratioOf(p)) }}>
                                    <div className="pt-2">
                                        {near ? (
                                            <div className={clsx("relative mx-auto w-fit overflow-hidden rounded border-2",
                                                p === current ? "border-brand" : "border-transparent")}>
                                                <Thumbnail pageNumber={p} width={THUMB_W} />
                                                {count > 0 && (
                                                    <span className="absolute right-1 top-1 grid min-w-5 place-items-center rounded-full bg-[#e67e22] px-1 text-[10px] text-white">{count}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mx-auto rounded bg-muted" style={{ width: THUMB_W + 4, height: THUMB_W * ratioOf(p) + 4 }} />
                                        )}
                                        <span className={clsx("mt-1 block text-xs", p === current && "font-bold text-brand")}>{p}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                )}

                {/* pages */}
                <div ref={scrollRef} className="min-w-0 flex-1 overflow-auto" style={{ overflowAnchor: "none" }}>
                    {Array.from({ length: numPages }, (_, i) => {
                        const page = i + 1;
                        const list = anchorsByPage.get(page) ?? [];
                        const render = i >= pw.from && i <= pw.to;
                        return (
                            <div key={page} style={{ height: width * ratioOf(page) + GAP }}>
                                <PageBox
                                    page={page} width={width} renderWidth={renderWidth}
                                    ratio={ratioOf(page)} dpr={dpr} editing={editOn} render={render}
                                    onPointerDown={e => onDown(e, page)}
                                    onPointerMove={e => onMove(e, page)}
                                    onPointerUp={e => onUp(e, page)}
                                    onPointerCancel={() => { drag.current = null; setDraft(null); }}
                                >
                                    {list.filter(a => a._id !== sel?._id).map(a => (
                                        <div key={a._id}
                                            onPointerDown={e => editOn && e.stopPropagation()}
                                            onClick={() => editOn && selectAnchor(a)}
                                            style={{
                                                ...box(a.rect),
                                                border: "2px dashed #e67e22",
                                                pointerEvents: editOn ? "auto" : "none",
                                                cursor: editOn ? "pointer" : "default",
                                            }}>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    if (editOn) {
                                                        selectAnchor(a);
                                                    } else {
                                                        setViewing(a);
                                                    }
                                                }}
                                                style={{
                                                    position: "absolute", right: -10, top: -10, pointerEvents: "auto",
                                                    borderRadius: 999, background: "#e67e22", color: "#fff",
                                                    minWidth: 24, height: 24, border: "none", cursor: "pointer", fontSize: 12,
                                                }}>
                                                {a.count}
                                            </button>
                                        </div>
                                    ))}

                                    {draft?.page === page && (
                                        <div style={{ ...box(draft.rect), border: "2px solid #2563eb", background: "rgba(37,99,235,.1)", pointerEvents: "none" }} />
                                    )}

                                    {editOn && sel?.page === page && (
                                        <div
                                            onPointerDown={e => startDrag(e, "move")}
                                            style={{ ...box(sel.rect), border: "2px solid #2563eb", background: "rgba(37,99,235,.1)", cursor: "move", touchAction: "none" }}>
                                            {HANDLES.map(h => (
                                                <span key={h.dir}
                                                    onPointerDown={e => startDrag(e, h.dir)}
                                                    style={{
                                                        position: "absolute",
                                                        left: h.dir.includes("w") ? "0%" : h.dir.includes("e") ? "100%" : "50%",
                                                        top: h.dir.includes("n") ? "0%" : h.dir.includes("s") ? "100%" : "50%",
                                                        width: 12, height: 12, transform: "translate(-50%,-50%)",
                                                        background: "#2563eb", border: "2px solid #fff", borderRadius: 3,
                                                        cursor: h.cursor, touchAction: "none",
                                                    }} />
                                            ))}
                                        </div>
                                    )}
                                </PageBox>
                            </div>
                        );
                    })}
                </div>

                {/* editor panel */}
                {editOn && (
                    <EditorPanel
                        sel={sel} qCache={qCache} bookId={bookId} msg={msg} busy={busy} dirty={dirty}
                        onCopy={copyImage} onSave={save} onDelete={del}
                        onAdd={addQuestions} onMove={move}
                        onRemove={i => { setSel(s => s && { ...s, ids: s.ids.filter((_, k) => k !== i) }); setDirty(true); }}
                        onClose={() => { if (confirmLeave()) { setSel(null); setDirty(false); } }}
                        setMsg={setMsg}
                    />
                )}
            </Document>

            {viewing && <QuestionModal anchor={viewing} onClose={() => setViewing(null)} />}
        </div>
    );
}

/* ------------------------------ page wrapper ----------------------------- */

function PageBox({ page, width, renderWidth, ratio, dpr, editing, render, children, ...handlers }: {
    page: number; width: number; renderWidth: number; ratio: number; dpr: number;
    editing: boolean; render: boolean; children?: React.ReactNode;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel">) {
    return (
        <div
            id={`pg-${page}`} data-page={page} {...handlers}
            style={{
                position: "relative", width, height: width * ratio, margin: `${GAP / 2}px auto 0`,
                background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.15)",
                cursor: editing ? "crosshair" : "default",
                userSelect: "none", touchAction: editing ? "none" : "auto",
            }}
        >
            {render && (
                <>
                    <Page
                        pageNumber={page} width={renderWidth} devicePixelRatio={dpr}
                        renderTextLayer={false} renderAnnotationLayer={false}
                        loading={<div className="h-full w-full bg-muted" />}
                    />
                    {children}
                </>
            )}
        </div>
    );
}

/* ------------------------------ reader modal ----------------------------- */

function QuestionModal({ anchor, onClose }: { anchor: IPdfAnchor; onClose: () => void }) {
    const { data: qs, isLoading, error } = useQuery({
        queryKey: ["anchor-questions", anchor._id],
        queryFn: () => getAnchorQuestions(anchor._id),   // server action: runs on the Next.js server
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    });
    return (
        <div onClick={onClose} className="fixed inset-0 z-1000 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
            <div onClick={e => e.stopPropagation()}
                className="flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-2xl bg-background p-4 shadow-xl sm:rounded-2xl border">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold">প্রশ্ন ({anchor.count})</h3>
                    <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-muted"><X className="size-5" /></button>
                </div>
                <div className="space-y-3 overflow-y-auto">
                    {isLoading && <QuestionListSkeleton length={3} />}
                    {error && <p className="text-sm text-red-500">{(error as Error).message}</p>}
                    {qs?.map((q, i) => <QuestionCard key={q._id} question={q} questionNo={i + 1} srsEnabled />)}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------ editor panel ----------------------------- */

function EditorPanel({ sel, qCache, bookId, msg, busy, dirty, onCopy, onSave, onDelete, onAdd, onMove, onRemove, onClose, setMsg }: {
    sel: Sel | null; qCache: Record<string, CardQuestion>; bookId: string; msg: string; busy: boolean; dirty: boolean;
    onCopy: () => void; onSave: () => void; onDelete: () => void;
    onAdd: (qs: CardQuestion[]) => void; onMove: (i: number, d: -1 | 1) => void;
    onRemove: (i: number) => void; onClose: () => void; setMsg: (m: string) => void;
}) {
    const [mode, setMode] = useState<"ids" | "AI">("ids");
    const [text, setText] = useState("");

    const [open, setOpen] = useState<string | null>(null);
    const [working, setWorking] = useState(false);

    async function add() {
        setWorking(true); setMsg("");
        try {
            if (mode === "ids") {
                const tokens = text.split(/[\s,;]+/).filter(Boolean);
                const r = await pdfService.lookup(tokens);
                onAdd(r.questions);
                if (r.notFound.length) setMsg(`Not found: ${r.notFound.join(", ")}`);
            } else {
                if (!bookId) return setMsg("Enter the export id first.");
                const r = await pdfService.resolveIds(bookId, text);
                onAdd(r.questions);
                if (r.unknown.length) setMsg(`Not in the export: ${r.unknown.join(", ")}`);
            }
            setText("");
        } catch (e: any) { setMsg(e.message); } finally { setWorking(false); }
    }

    return (
        <aside className="w-[220px] shrink-0 space-y-3 overflow-y-auto border-l border-line bg-card p-4">
            <ExportBox bookId={bookId} setMsg={setMsg} />
            {!sel ? (
                <p className="text-sm text-muted-foreground">
                    Drag on a page to draw a region, or click a dashed region to edit it. Drag the body to move it and the handles to resize.
                </p>
            ) : (
                <>
                    <div className="flex flex-wrap items-center gap-2">
                        <b>Page {sel.page}</b>
                        <span className="text-xs text-muted-foreground">
                            {Math.round(sel.rect.w * 100)}% × {Math.round(sel.rect.h * 100)}%
                        </span>
                        <button onClick={onCopy} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                            <Copy className="size-3.5" /> Copy image
                        </button>
                        <button onClick={onClose} className="ml-auto grid size-7 place-items-center rounded-full hover:bg-muted"><X className="size-4" /></button>
                    </div>

                    <div className="space-y-2 rounded-xl border border-line p-3">
                        <div className="flex flex-wrap gap-1 text-xs">
                            {(["ids", "AI"] as const).map(m => (
                                <button key={m} onClick={() => setMode(m)}
                                    className={clsx("rounded-full px-3 py-1", mode === m ? "bg-brand text-white" : "border")}>
                                    {m === "ids" ? "Ids" : "AI"}
                                </button>
                            ))}
                        </div>

                        <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
                            placeholder={mode === "ids" ? "ids or refIds, separated by space, comma or new line" : "e.g. [1], [6], [7]"}
                            className="w-full rounded-lg border border-line bg-background p-2 text-sm" />
                        <button onClick={add} disabled={working || !text.trim()}
                            className="rounded-full bg-brand px-4 py-1.5 text-sm text-white disabled:opacity-50">Add questions</button>
                    </div>

                    <ol className="space-y-2">
                        {sel.ids.map((id, i) => {
                            const q = qCache[id];
                            return (
                                <li key={id} className="rounded-xl border border-line p-2">
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5 w-5 shrink-0 text-center text-xs font-bold">{i + 1}</span>
                                        <button className="min-w-0 flex-1 text-left text-sm" onClick={() => setOpen(open === id ? null : id)}>
                                            <span className="line-clamp-2">{q ? strip(q.question || q.context) || "(no text)" : "Loading…"}</span>
                                            <span className="block truncate text-[11px] text-muted-foreground">{(q as any)?.refId ?? id}</span>
                                        </button>
                                    </div>
                                    <div className="mt-1 flex items-center justify-end">
                                        <button disabled={i === 0} onClick={() => onMove(i, -1)} className="grid size-7 place-items-center rounded hover:bg-muted disabled:opacity-30"><ArrowUp className="size-4" /></button>
                                        <button disabled={i === sel.ids.length - 1} onClick={() => onMove(i, 1)} className="grid size-7 place-items-center rounded hover:bg-muted disabled:opacity-30"><ArrowDown className="size-4" /></button>
                                        <button onClick={() => onRemove(i)} className="grid size-7 place-items-center rounded text-red-500 hover:bg-muted"><X className="size-4" /></button>
                                    </div>
                                    {open === id && q && <div className="mt-2"><QuestionCard question={q} showActions={false} /></div>}
                                </li>
                            );
                        })}
                    </ol>

                    <div className="sticky bottom-0 flex flex-wrap items-center gap-2 bg-card pt-2">
                        <button onClick={onSave} disabled={busy || !sel.ids.length || (!dirty && !!sel._id)}
                            className="rounded-full bg-brand px-5 py-2 text-white disabled:opacity-50">
                            {sel._id ? "Update" : "Save"} ({sel.ids.length})
                        </button>
                        {sel._id && (
                            <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm text-red-500">
                                <Trash2 className="size-4" /> Delete
                            </button>
                        )}
                        <span className="text-sm text-muted-foreground">{dirty ? "Unsaved changes · " : ""}{msg}</span>
                    </div>
                </>
            )}
        </aside>
    );
}


function saveText(name: string, text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
}

function ExportBox({ bookId, setMsg }: { bookId: string; setMsg: (m: string) => void }) {
    const { info, generate } = useBookExport(bookId, true);
    const [topic, setTopic] = useState("");
    const [busy, setBusy] = useState(false);
    const data = info.data;
    const ex = data?.export;

    async function run() {
        if (ex && !confirm("This replaces the current list. Question numbers in your old chat will no longer match. Continue?")) return;
        setMsg("");
        try { await generate.mutateAsync({ topic: topic || undefined }); }
        catch (e: any) { setMsg(e.message); }
    }

    async function download(only?: number) {
        setBusy(true);
        try {
            const { parts } = await pdfService.getExportFiles(bookId);
            const todo = only === undefined ? parts.map((_, i) => i) : [only];
            todo.forEach((i, k) => setTimeout(() => saveText(`questions-part-${i + 1}-of-${parts.length}.txt`, parts[i]), k * 350));
        } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
    }

    const exTopic = data?.topics.find(t => t._id === ex?.topic)?.name;

    return (
        <div className="space-y-2 rounded-xl border border-line p-3 text-xs">
            <div className="font-semibold">Question list</div>
            <div className="text-muted-foreground">{data ? data.chapter.name : "Loading…"}</div>
            <select value={topic} onChange={e => setTopic(e.target.value)}
                className="w-full rounded-lg border border-line bg-background px-2 py-1.5">
                <option value="">Whole chapter</option>
                {data?.topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <button onClick={run} disabled={!data || generate.isPending}
                className="w-full rounded-full bg-brand px-3 py-1.5 text-white disabled:opacity-50">
                {generate.isPending ? "Generating…" : ex ? "Regenerate" : "Generate"}
            </button>

            {ex && (
                <div className="space-y-1.5">
                    <p className="text-muted-foreground">
                        {ex.total} questions · {exTopic ?? "whole chapter"} · {ex.parts} file{ex.parts > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        <button onClick={() => download()} disabled={busy} className="rounded-full border px-2.5 py-1">Download all</button>
                        {ex.parts > 1 && Array.from({ length: ex.parts }, (_, i) => (
                            <button key={i} onClick={() => download(i)} disabled={busy} className="rounded-full border px-2.5 py-1">{i + 1}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}