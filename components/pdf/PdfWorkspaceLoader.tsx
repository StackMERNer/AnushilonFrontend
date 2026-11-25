"use client";
import { useEffect, useState, type ComponentType } from "react";
import type { IPdfAnchor } from "@/services/pdf.service";

type Props = { title: string; fileUrl: string; versionId: string; bookId?: string; initialAnchors: IPdfAnchor[] };

export default function PdfWorkspaceLoader(props: Props) {
    const [Comp, setComp] = useState<ComponentType<Props> | null>(null);

    useEffect(() => {
        let alive = true;
        import("@/components/pdf/PdfWorkspace").then(m => { if (alive) setComp(() => m.default); });
        return () => { alive = false; };
    }, []);

    if (!Comp) return <p style={{ padding: 16 }}>Loading...</p>;
    return <Comp {...props} />;
}