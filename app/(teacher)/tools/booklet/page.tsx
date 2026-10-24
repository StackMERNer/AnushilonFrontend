"use client";

import { cn } from "@/lib/utils";
import {
    BookOpen,
    Columns2,
    Download,
    FileText,
    Info,
    Loader2,
    Printer,
    RotateCcw,
    UploadCloud,
} from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import { useEffect, useRef, useState, type DragEvent } from "react";

/* ---------- constants & helpers ---------- */
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PAGES = 50;
const MM = 72 / 25.4;

type Mode = "booklet" | "twoUp";
type SheetSize = "A4" | "A3";

// landscape sheet sizes in PDF points
const SHEETS: Record<SheetSize, [number, number]> = {
    A4: [841.89, 595.28],
    A3: [1190.55, 841.89],
};

const bn = (n: number) => n.toLocaleString("bn-BD");
const formatSize = (b: number) =>
    b < 1024 * 1024
        ? `${bn(Math.round(b / 1024))} কেবি`
        : `${bn(Number((b / 1048576).toFixed(1)))} এমবি`;

type Result = {
    url: string;
    fileName: string;
    inputPages: number;
    sides: number;
    paperSheets: number;
    blanks: number;
};

const COPIES = [2, 4, 6, 8] as const;
type Copies = (typeof COPIES)[number];

// [columns, rows] on a landscape sheet
const GRID: Record<Copies, [number, number]> = {
    2: [2, 1],
    4: [2, 2],
    6: [3, 2],
    8: [4, 2],
};

async function buildPdf(
    file: File,
    mode: Mode,
    sheet: SheetSize,
    marginMm: number,
    guide: boolean,
    copies: Copies
): Promise<Omit<Result, "url" | "fileName"> & { bytes: Uint8Array }> {
    const src = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: true,
    });
    const n = src.getPageCount();
    if (n > MAX_PAGES) throw new Error("TOO_MANY_PAGES");

    const out = await PDFDocument.create();
    const embedded = await out.embedPages(src.getPages());
    const [W, H] = SHEETS[sheet];
    const m = marginMm * MM;

    const drawGuides = (page: ReturnType<typeof out.addPage>, cols: number, rows: number) => {
        const opts = {
            thickness: 0.5,
            color: rgb(0.75, 0.75, 0.75),
            dashArray: [4, 4],
        };
        for (let c = 1; c < cols; c++) {
            const x = (W / cols) * c;
            page.drawLine({ start: { x, y: 0 }, end: { x, y: H }, ...opts });
        }
        for (let r = 1; r < rows; r++) {
            const y = (H / rows) * r;
            page.drawLine({ start: { x: 0, y }, end: { x: W, y }, ...opts });
        }
    };

    /* ---------- booklet (unchanged logic) ---------- */
    if (mode === "booklet") {
        const cellW = W / 2;
        const total = Math.ceil(n / 4) * 4;
        const idx = (i: number) => (i < n ? i : null);
        const pairs: [number | null, number | null][] = [];
        for (let s = 0; s < total / 4; s++) {
            pairs.push([idx(total - 1 - 2 * s), idx(2 * s)]);
            pairs.push([idx(2 * s + 1), idx(total - 2 - 2 * s)]);
        }

        for (const pair of pairs) {
            const page = out.addPage([W, H]);
            pair.forEach((p, slot) => {
                if (p === null) return;
                const e = embedded[p];
                const scale = Math.min((cellW - 2 * m) / e.width, (H - 2 * m) / e.height);
                page.drawPage(e, {
                    x: slot * cellW + (cellW - e.width * scale) / 2,
                    y: (H - e.height * scale) / 2,
                    xScale: scale,
                    yScale: scale,
                });
            });
            if (guide) drawGuides(page, 2, 1);
        }

        return {
            bytes: await out.save(),
            inputPages: n,
            sides: pairs.length,
            paperSheets: total / 4,
            blanks: total - n,
        };
    }

    /* ---------- repeat each page `copies` times on one sheet ---------- */
    const [cols, rows] = GRID[copies];
    const cw = W / cols;
    const ch = H / rows;

    for (const e of embedded) {
        const page = out.addPage([W, H]);
        const scale = Math.min((cw - 2 * m) / e.width, (ch - 2 * m) / e.height);

        for (let i = 0; i < copies; i++) {
            const c = i % cols;
            const r = Math.floor(i / cols); // 0 = top row
            page.drawPage(e, {
                x: c * cw + (cw - e.width * scale) / 2,
                y: H - (r + 1) * ch + (ch - e.height * scale) / 2,
                xScale: scale,
                yScale: scale,
            });
        }
        if (guide) drawGuides(page, cols, rows);
    }

    return {
        bytes: await out.save(),
        inputPages: n,
        sides: n,
        paperSheets: n, // one sheet per original page
        blanks: 0,
    };
}

/* ---------- page ---------- */
const BookletPage = () => {
    const [mode, setMode] = useState<Mode>("booklet");
    const [sheet, setSheet] = useState<SheetSize>("A4");
    const [margin, setMargin] = useState(0);
    const [guide, setGuide] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<Result | null>(null);
    const [copies, setCopies] = useState<Copies>(2);
    const inputRef = useRef<HTMLInputElement>(null);
    const frameRef = useRef<HTMLIFrameElement>(null);

    // free blob URLs
    useEffect(() => {
        return () => {
            if (result) URL.revokeObjectURL(result.url);
        };
    }, [result]);

    // any setting change makes the old preview stale
    const touch = <T,>(setter: (v: T) => void) => (v: T) => {
        setter(v);
        setResult(null);
    };

    const pickFile = (f?: File | null) => {
        if (!f) return;
        setError("");
        if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
            return setError("শুধু পিডিএফ ফাইল দিন।");
        }
        if (f.size > MAX_SIZE) return setError("ফাইলটি ১০ এমবির বেশি বড়।");
        setFile(f);
        setResult(null);
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        pickFile(e.dataTransfer.files?.[0]);
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setError("");
        if (inputRef.current) inputRef.current.value = "";
    };

    const generate = async () => {
        if (!file) return;
        setLoading(true);
        setError("");
        try {
            const { bytes, ...stats } = await buildPdf(file, mode, sheet, margin, guide, copies);
            const url = URL.createObjectURL(
                new Blob([bytes as BlobPart], { type: "application/pdf" })
            );
            const base = file.name.replace(/\.pdf$/i, "");
            setResult({
                url,
                fileName: `${base}-${mode === "booklet" ? "booklet" : `${copies}-up`}.pdf`,
                ...stats,
            });
        } catch (e) {
            setError(
                e instanceof Error && e.message === "TOO_MANY_PAGES"
                    ? `সর্বোচ্চ ${bn(MAX_PAGES)} পাতার পিডিএফ দেওয়া যাবে।`
                    : "পিডিএফটি প্রসেস করা যায়নি। ফাইলটি ঠিক আছে কিনা দেখুন।"
            );
        } finally {
            setLoading(false);
        }
    };

    const download = () => {
        if (!result) return;
        const a = document.createElement("a");
        a.href = result.url;
        a.download = result.fileName;
        a.click();
    };

    const print = () => {
        try {
            frameRef.current?.contentWindow?.print();
        } catch {
            if (result) window.open(result.url, "_blank");
        }
    };

    const modes = [
        { id: "booklet" as const, label: "বুকলেট — ভাঁজ করা কাগজ", icon: BookOpen },
        { id: "twoUp" as const, label: "দুই পাতা এক কাগজে", icon: Columns2 },
    ];

    return (
        <main className="mx-auto w-full  p-4 lg:p-6">
            <header className="mb-5">
                <h1 className="font-heading text-2xl text-ink">বুকলেট ও মাল্টি-পেজ শিট</h1>
                <p className="mt-1 text-sm text-ink-soft">
                    প্রশ্নপত্রের পিডিএফ থেকে ভাঁজ করা বই বা এক কাগজে দুই পাতার ফাইল বানান।
                </p>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
                {/* ============ PREVIEW (center on large screens) ============ */}
                <section
                    className={cn(
                        "order-2 lg:order-1 flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border bg-card",
                        "lg:sticky lg:top-6 lg:h-[calc(100vh-7rem)]"
                    )}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                        <div className="min-w-0 text-sm">
                            {result ? (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-ink-soft">
                                    <span>
                                        মূল পাতা: <b className="text-ink">{bn(result.inputPages)}</b>
                                    </span>
                                    <span>
                                        আউটপুট পৃষ্ঠা: <b className="text-ink">{bn(result.sides)}</b>
                                    </span>
                                    <span>
                                        কাগজ: <b className="text-ink">{bn(result.paperSheets)}</b> পাতা
                                    </span>
                                    {result.blanks > 0 && (
                                        <span>
                                            ফাঁকা যোগ: <b className="text-ink">{bn(result.blanks)}</b>
                                        </span>
                                    )}
                                    <span>
                                        কাগজ: <b className="text-ink">{bn(result.paperSheets)}</b> পাতা
                                    </span>
                                </div>
                            ) : (
                                <span className="text-ink-soft">প্রিভিউ</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={print}
                                disabled={!result}
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-teal-tint disabled:pointer-events-none disabled:opacity-40"
                            >
                                <Printer className="size-4" /> প্রিন্ট
                            </button>
                            <button
                                onClick={download}
                                disabled={!result}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground transition hover:bg-teal-soft disabled:pointer-events-none disabled:opacity-40"
                            >
                                <Download className="size-4" /> ডাউনলোড
                            </button>
                        </div>
                    </div>

                    <div className="relative flex-1 bg-muted/60 p-3">
                        {result ? (
                            <iframe
                                ref={frameRef}
                                src={result.url}
                                title="পিডিএফ প্রিভিউ"
                                className="size-full rounded-lg border bg-white"
                            />
                        ) : (
                            <div className="flex size-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-ink-soft">
                                {loading ? (
                                    <>
                                        <Loader2 className="size-7 animate-spin text-primary" />
                                        বানানো হচ্ছে…
                                    </>
                                ) : (
                                    <>
                                        <FileText className="size-8 opacity-50" />
                                        বানানোর পর এখানে দেখা যাবে
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* ============ SETTINGS (right on large screens) ============ */}
                <aside className="order-1 lg:order-2 space-y-4">
                    <div className="space-y-4 rounded-2xl border bg-card p-4">
                        {/* mode */}
                        <div>
                            <p className="mb-2 text-sm text-ink">দুই পাতা এক কাগজে</p>
                            <div className="grid grid-cols-2 gap-2">
                                {modes.map(({ id, label, icon: Icon }) => {
                                    const active = mode === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => touch(setMode)(id)}
                                            className={cn(
                                                "flex items-center gap-2 rounded-xl border p-3 text-left text-xs leading-snug transition",
                                                active
                                                    ? "border-primary bg-teal-tint text-primary ring-1 ring-primary/30"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "grid size-4 shrink-0 place-items-center rounded-full border",
                                                    active && "border-primary bg-primary"
                                                )}
                                            >
                                                {active && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                                            </span>
                                            <Icon className="size-4 shrink-0" />
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* {mode === "twoUp" && (
                                <div className="flex items-center justify-between gap-3 mt-3 border rounded-lg bg-muted/60 p-3">
                                    <span className="text-ink">এক পৃষ্ঠা কতবার</span>
                                    <div className="flex overflow-hidden rounded-lg border bg-card">
                                        {COPIES.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => touch(setCopies)(c)}
                                                className={cn(
                                                    "px-3 py-1 text-xs transition",
                                                    copies === c ? "bg-primary text-primary-foreground" : "hover:bg-teal-tint"
                                                )}
                                            >
                                                {bn(c)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        </div>

                        {/* dropzone */}
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={onDrop}
                            className={cn(
                                "flex h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition",
                                dragging || file ? "border-primary bg-teal-tint/60" : "hover:bg-muted"
                            )}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept="application/pdf,.pdf"
                                className="hidden"
                                onChange={(e) => pickFile(e.target.files?.[0])}
                            />
                            {file ? (
                                <>
                                    <FileText className="size-9 text-primary" />
                                    <p className="line-clamp-2 break-all text-sm font-medium text-ink">{file.name}</p>
                                    <p className="text-xs text-ink-soft">{formatSize(file.size)}</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="size-8 text-ink-soft" />
                                    <p className="text-sm font-medium text-ink">
                                        পিডিএফ ফাইলটি এখানে টেনে আনুন, বা ক্লিক করে বেছে নিন। (A5 সাইজের পিডিএফ দিলে লেখা বড়সড় থাকবে। A4 দিলেও হবে, তবে লেখা ছোট হয়ে যাবে।)
                                    </p>

                                    <p className="text-xs text-ink-soft">
                                        শুধু পিডিএফ · সর্বোচ্চ {bn(10)} এমবি · {bn(MAX_PAGES)} পাতা
                                    </p>
                                </>
                            )}
                        </div>

                        {/* options */}
                        <div className="space-y-3 rounded-xl bg-muted/60 p-3 text-sm">
                            {/* <div className="flex items-center justify-between gap-3">
                                <span className="text-ink">কাগজের মাপ</span>
                                <div className="flex overflow-hidden rounded-lg border bg-card">
                                    {(["A4", "A3"] as const).map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => touch(setSheet)(s)}
                                            className={cn(
                                                "px-3 py-1 text-xs transition",
                                                sheet === s ? "bg-primary text-primary-foreground" : "hover:bg-teal-tint"
                                            )}
                                        >
                                            {s} {mode === "booklet" ? (s === "A4" ? "(→ A5)" : "(→ A4)") : ""}
                                        </button>
                                    ))}
                                </div>
                            </div> */}

                            <div>
                                <div className="mb-1 flex justify-between">
                                    <span className="text-ink">মার্জিন বৃদ্ধি</span>
                                    <span className="text-ink-soft">{bn(margin)} মিমি</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={20}
                                    value={margin}
                                    onChange={(e) => touch(setMargin)(Number(e.target.value))}
                                    className="w-full accent-teal"
                                />
                            </div>

                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={guide}
                                    onChange={(e) => touch(setGuide)(e.target.checked)}
                                    className="size-4 accent-teal"
                                />
                                <span className="text-ink">{mode === "booklet" ? "মাঝখানে ভাঁজের দাগ দেখান" : "কাটার দাগ দেখান"}</span>
                            </label>
                        </div>

                        {error && (
                            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {error}
                            </p>
                        )}

                        {/* actions */}
                        <div className="flex gap-2">
                            {file && (
                                <button
                                    onClick={reset}
                                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
                                >
                                    <RotateCcw className="size-4" /> আবার শুরু
                                </button>
                            )}
                            <button
                                onClick={generate}
                                disabled={!file || loading}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-teal-soft disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : mode === "booklet" ? (
                                    <BookOpen className="size-4" />
                                ) : (
                                    <Columns2 className="size-4" />
                                )}
                                পিডিএফ তৈরি করুন
                            </button>
                        </div>
                    </div>

                    {/* info */}
                    {false && <div className="rounded-2xl border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="grid size-8 place-items-center rounded-lg bg-teal-tint text-primary">
                                <Info className="size-4" />
                            </span>
                            <h2 className="font-heading text-sm text-ink">
                                প্রশ্নপত্রের পিডিএফ দিন, ভাঁজ করা বই বানিয়ে দিচ্ছি
                            </h2>
                        </div>
                        <ul className="space-y-2 text-xs leading-relaxed text-ink-soft [&>li]:flex [&>li]:gap-2 [&>li]:before:mt-1.5 [&>li]:before:size-1 [&>li]:before:shrink-0 [&>li]:before:rounded-full [&>li]:before:bg-primary">
                            <li>ডাউনলোড পেইজ থেকে প্রশ্নের পিডিএফ নামান, তারপর উপরে দিন।</li>
                            <li>
                                নামানোর সময় <b className="text-ink">কাগজ A5</b> বেছে নিলে লেখা বড়সড় থাকবে। A4 দিলেও
                                চলবে, তবে লেখা ছোট হয়ে যাবে।
                            </li>
                            <li>ভাঁজ করা বইয়ের পাতা সবসময় ৪, ৮, ১২ — এভাবেই হয়। কম পড়লে শেষে ফাঁকা পাতা জুড়ে দেওয়া হবে।</li>
                            <li>
                                <b className="text-ink">শুধু পিডিএফ</b>, সর্বোচ্চ ১০ এমবি আর ৫০ পাতা।
                            </li>
                        </ul>
                    </div>}
                </aside>
            </div>
        </main>
    );
};

export default BookletPage;