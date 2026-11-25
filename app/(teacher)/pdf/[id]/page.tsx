import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/api-server";
import { createPdfService } from "@/services/pdf.service";
import PdfWorkspaceLoader from "@/components/pdf/PdfWorkspaceLoader";

export default async function PdfPage({ params, searchParams }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ export?: string }>;
}) {
    const { id } = await params;
    const sp = await searchParams;
    const service = createPdfService(createServerApiClient());

    let book;
    try { book = await service.getBook(id); } catch { notFound(); }
    const anchors = await service.getAnchors(book.version._id);

    return (
        <PdfWorkspaceLoader
            title={book.title}
            fileUrl={book.version.fileUrl}
            versionId={book.version._id}
            bookId={book._id}
            initialAnchors={anchors}
        />
    );
}