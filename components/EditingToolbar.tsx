// components/EditingToolbar.tsx
"use client";
import { useSelectionToolbar } from "@/hooks/useSelectionToolbar";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Minus, Plus, Underline } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FONT_STEP = 2;
const FONT_MIN = 8;
const FONT_MAX = 72;
const MARGIN = 8;

export default function EditingToolbar() {
    const { rect, saveSelection, restoreSelection, savedRangeRef, wrapSelection } = useSelectionToolbar();
    const [fontSize, setFontSize] = useState(16);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

    useLayoutEffect(() => {
        if (!rect || !toolbarRef.current) {
            setPos(null);
            return;
        }

        const computePosition = () => {
            if (!rect || !toolbarRef.current) return;
            const el = toolbarRef.current;
            const { width, height } = el.getBoundingClientRect();

            const vv = typeof window !== "undefined" ? window.visualViewport : null;
            const viewportWidth = vv?.width ?? window.innerWidth;
            const viewportHeight = vv?.height ?? window.innerHeight;
            const viewportPageLeft = vv?.pageLeft ?? window.scrollX;
            const viewportPageTop = vv?.pageTop ?? window.scrollY;

            // Absolute positioning relative to document body:
            const absoluteRectTop = rect.top + window.scrollY;
            const absoluteRectBottom = rect.bottom + window.scrollY;
            const absoluteRectLeft = rect.left + window.scrollX;

            // Preferred position: Above selection
            let top = absoluteRectTop - height - 10;

            // Bounds relative to active visual viewport top/bottom
            const minAllowedTop = viewportPageTop + MARGIN;
            const maxAllowedTop = viewportPageTop + viewportHeight - height - MARGIN;

            // If clipped at top, flip below selection
            if (top < minAllowedTop) {
                top = absoluteRectBottom + 10;
            }

            // Clamp vertically within visible viewport
            top = Math.min(Math.max(top, minAllowedTop), maxAllowedTop);

            // Horizontal centering & clamping
            let left = absoluteRectLeft + rect.width / 2 - width / 2;
            const minAllowedLeft = viewportPageLeft + MARGIN;
            const maxAllowedLeft = viewportPageLeft + viewportWidth - width - MARGIN;

            left = Math.min(Math.max(left, minAllowedLeft), maxAllowedLeft);

            setPos({ top, left });
        };

        computePosition();

        const vv = window.visualViewport;
        if (vv) {
            vv.addEventListener("resize", computePosition);
            vv.addEventListener("scroll", computePosition);
        }

        return () => {
            if (vv) {
                vv.removeEventListener("resize", computePosition);
                vv.removeEventListener("scroll", computePosition);
            }
        };
    }, [rect]);

    if (!rect) return null;

    const exec = (cmd: string, value?: string) => {
        restoreSelection();
        document.execCommand(cmd, false, value);
    };

    const wrap = (styles: Partial<CSSStyleDeclaration>) => {
        wrapSelection(styles, savedRangeRef.current);
    };

    const bumpFontSize = (delta: number) => {
        const next = Math.min(FONT_MAX, Math.max(FONT_MIN, fontSize + delta));
        setFontSize(next);
        wrap({ fontSize: `${next}px` });
    };

    return createPortal(
        <div
            ref={toolbarRef}
            className="absolute z-[9999] flex items-center gap-0.5 rounded-xl bg-white px-2 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 print:hidden max-w-[calc(100vw-16px)] overflow-x-auto touch-pan-x"
            style={{
                top: pos ? `${pos.top}px` : "-9999px",
                left: pos ? `${pos.left}px` : "-9999px",
                visibility: pos ? "visible" : "hidden",
            }}
            onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
            }}
            onTouchStart={(e) => {
                // Prevent iOS focus loss on touch
                saveSelection();
            }}
        >
            <ToolbarBtn onClick={() => exec("bold")}><Bold size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("italic")}><Italic size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("underline")}><Underline size={15} /></ToolbarBtn>

            <Divider />

            <ToolbarBtn onClick={() => exec("justifyLeft")}><AlignLeft size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("justifyCenter")}><AlignCenter size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec("justifyRight")}><AlignRight size={15} /></ToolbarBtn>

            <Divider />

            <ToolbarBtn onClick={() => bumpFontSize(-FONT_STEP)}><Minus size={13} /></ToolbarBtn>
            <span className="w-6 text-center text-xs font-medium text-gray-700 tabular-nums select-none shrink-0">
                {fontSize}
            </span>
            <ToolbarBtn onClick={() => bumpFontSize(FONT_STEP)}><Plus size={13} /></ToolbarBtn>
        </div>,
        document.body
    );
}

function ToolbarBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 shrink-0 transition-colors"
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />;
}