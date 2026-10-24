// hooks/useSelectionToolbar.ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useSelectionToolbar() {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafId = useRef<number | null>(null);
  const lastRectStr = useRef<string>("");

  const savedRangeRef = useRef<Range | null>(null);

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }

  function wrapSelection(
    styles: Partial<CSSStyleDeclaration>,
    savedRange: Range | null,
  ) {
    const sel = window.getSelection();
    if (!sel) return;
    if (savedRange) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
    if (sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement("span");
    Object.assign(span.style, styles);
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch {
      // selection crossed block boundaries in a way extractContents can't wrap cleanly — skip silently
    }
  }

  useEffect(() => {
    document.execCommand("styleWithCSS", false, "true"); // harmless even if unused now
  }, []);

  useEffect(() => {
    function computeRect(): DOMRect | null {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return null;

      const anchorNode = sel.anchorNode;
      const el =
        anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
      if (!el?.closest('[contenteditable="true"]')) return null;

      let r = sel.getRangeAt(0).getBoundingClientRect();
      if (r.width === 0 && r.height === 0 && r.top === 0 && r.left === 0) {
        const rects = sel.getRangeAt(0).getClientRects();
        r =
          rects[0] ??
          el.closest('[contenteditable="true"]')!.getBoundingClientRect();
      }
      return r;
    }

    function loop() {
      const r = computeRect();
      const str = r ? `${r.top},${r.left},${r.width},${r.height}` : "";
      if (str !== lastRectStr.current) {
        lastRectStr.current = str;
        setRect(r);
      }
      rafId.current = requestAnimationFrame(loop);
    }

    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return {
    rect,
    saveSelection,
    restoreSelection,
    savedRangeRef,
    wrapSelection,
  };
}
