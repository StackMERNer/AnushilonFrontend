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
  metadataBase: new URL("https://proshnokosh.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "প্রশ্নকোষ (Proshnokosh) — মিনিটেই নিখুঁত প্রশ্নপত্র",
    template: "%s | প্রশ্নকোষ",
  },
  description:
    "প্রশ্নকোষ (Proshnokosh) — শিক্ষকদের জন্য ডিজিটাল প্রশ্নপত্র তৈরির প্ল্যাটফর্ম। মিনিটেই তৈরী করুন নিখুঁত প্রশ্নপত্র।",
  applicationName: "Proshnokosh",
  openGraph: {
    title: "প্রশ্নকোষ (Proshnokosh) — মিনিটেই নিখুঁত প্রশ্নপত্র",
    description:
      "প্রশ্নকোষ (Proshnokosh) — শিক্ষকদের জন্য ডিজিটাল প্রশ্নপত্র তৈরির প্ল্যাটফর্ম। মিনিটেই তৈরী করুন নিখুঁত প্রশ্নপত্র।",
    url: "https://proshnokosh.com",
    siteName: "প্রশ্নকোষ | Proshnokosh",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "প্রশ্নকোষ (Proshnokosh)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "প্রশ্নকোষ (Proshnokosh) — মিনিটেই নিখুঁত প্রশ্নপত্র",
    description:
      "প্রশ্নকোষ (Proshnokosh) — শিক্ষকদের জন্য ডিজিটাল প্রশ্নপত্র তৈরির প্ল্যাটফর্ম। মিনিটেই তৈরী করুন নিখুঁত প্রশ্নপত্র।",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://proshnokosh.com/#org",
      name: "প্রশ্নকোষ",
      alternateName: ["Proshnokosh"],
      url: "https://proshnokosh.com",
      logo: "https://proshnokosh.com/logo.svg",
      sameAs: ["https://www.facebook.com/proshnokosh/"],
    },
    {
      "@type": "WebSite",
      "@id": "https://proshnokosh.com/#site",
      name: "প্রশ্নকোষ",
      alternateName: "Proshnokosh",
      url: "https://proshnokosh.com",
      inLanguage: "bn",
      publisher: { "@id": "https://proshnokosh.com/#org" },
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