import Logo from "@/components/Logo";
import { PressableButton } from "@/components/ui/pressable-button";
import { Metadata } from "next";
import Link from "next/link";
import PlansContent from "../(teacher)/plans/_components/PlansContent";
const ogImage = {
    url: "/og.png", // resolved against metadataBase
    width: 1200,
    height: 630,
    alt: "অনুশীলন (Anushilon)",
};

export const metadata: Metadata = {
    title: { absolute: "অনুশীলন (Anushilon) — ৬ষ্ঠ থেকে ১০ম শ্রেণির প্রশ্নপত্র তৈরি" },
    description:
        "অনুশীলন (Anushilon) বাংলাদেশের স্কুল শিক্ষকদের জন্য অনলাইনে প্রশ্নপত্র তৈরির প্ল্যাটফর্ম। ৬ষ্ঠ থেকে ১০ম শ্রেণির বিভিন্ন বিষয়ের MCQ, সৃজনশীল ও সংক্ষিপ্ত প্রশ্ন বেছে নিয়ে কয়েক মিনিটেই প্রশ্নপত্র তৈরি করুন এবং প্রিন্ট-রেডি PDF ডাউনলোড করুন।",
    applicationName: "Proshnokosh",
    keywords: [
        "অনুশীলন",
        "Proshnokosh",

        "প্রশ্নপত্র তৈরি",
        "অনলাইনে প্রশ্নপত্র তৈরি",
        "প্রশ্নপত্র তৈরির সফটওয়্যার",
        "প্রশ্নপত্র বানানোর সফটওয়্যার",
        "স্কুল পরীক্ষার প্রশ্নপত্র",
        "স্কুলের প্রশ্নপত্র তৈরি",
        "শিক্ষকদের প্রশ্নপত্র তৈরি",

        "প্রশ্ন ব্যাংক",
        "ডিজিটাল প্রশ্ন ব্যাংক",
        "MCQ প্রশ্ন",
        "সৃজনশীল প্রশ্ন",
        "সংক্ষিপ্ত প্রশ্ন",
        "প্রশ্নপত্র PDF",

        "৬ষ্ঠ থেকে ১০ম শ্রেণির প্রশ্নপত্র",
        "৬ষ্ঠ শ্রেণির প্রশ্ন",
        "সপ্তম শ্রেণির প্রশ্ন",
        "অষ্টম শ্রেণির প্রশ্ন",
        "নবম শ্রেণির প্রশ্ন",
        "দশম শ্রেণির প্রশ্ন",

        "SSC প্রশ্ন",
        "SSC গণিত প্রশ্ন",
        "SSC প্রশ্নপত্র",

        "Bangla question paper maker",
        "question paper maker Bangladesh",
    ],

    authors: [{ name: "অনুশীলন" }],
    creator: "অনুশীলন",
    publisher: "অনুশীলন",

    openGraph: {
        title: "অনুশীলন (Anushilon) — সফলতার নির্ভরযোগ্য সূত্র ",
        description:
            "প্রশ্ন ব্যাংক থেকে প্রশ্ন বেছে নিয়ে সহজেই প্রশ্নপত্র তৈরি করুন এবং প্রিন্ট-রেডি PDF ডাউনলোড করুন।",
        url: "https://anushilon.net",
        siteName: "Proshnokosh | অনুশীলন",
        locale: "bn_BD",
        type: "website",
        images: [ogImage],
    },

    twitter: {
        card: "summary_large_image",
        title: "Proshnokosh । অনুশীলন — সফলতার নির্ভরযোগ্য সূত্র ",
        description:
            "শিক্ষকদের জন্য সহজ ডিজিটাল প্রশ্নপত্র তৈরির প্ল্যাটফর্ম।",
        images: ["/og.png"],
    },

    alternates: {
        canonical: "https://anushilon.net",
    },

    robots: {
        index: true,
        follow: true,
    },
};
const MarketingPage = () => {
    const faqs = [
        {
            question: "অনুশীলন (Anushilon) কী?",
            answer: "অনুশীলন হলো শিক্ষকদের জন্য একটি ডিজিটাল প্রশ্নপত্র তৈরির প্ল্যাটফর্ম। বিভিন্ন বিষয়, অধ্যায় ও প্রশ্নের ধরন অনুযায়ী প্রশ্ন বেছে নিয়ে কয়েক মিনিটেই সম্পূর্ণ প্রশ্নপত্র তৈরি করা যায়।"
        },
        {
            question: "অনুশীলন দিয়ে কী ধরনের প্রশ্নপত্র তৈরি করা যায়?",
            answer: "MCQ, সৃজনশীল ও সংক্ষিপ্ত প্রশ্নসহ বিভিন্ন ধরনের প্রশ্ন নিয়ে প্রশ্নপত্র তৈরি করা যায়। প্রশ্নের ক্রম, নম্বর এবং অন্যান্য প্রয়োজনীয় বিষয় নিজের মতো করে সাজানো যায়।"
        },
        {
            question: "প্রশ্নগুলো কোথা থেকে পাব?",
            answer: "অনুশীলনের প্রশ্ন ব্যাংক থেকেই বিষয়, অধ্যায়, শ্রেণি এবং অন্যান্য ফিল্টার ব্যবহার করে প্রয়োজনীয় প্রশ্ন খুঁজে নিতে পারবেন।"
        },
        {
            question: "প্রশ্নপত্র তৈরি করতে কত সময় লাগে?",
            answer: "প্রয়োজনীয় প্রশ্নগুলো বেছে নেওয়ার পর কয়েক মিনিটের মধ্যেই প্রশ্নপত্র তৈরি করা যায়। লেআউট ও ফরম্যাটিং স্বয়ংক্রিয়ভাবে সাজানো হওয়ায় আলাদাভাবে অনেক সময় দিতে হয় না।"
        },
        {
            question: "তৈরি করা প্রশ্নপত্র কি PDF হিসেবে ডাউনলোড করা যাবে?",
            answer: "হ্যাঁ। প্রশ্নপত্র তৈরি হয়ে গেলে প্রিন্ট-রেডি PDF হিসেবে ডাউনলোড করে সরাসরি প্রিন্ট করতে পারবেন।"
        },
        {
            question: "অনুশীলন ব্যবহার করতে কি কোনো সফটওয়্যার ইনস্টল করতে হবে?",
            answer: "না। অনুশীলন একটি ওয়েবভিত্তিক প্ল্যাটফর্ম। আপনার ব্রাউজার থেকেই ব্যবহার করতে পারবেন।"
        },
        {
            question: "আমি কি নিজের মতো করে প্রশ্নপত্র সাজাতে পারব?",
            answer: "হ্যাঁ। প্রশ্ন বেছে নেওয়া, প্রশ্নের ক্রম পরিবর্তন, প্রশ্নের ধরন ও নম্বর নির্ধারণসহ বিভিন্নভাবে প্রশ্নপত্র নিজের প্রয়োজন অনুযায়ী সাজাতে পারবেন।"
        }
    ];
    return (
        <main className="min-h-screen bg-background text-foreground antialiased selection:bg-teal-tint selection:text-teal">
            {/* Top Banner / Reviews pill above main nav or content */}
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6  lg:px-10 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="flex items-center gap-3">
                    <Logo />
                    <div>
                        <div className="font-li-shohid text-[28px] leading-none text-primary">
                            অনুশীলন
                        </div>
                        <div className="mt-1 text-[11px] tracking-wide text-muted-foreground">
                            সফলতার নির্ভরযোগ্য সূত্র
                        </div>
                    </div>
                </div>

                {/* Center Nav Links (Inspired by Scenekit Layout) */}
                <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
                    <Link href="#features" className="transition hover:text-foreground">
                        ফিচারসমূহ
                    </Link>
                    <Link href="#kaj-kore" className="transition hover:text-foreground">
                        কীভাবে কাজ করে
                    </Link>
                    <Link href="#pricing" className="transition hover:text-foreground">
                        মূল্য তালিকা
                    </Link>
                    <Link href="#faq" className="transition hover:text-foreground">
                        জিজ্ঞাসা
                    </Link>
                </div>

                {/* Right CTA Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/login?redirect=true"
                        className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted"
                    >
                        লগ ইন
                    </Link>

                    <PressableButton
                        href="/login?redirect=true"
                        size={'lg'}
                        className="hidden md:inline-flex"
                    >
                        শুরু করুন
                    </PressableButton>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden px-6 pb-20 pt-10 text-center lg:px-10 lg:pt-14">
                <div className="mx-auto max-w-4xl">
                    {/* Rating / Social Proof Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm">
                        <div className="flex -space-x-1.5">
                            <span className="inline-block h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-card" />
                            <span className="inline-block h-5 w-5 rounded-full bg-teal-500 ring-2 ring-card" />
                            <span className="inline-block h-5 w-5 rounded-full bg-amber-500 ring-2 ring-card" />
                        </div>
                        <span className="text-xs text-amber-500 font-semibold">★ 4.9/5</span>
                        <span className="text-xs text-muted-foreground">
                            (বাংলাদেশের শিক্ষকদের পছন্দের)
                        </span>
                    </div>

                    {/* Centered Main Headline */}
                    <h1 className="mt-8 font-tiro text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                        যে প্রশ্নপত্র তৈরিতে আগে সারাদিন লাগত, <br className="hidden sm:inline" />
                        এখন লাগে মাত্র ১০ মিনিট।
                    </h1>

                    {/* Subheading */}
                    <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg sm:leading-8">
                        লক্ষাধিক প্রশ্ন থেকে বিষয় ও অধ্যায় অনুযায়ী MCQ ও সৃজনশীল প্রশ্ন বেছে নিন,
                        সাজান নিজের মতো করে, আর নামিয়ে নিন প্রিন্ট-রেডি প্রশ্নপত্র — PDF আকারে।
                    </p>

                    {/* Primary CTA Button */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <PressableButton
                            href="/login?redirect=true"
                            className="mt-5"
                            size={'lg'}
                        >
                            ফ্রি শুরু করুন
                        </PressableButton>
                    </div>
                </div>

                {/* 3-Column Preview Cards (Scenekit Showcase Style) */}
                <div className="mx-auto mt-16 max-w-6xl">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Left Card - Question Bank Selector */}
                        <div className="group relative rounded-2xl border border-border bg-card p-5 text-left shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                <span className="font-medium text-foreground">১. বিষয় ও অধ্যায় নির্বাচন</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {["বাংলা ১ম পত্র", "গদ্য", "সৃজনশীল"].map((tag, i) => (
                                    <span
                                        key={tag}
                                        className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${i === 0
                                            ? "bg-teal-tint text-teal"
                                            : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 space-y-2">
                                {[
                                    "‘আম আঁটির ভেঁপু’ গল্পের মূল বিষয়বস্তু...",
                                    "লেখকের ভাষারীতির বৈশিষ্ট্য ব্যাখ্যা...",
                                    "গল্পটির শিক্ষণীয় দিক তুলে ধর...",
                                ].map((q, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 rounded-lg border border-border bg-background p-2 text-xs text-muted-foreground"
                                    >
                                        <input type="checkbox" defaultChecked className="rounded accent-primary" />
                                        <span className="truncate">{q}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Middle Card - Animated Paper View (Featured) */}
                        <div className="group relative rounded-2xl border-2 border-primary/30 bg-card p-6 text-left shadow-2xl transition hover:-translate-y-1">
                            <div className="mb-4 flex items-center justify-between rounded-lg bg-teal-tint px-3 py-2 text-xs text-teal font-medium">
                                <span>২. অটোমেটিক সাজান</span>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-4 text-center text-xs">
                                <p className="text-[10px] text-muted-foreground">নির্বাচনী পরীক্ষা — ২০২৬</p>
                                <h3 className="mt-1 font-tiro text-base font-bold text-foreground">বাংলা ১ম পত্র</h3>
                                <div className="mt-2 flex justify-center gap-3 text-[10px] text-muted-foreground">
                                    <span>সময়: ২ ঘণ্টা</span>
                                    <span>পূর্ণমান: ৫০</span>
                                </div>

                                <div className="my-3 h-px bg-border" />

                                <div className="text-left text-[11px]">
                                    <p className="font-semibold text-foreground">ক বিভাগ — বহুনির্বাচনী</p>
                                    <p className="mt-1 text-muted-foreground">১. ‘সোনার তরী’ কবিতাটি কোন...</p>
                                    <div className="mt-1.5 grid grid-cols-2 gap-1 text-[9.5px] text-muted-foreground">
                                        <span className="text-teal font-medium">✓ (ক) সোনার তরী</span>
                                        <span>(খ) খেয়া</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Card - Export & Download */}
                        <div className="group relative rounded-2xl border border-border bg-card p-5 text-left shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="font-medium text-foreground">৩. PDF ডাউনলোড</span>
                            </div>

                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal">
                                    📄
                                </div>
                                <h4 className="mt-3 font-tiro text-sm font-semibold">প্রিন্ট-রেডি PDF</h4>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    ১-ক্লিকেই ডাউনলোড করে সরাসরি প্রিন্ট করুন
                                </p>
                                <button className="mt-4 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
                                    PDF ডাউনলোড করুন
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Spotlight / Stats */}
            <section id="features" className="border-t border-border bg-muted/30 py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-10">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <p className="font-tiro text-3xl font-bold text-teal">১০০+</p>
                            <p className="mt-2 text-sm text-muted-foreground">বিষয়ের প্রশ্ন ব্যাংক</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <p className="font-tiro text-3xl font-bold text-teal">বহুনির্বাচনি, সৃজনশীল, সংক্ষিপ্ত</p>
                            <p className="mt-2 text-sm text-muted-foreground">সকল ধরনের প্রশ্নই সহজলভ্য</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <p className="font-tiro text-3xl font-bold text-teal">১ ক্লিকে</p>
                            <p className="mt-2 text-sm text-muted-foreground">প্রিন্ট-রেডি PDF তৈরি</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="kaj-kore" className="border-t border-border py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-10">
                    <div className="text-center">
                        <h2 className="font-tiro text-3xl font-bold sm:text-4xl">
                            তিনটি সহজ ধাপে সম্পূর্ণ প্রশ্নপত্র
                        </h2>
                        <p className="mt-3 text-sm text-muted-foreground">
                            কোনো জটিল ফরম্যাটিং ছাড়াই মাত্র কয়েক মিনিটেই প্রশ্নপত্র সাজান
                        </p>
                    </div>

                    <div className="mt-14 grid gap-8 sm:grid-cols-3">
                        {[
                            {
                                n: "১",
                                title: "বিষয় ও অধ্যায় বাছাই করুন",
                                text: "আপনার প্রশ্ন ব্যাংক থেকে শ্রেণি, বিষয় ও অধ্যায় অনুযায়ী প্রশ্ন খুঁজে বের করুন।",
                            },
                            {
                                n: "২",
                                title: "প্রশ্নপত্র সাজান",
                                text: "MCQ ও সৃজনশীল প্রশ্ন যোগ করুন, নম্বর ঠিক করুন, ক্রম বদলান — টেনে-এনে।",
                            },
                            {
                                n: "৩",
                                title: "প্রিন্ট বা ডাউনলোড করুন",
                                text: "একটি ক্লিকেই প্রিন্ট-রেডি লেআউটে PDF হিসেবে নামিয়ে নিন।",
                            },
                        ].map((step) => (
                            <div key={step.n} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal font-tiro text-base font-semibold text-teal">
                                    {step.n}
                                </div>
                                <h3 className="mt-4 font-tiro text-lg font-semibold">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pricing" className="border-t border-border py-20">
                <h2 className="font-tiro text-3xl font-bold sm:text-4xl text-center mb-6">মূল্য তালিকা</h2>
                <div className="mx-auto max-w-7xl px-6 lg:px-10">

                    <PlansContent /></div>
            </section>

            {/* Before / After Comparison */}
            <section className="border-t border-border bg-muted/30 py-20">
                <div className="mx-auto max-w-5xl px-6 lg:px-10">
                    <h2 className="text-center font-tiro text-2xl font-bold sm:text-3xl">
                        Word-এ যা কষ্টের, অনুশীলনে তা এক মিনিটের
                    </h2>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">এমএস ওয়ার্ড-এ (আগে)</p>
                            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">❌ প্রতিবার টেবিল ও ফরম্যাটিং হাতে ঠিক করা</li>
                                <li className="flex items-center gap-2">❌ পুরনো প্রশ্নপত্র খুঁজে বের করে কপি-পেস্ট করা</li>
                                <li className="flex items-center gap-2">❌ নম্বর যোগ-বিয়োগ হাতে মিলিয়ে দেখা</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-(--teal)/40 bg-(--teal-tint)/20 p-6 shadow-sm">
                            <p className="text-xs font-semibold text-teal uppercase tracking-wider">অনুশীলনে (এখন)</p>
                            <ul className="mt-4 space-y-3 text-sm text-foreground">
                                <li className="flex items-center gap-2">✓ একবার সাজালেই লেআউট নিজে থেকে ঠিক হয়ে যায়</li>
                                <li className="flex items-center gap-2">✓ প্রশ্ন ব্যাংক থেকে খুঁজে সরাসরি যোগ করা যায়</li>
                                <li className="flex items-center gap-2">✓ মোট নম্বর নিজে থেকেই যোগ হয়ে দেখায়</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="border-t border-border py-20">
                <div className="mx-auto max-w-3xl px-6 lg:px-10">
                    <div className="text-center">
                        <h2 className="font-tiro text-3xl font-bold sm:text-4xl">
                            সচরাচর জিজ্ঞাসা
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            অনুশীলন ব্যবহার সম্পর্কে সাধারণ কিছু প্রশ্নের উত্তর
                        </p>
                    </div>

                    <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                        {faqs.map((faq, index) => (
                            <details
                                key={index}
                                className="group px-5 transition-colors hover:bg-muted/30 sm:px-6"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-tiro text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                                    <span>{faq.question}</span>
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-lg font-normal text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                                        +
                                    </span>
                                </summary>
                                <div className="pb-5 pr-10 text-sm leading-7 text-muted-foreground">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Call To Action */}
            <section className="border-t border-border py-20 text-center">
                <div className="mx-auto max-w-3xl px-6 lg:px-10">
                    <h2 className="font-tiro text-3xl font-bold sm:text-4xl">
                        আজই আপনার প্রথম প্রশ্নপত্র তৈরি করুন
                    </h2>
                    <PressableButton
                        href="/login?redirect=true"
                        className="mt-5"
                        size={'lg'}
                    >
                        ফ্রি শুরু করুন
                    </PressableButton>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground sm:flex-row lg:px-10">
                    <span className="font-tiro font-semibold text-foreground">অনুশীলন | Proshnokosh</span>
                    <span>© ২০২৬ অনুশীলন। সর্বস্বত্ব সংরক্ষিত।</span>
                </div>
            </footer>
        </main>
    );
};

export default MarketingPage;