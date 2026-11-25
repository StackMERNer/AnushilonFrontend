'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

type Q = {
    id: string;
    text: string;
    options?: string[];
    answer?: number;
};

type Anchor = {
    page: number;
    type: 'highlight' | 'region';
    rects: {
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
    quote: string | null;
    questions: Q[];
};

const PDF_URL = 'https://assets.proshnokosh.com/pdfs/sample2.pdf';

// Stable references so react-pdf doesn't reload the document on re-render.
const PDF_OPTIONS = {};
const LOADING_EL = <p>Loading PDF...</p>;
const ERROR_EL = <p>Failed to load PDF.</p>;

export default function Reader() {
    const [numPages, setNumPages] = useState(0);
    const [width, setWidth] = useState(700);
    const [renderWidth, setRenderWidth] = useState(700);
    const [pageRatio, setPageRatio] = useState(1.4142); // height / width, replaced by real value on load
    const [open, setOpen] = useState<Q[] | null>(null);
    const [anchors, setAnchors] = useState<Anchor[]>([]);

    // Debounce the width used for actual canvas rendering.
    // The wrapper resizes instantly; the canvas re-renders after the slider settles.
    useEffect(() => {
        const t = setTimeout(() => setRenderWidth(width), 200);
        return () => clearTimeout(t);
    }, [width]);

    // Load anchor data
    useEffect(() => {
        let cancelled = false;

        fetch('/demo.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load anchor data');
                return res.json();
            })
            .then(data => {
                if (cancelled) return;

                const out: Anchor[] = [];

                for (const p of data.pages) {
                    for (const a of p.anchors) {
                        const [ymin, xmin, ymax, xmax] = a.bbox;

                        out.push({
                            page: p.page,
                            type: a.type,
                            quote: a.quote,
                            questions: a.questions,
                            rects: [{
                                x: xmin / 1000,
                                y: ymin / 1000,
                                w: (xmax - xmin) / 1000,
                                h: (ymax - ymin) / 1000,
                            }],
                        });
                    }
                }

                setAnchors(out);
            })
            .catch(console.error);

        return () => {
            cancelled = true;
        };
    }, []);

    // Group anchors by page to avoid filtering repeatedly
    const anchorsByPage = useMemo(() => {
        const map = new Map<number, Anchor[]>();

        for (const anchor of anchors) {
            const existing = map.get(anchor.page) ?? [];
            existing.push(anchor);
            map.set(anchor.page, existing);
        }

        return map;
    }, [anchors]);

    console.log('inside');

    return (
        <div style={{ padding: 16, overflowAnchor: 'none' }}>
            <div style={{ marginBottom: 16 }}>
                <label>
                    Width: {width}px{' '}
                    <input
                        type="range"
                        min={300}
                        max={1000}
                        value={width}
                        onChange={e => setWidth(Number(e.target.value))}
                    />
                </label>
            </div>

            <div
                style={{
                    // Keeps total height stable even if <Document> briefly shows
                    // its loading/error state, so the scroll position isn't clamped to the top.
                    minHeight: numPages
                        ? numPages * (width * pageRatio + 32)
                        : undefined,
                }}
            >
                <Document
                    file={PDF_URL}
                    options={PDF_OPTIONS}
                    onLoadError={err => console.error('[Reader] Document load error', err)}
                    onSourceError={err => console.error('[Reader] Document source error', err)}
                    onLoadSuccess={async d => {
                        console.log('[Reader] Document loaded', d.numPages); // appearing repeatedly = it is reloading
                        setNumPages(d.numPages);
                        try {
                            // Use the real page size so placeholder height matches rendered height.
                            const page = await d.getPage(1);
                            const [x1, y1, x2, y2] = page.view;
                            const ratio = (y2 - y1) / (x2 - x1);
                            if (Number.isFinite(ratio) && ratio > 0) {
                                setPageRatio(ratio);
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                    loading={LOADING_EL}
                    error={ERROR_EL}
                >
                    {Array.from({ length: numPages }, (_, i) => {
                        const pageNo = i + 1;
                        const pageAnchors = anchorsByPage.get(pageNo) ?? [];

                        return (
                            <LazyPage
                                key={pageNo}
                                pageNo={pageNo}
                                width={width}
                                renderWidth={renderWidth}
                                ratio={pageRatio}
                            >
                                {pageAnchors.map((a, ai) =>
                                    a.rects.map((r, ri) => (
                                        <div
                                            key={`${ai}-${ri}`}
                                            style={{
                                                position: 'absolute',
                                                left: `${r.x * 100}%`,
                                                top: `${r.y * 100}%`,
                                                width: `${r.w * 100}%`,
                                                height: `${r.h * 100}%`,
                                                background:
                                                    a.type === 'highlight'
                                                        ? 'rgba(255, 220, 0, 0.35)'
                                                        : 'transparent',
                                                border:
                                                    a.type === 'region'
                                                        ? '2px dashed #e67e22'
                                                        : 'none',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            {ri === 0 && (
                                                <button
                                                    onClick={() => setOpen(a.questions)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: -10,
                                                        top: -10,
                                                        pointerEvents: 'auto',
                                                        borderRadius: 999,
                                                        background: '#e67e22',
                                                        color: '#fff',
                                                        width: 24,
                                                        height: 24,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {a.questions.length}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </LazyPage>
                        );
                    })}
                </Document>
            </div>

            {/* Question modal */}
            {open && (
                <div
                    onClick={() => setOpen(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,.5)',
                        display: 'grid',
                        placeItems: 'center',
                        zIndex: 1000,
                        padding: 16,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff',
                            padding: 24,
                            borderRadius: 12,
                            maxWidth: 600,
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <h3>Questions</h3>
                            <button onClick={() => setOpen(null)}>
                                ✕
                            </button>
                        </div>

                        <ul>
                            {open.map(q => (
                                <li
                                    className="text-gray-600"
                                    key={q.id}
                                    style={{ marginBottom: 12 }}
                                >
                                    {q.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}


// Lazy PDF page

const PAGE_LOADING = (
    <div
        style={{
            width: '100%',
            height: '100%',
            background: '#eee',
        }}
    />
);

function LazyPage({
    pageNo,
    width,
    renderWidth,
    ratio,
    children,
}: {
    pageNo: number;
    width: number;
    renderWidth: number;
    ratio: number;
    children?: React.ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(pageNo <= 2);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let mountTimer: ReturnType<typeof setTimeout> | undefined;
        let unmountTimer: ReturnType<typeof setTimeout> | undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Cancel any pending unmount, and mount only if the page
                    // stays near the viewport briefly (skips pages flown past).
                    clearTimeout(unmountTimer);
                    clearTimeout(mountTimer);
                    mountTimer = setTimeout(() => setShouldRender(true), 120);
                } else {
                    // Far from viewport: drop the canvas to free memory.
                    // The wrapper keeps its fixed height, so layout doesn't move.
                    clearTimeout(mountTimer);
                    clearTimeout(unmountTimer);
                    unmountTimer = setTimeout(() => setShouldRender(false), 500);
                }
            },
            {
                rootMargin: '1000px 0px',
            }
        );

        observer.observe(element);

        return () => {
            clearTimeout(mountTimer);
            clearTimeout(unmountTimer);
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={ref}
            style={{
                position: 'relative',
                width,
                height: width * ratio, // fixed: inner Page can't change layout
                margin: '16px auto',
                overflow: 'hidden',
                background: '#fff',
            }}
        >
            {shouldRender && (
                <>
                    <Page
                        pageNumber={pageNo}
                        width={renderWidth}
                        devicePixelRatio={Math.min(
                            1.5,
                            typeof window !== 'undefined'
                                ? window.devicePixelRatio || 1
                                : 1
                        )}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={PAGE_LOADING}
                    />

                    {children}
                </>
            )}
        </div>
    );
}