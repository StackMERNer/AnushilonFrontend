import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import MathJaxProvider from "@/components/providers/MathJaxProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-bengali",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anushilon.net"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "অনুশীলন (Anushilon) — সফলতার নির্ভরযোগ্য সূত্র",
    template: "%s | অনুশীলন",
  },
  description:
    "অনুশীলন (Anushilon) — SSC, HSC and Admission Preparation Platform",
  applicationName: "Proshnokosh",
  openGraph: {
    title: "অনুশীলন (Anushilon) — সফলতার নির্ভরযোগ্য সূত্র",
    description:
      "অনুশীলন (Anushilon) — SSC, HSC and Admission Preparation Platform",
    url: "https://anushilon.net",
    siteName: "অনুশীলন | Anushilon",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "অনুশীলন (Anushilon)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "অনুশীলন (Anushilon) — সফলতার নির্ভরযোগ্য সূত্র ",
    description:
      "অনুশীলন (Anushilon) — SSC, HSC and Admission Preparation Platform",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://anushilon.net/#org",
      name: "অনুশীলন",
      alternateName: ["Anushilon"],
      url: "https://anushilon.net",
      logo: "https://anushilon.net/logo.svg",
      sameAs: ["https://www.facebook.com/anushilon/"],
    },
    {
      "@type": "WebSite",
      "@id": "https://anushilon.net/#site",
      name: "অনুশীলন",
      alternateName: "Proshnokosh",
      url: "https://anushilon.net",
      inLanguage: "bn",
      publisher: { "@id": "https://anushilon.net/#org" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        notoSerifBengali.variable
      )}
      suppressHydrationWarning
      suppressContentEditableWarning={true}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-bengali">
        <AuthProvider>
          <AuthSessionProvider>
            <QueryProvider>
              <MathJaxProvider>
                <Toaster position="top-center" richColors />
                {children}
              </MathJaxProvider>
            </QueryProvider>
          </AuthSessionProvider>
        </AuthProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}