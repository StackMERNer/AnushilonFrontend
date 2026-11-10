'use client'
import Logo from '@/components/Logo'
import { PressButton } from '@/components/ui/press-button'
import { useUserProfile } from '@/hooks/useUserProfile'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const links = [
    { href: '#features', label: 'ফিচার' },
    { href: '#how-it-works', label: 'কীভাবে কাজ করে' },
    { href: '#faq', label: 'প্রশ্নোত্তর' },
]

export function MarketingHeader() {
    const { data: user, isLoading: loading } = useUserProfile()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // lock body scroll while the mobile menu is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    return (
        <header
            className={cn(
                'sticky top-0 z-50 border-b transition-all',
                scrolled
                    ? 'border-line bg-background/80 shadow-[0_8px_30px_-12px_rgba(27,8,81,0.2)] backdrop-blur-md'
                    : 'border-transparent bg-background/40 backdrop-blur-sm',
            )}
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-10">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 sm:gap-3" onClick={() => setOpen(false)}>
                    <Logo />
                    <div>
                        <div className="font-kobita text-2xl leading-none text-primary sm:text-[28px] dark:text-brand">
                            অনুশীলন
                        </div>
                        <div className="mt-1 hidden text-[11px] tracking-wide text-muted-foreground min-[380px]:block">
                            সফলতার নির্ভরযোগ্য সূত্র
                        </div>
                    </div>
                </Link>

                {/* Desktop links */}
                <div className="hidden items-center gap-1 md:flex">
                    {links.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-accent-foreground"
                        >
                            {l.label}
                        </a>
                    ))}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <span
                        className="hidden items-center gap-1 rounded-full border border-gold/40 bg-gold/15 px-3 py-1.5 text-sm font-bold text-foreground lg:flex"
                        title="প্রতিদিন অনুশীলন করে স্ট্রিক ধরে রাখো"
                    >
                        <Flame className="size-4 fill-red text-red" /> স্ট্রিক
                    </span>

                    {!loading && !user && (
                        <>
                            <Link
                                href="/login?redirect=true"
                                className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted sm:block"
                            >
                                লগ ইন
                            </Link>
                            <PressButton variant="primary" className="hidden px-5 sm:inline-flex">
                                <Link href="/signup">শুরু করো</Link>
                            </PressButton>
                        </>
                    )}
                    {!loading && user && (
                        <PressButton variant="primary" className="hidden px-5 sm:inline-flex">
                            <Link href="/dashboard">ড্যাশবোর্ড</Link>
                        </PressButton>
                    )}

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        aria-label={open ? 'মেনু বন্ধ করো' : 'মেনু খোলো'}
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="grid size-10 place-items-center rounded-full border border-line bg-card text-foreground transition active:scale-95 md:hidden"
                    >
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] border-t border-line bg-background/95 px-4 py-6 backdrop-blur-xl md:hidden"
                    >
                        <div className="mx-auto flex max-w-md flex-col gap-2">
                            {links.map((l, i) => (
                                <motion.a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    className="rounded-2xl border border-line bg-card px-5 py-4 text-lg font-semibold text-foreground active:scale-[0.98]"
                                >
                                    {l.label}
                                </motion.a>
                            ))}

                            <div className="mt-4 flex flex-col gap-3">
                                {!loading && !user && (
                                    <>
                                        <PressButton variant="primary" className="w-full">
                                            <Link href="/signup" onClick={() => setOpen(false)}>
                                                অনুশীলন শুরু করো
                                            </Link>
                                        </PressButton>
                                        <PressButton variant="secondary" className="w-full">
                                            <Link href="/login?redirect=true" onClick={() => setOpen(false)}>
                                                লগ ইন
                                            </Link>
                                        </PressButton>
                                    </>
                                )}
                                {!loading && user && (
                                    <PressButton variant="primary" className="w-full">
                                        <Link href="/dashboard" onClick={() => setOpen(false)}>
                                            ড্যাশবোর্ডে যাও
                                        </Link>
                                    </PressButton>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}