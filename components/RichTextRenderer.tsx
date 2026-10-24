"use client";

import { useEffect, useRef } from "react";

interface RichTextRendererProps {
    content: string;
    className?: string;
    editableProps?: {
        contentEditable?: boolean;
        suppressContentEditableWarning?: boolean;
    };
}

export default function RichTextRenderer({
    content,
    className = "",
    editableProps,
}: RichTextRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = content;
        }
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={`editable ${className}`.trim()}
            spellCheck="false"
            {...editableProps}
        />
    );
}