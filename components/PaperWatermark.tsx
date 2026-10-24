import { PrintSettings } from "@/types/print-settings";
import Image from "next/image";

function escapeXml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildWatermarkTile({
    text,
    iconDataUrl,
    size,
    opacity,
}: {
    text?: string;
    iconDataUrl?: string;
    size: number;
    opacity: number;
}) {
    const tile = Math.round(size * 4);
    const cx = tile / 2;
    const cy = tile / 2;
    const alpha = (opacity / 100).toFixed(2);

    const icon = iconDataUrl
        ? `<image href="${iconDataUrl}" x="${cx - size / 2}" y="${cy - size - 10}" width="${size}" height="${size}" opacity="${alpha}" />`
        : "";

    // RGBA rendering
    const label = text
        ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
             font-size="${size * 0.32}" font-weight="700" fill="rgba(120, 120, 120, ${alpha})"
             transform="rotate(-35 ${cx} ${cy})">${escapeXml(text)}</text>`
        : "";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">${icon}${label}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export default function PaperWatermark({ branding }: { branding: PrintSettings["branding"] }) {
    if (!branding.enabled) return null;
    if (!branding.watermarkText && !branding.watermarkIconUrl) return null;

    const responsiveSize = `clamp(${Math.max(28, branding.size * 0.5)}px, ${branding.size * 0.12}vw, ${branding.size}px)`;
    const printTilePx = Math.round(branding.size * 4);

    // 1. REPEAT WATERMARK
    if (branding.repeat) {
        return (
            <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-0 -z-10 overflow-hidden"
                style={{
                    backgroundImage: buildWatermarkTile({
                        text: branding.watermarkText,
                        iconDataUrl: branding.watermarkIconUrl,
                        size: branding.size,
                        opacity: branding.opacity,
                    }),
                    backgroundRepeat: "repeat",
                    backgroundSize: `calc(${responsiveSize} * 4) calc(${responsiveSize} * 4)`,
                }}
            >
                {/* CSS Variable injected for clean print rendering without decimal px rounding issue */}
                <style jsx>{`
                    @media print {
                        div {
                            background-size: ${printTilePx}px ${printTilePx}px !important;
                        }
                    }
                `}</style>
            </div>
        );
    }

    // 2. SINGLE WATERMARK
    return (
        <div
            aria-hidden="true"
            // print:fixed রাখা হয়েছে যাতে বহুপৃষ্ঠার প্রশ্নপত্রে প্রতি পেজের মাঝে ১টি করে জলছাপ থাকে
            className="pointer-events-none select-none absolute inset-0 print:fixed print:inset-0 -z-10 flex items-center justify-center overflow-hidden"
        >
            <div
                className="flex flex-col items-center justify-center gap-2 max-w-[90%]"
                style={{ opacity: branding.opacity / 100, transform: "rotate(-35deg)" }}
            >
                {branding.watermarkIconUrl && (
                    <Image
                        src={branding.watermarkIconUrl}
                        alt=""
                        width={branding.size}
                        height={branding.size}
                        className="object-contain"
                        style={{ width: responsiveSize, height: responsiveSize }}
                    />
                )}
                {branding.watermarkText && (
                    <span
                        className="font-bold text-neutral-500 text-center wrap-break-word"
                        style={{ fontSize: responsiveSize }}
                    >
                        {branding.watermarkText}
                    </span>
                )}
            </div>
        </div>
    );
}