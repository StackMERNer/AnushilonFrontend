"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

interface PaperTextItemProps {
    content: string;
    isEditingMode?: boolean;
}

export default function PaperTextItem({
    content,
    isEditingMode = false,
}: PaperTextItemProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [html, setHtml] = useState(content || "");

    useEffect(() => {
        if (!isEditingMode) return;
        if (!editorRef.current) return;
        if (editorRef.current.innerHTML !== html) {
            editorRef.current.innerHTML = html;
        }
    }, [isEditingMode, html]);

    const handleInput = () => {
        if (!editorRef.current) return;

        setHtml(editorRef.current.innerHTML);
    };

    const hasText = stripHtml(html).trim();

    // Print / preview mode
    if (!isEditingMode) {
        if (!stripHtml(html)) return null;

        return (
            <div
                className="font-bold text-center"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }

    // Editing mode
    return (
        <div className={clsx("relative min-h-6 pb-2 print:pb-0", !hasText && "print:min-h-0")}>
            {!hasText && (
                <span className="absolute inset-x-0 top-0 pointer-events-none text-center text-gray-500 print:hidden border border-dashed border-gray-300 rounded-md py-0.5">
                    টেক্সট যুক্ত করুন
                </span>
            )}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                className={clsx(
                    "min-h-6 text-center font-bold outline-none my-1",
                    !hasText && "print:hidden print:my-0 print:min-h-0"
                )}
            />
        </div>
    );
}

function stripHtml(html: string) {
    if (!html) return "";

    const div = document.createElement("div");
    div.innerHTML = html;

    return div.textContent || "";
}