import Logo from '@/components/Logo'
import { Flame, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'

const columns = [
    {
        title: 'অনুশীলন',
        links: [
            { href: '#features', label: 'ফিচার' },
            { href: '#how-it-works', label: 'কীভাবে কাজ করে' },
            { href: '#faq', label: 'প্রশ্নোত্তর' },
        ],
    },
    {
        title: 'একাউন্ট',
        links: [
            { href: '/signup', label: 'নতুন একাউন্ট' },
            { href: '/login', label: 'লগ ইন' },
            { href: '/dashboard', label: 'ড্যাশবোর্ড' },
        ],
    },
    {
        title: 'তথ্য',
        links: [
            { href: '/privacy', label: 'গোপনীয়তা নীতি' },
            { href: '/terms', label: 'শর্তাবলি' },
            { href: '/contact', label: 'যোগাযোগ' },
        ],
    },
]

export function MarketingFooter() {
    return (
        <footer className="relative isolate overflow-hidden bg-brand-dark text-white">
            {/* gold glow + top accent line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />

            {/* CTA band */}
            <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-10">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 text-center sm:p-10">
                    <div className="mb-4 flex items-center justify-center gap-2 text-gold">
                        <Flame className="size-5 fill-current" />
                        <Zap className="size-5 fill-current" />
                        <Trophy className="size-5 fill-current" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-balance sm:text-4xl">
                        আজই শুরু করো, স্ট্রিক ধরে রাখো
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-balance text-sm text-white/70 sm:text-base">
                        প্রতিদিন একটু একটু অনুশীলন করো, XP জেতো আর লিডারবোর্ডে এগিয়ে যাও।
                    </p>
                    <Link
                        href="/signup"
                        className="mt-6 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 font-bold text-brand-dark shadow-[0_6px_0_0_rgba(0,0,0,0.25)] transition active:translate-y-1 active:shadow-none"
                    >
                        অনুশীলন শুরু করো
                    </Link>
                </div>
            </div>

            {/* Links */}
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_2fr] lg:px-10">
                <div>
                    <div className="flex items-center gap-3">
                        <Logo />
                        <div>
                            <div className="font-li-shohid text-[28px] leading-none text-white">অনুশীলন</div>
                            <div className="mt-1 text-[11px] tracking-wide text-white/60">সফলতার নির্ভরযোগ্য সূত্র</div>
                        </div>
                    </div>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                        বাংলা ভাষায় প্রশ্ন অনুশীলনের একটি আনন্দময় প্ল্যাটফর্ম — প্রতিদিনের ছোট ছোট অনুশীলনেই বড় সাফল্য।
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    {columns.map((c) => (
                        <div key={c.title}>
                            <h3 className="mb-3 text-sm font-bold text-gold">{c.title}</h3>
                            <ul className="space-y-2">
                                {c.links.map((l) => (
                                    <li key={l.href}>
                                        <Link href={l.href} className="text-sm text-white/70 transition hover:text-white">
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/60 sm:flex-row sm:px-6 lg:px-10">
                    <span className="font-tiro font-semibold text-white">অনুশীলন | Anushilon</span>
                    <span>© ২০২৬ অনুশীলন। সর্বস্বত্ব সংরক্ষিত।</span>
                </div>
            </div>
        </footer>
    )
}