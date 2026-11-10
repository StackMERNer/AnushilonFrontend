'use client'
import { MotionDiv } from '@/components/motion'
import { AnimatedList, AnimatedListItem } from '@/components/motion/AnimatedList'
import { AnimatedTitle } from '@/components/motion/AnimatedTitle'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Check, Crown, Flame, ListChecks, Trophy, Zap } from 'lucide-react'
import NextLink from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'

import BulbSVG from '@/public/img/bulb.svg'
import ExamAPlusSVG from '@/public/img/exam-a-plus.svg'
import RewardSVG from '@/public/img/reward.svg'
import TargetSVG from '@/public/img/target-arrow.svg'
import { PressButton } from '../ui/press-button'
import { useUserProfile } from '@/hooks/useUserProfile'
import { cn } from '@/lib/utils'

const list = {
  visible: {
    opacity: 1,
    transition: { when: 'beforeChildren', staggerChildren: 0.08, delayChildren: 0.1 },
  },
  hidden: { opacity: 0 },
} satisfies Variants

const item = {
  visible: { opacity: 1, y: '0%', scale: 1, transition: { duration: 0.45 } },
  hidden: { opacity: 0, y: '100%', scale: 0.85 },
} satisfies Variants

/* ---------- Float: pops in, then bobs forever. `absolute` for the desktop stage ---------- */
function Float({
  children,
  className,
  delay = 0,
  duration = 4,
  y = 12,
  rotate = 0,
  absolute = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  rotate?: number
  absolute?: boolean
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={cn(absolute && 'absolute', className)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 + delay, type: 'spring', stiffness: 220, damping: 14 }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -y, 0], rotate: [rotate, rotate + 3, rotate] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
        whileHover={{ scale: 1.08, rotate: 0 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ---------- Stat chip ---------- */
const tones = {
  gold: 'bg-gold/20 text-gold',
  brand: 'bg-brand-soft text-brand',
  red: 'bg-red-tint text-red',
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
} as const

function Chip({
  icon,
  tone,
  value,
  label,
  className,
}: {
  icon: ReactNode
  tone: keyof typeof tones
  value: string
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-3 shadow-[0_8px_30px_-8px_rgba(27,8,81,0.25)] sm:gap-3 sm:py-2 sm:pl-2 sm:pr-5',
        className,
      )}
    >
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-full sm:size-11', tones[tone])}>
        {icon}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-bold text-foreground sm:text-lg">{value}</span>
        <span className="truncate text-[11px] text-muted-foreground sm:text-xs">{label}</span>
      </span>
    </div>
  )
}

/* ---------- Icon tile ---------- */
function Tile({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'grid place-items-center rounded-3xl border border-white/40 p-2.5 shadow-[0_10px_30px_-10px_rgba(27,8,81,0.35)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ---------- Mini quiz card ---------- */
function QuizCard() {
  const options = ['১৯৭০', '১৯৭১', '১৯৭২', '১৯৭৫']
  return (
    <div className="relative rounded-3xl border border-line bg-card p-4 shadow-[0_20px_60px_-15px_rgba(27,8,81,0.4)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">প্রশ্ন ৫/১০</span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold to-brand-light"
            initial={{ width: '0%' }}
            animate={{ width: '50%' }}
            transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
      <p className="mb-3 text-base font-semibold leading-snug text-foreground">
        বাংলাদেশ কত সালে স্বাধীনতা অর্জন করে?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o, i) => {
          const correct = i === 1
          return (
            <motion.div
              key={o}
              initial={false}
              animate={
                correct ? { scale: [1, 1.06, 1], transition: { delay: 1.8, duration: 0.5 } } : undefined
              }
              className={cn(
                'flex items-center justify-between rounded-xl border-2 px-3 py-2 text-sm font-medium',
                correct
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-line bg-muted/50 text-foreground',
              )}
            >
              {o}
              {correct && <Check className="size-4" strokeWidth={3} />}
            </motion.div>
          )
        })}
      </div>

      <motion.div
        className="absolute -top-4 right-2 flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-sm font-bold text-brand-dark shadow-lg sm:-right-3 sm:right-auto sm:left-auto"
        initial={{ opacity: 0, scale: 0, rotate: -20 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 1], y: [0, 0, -4, -14], rotate: [-20, 8, 8, 8] }}
        transition={{ delay: 1.8, duration: 2.4, repeat: Infinity, repeatDelay: 2 }}
      >
        <Zap className="size-4 fill-current" /> +১০ XP
      </motion.div>
    </div>
  )
}

/* ---------- Shared chip data ---------- */
const chips = {
  streak: { tone: 'red', icon: <Flame className="size-5 fill-current sm:size-6" />, value: '১২ দিন', label: 'স্ট্রিক চলছে' },
  xp: { tone: 'gold', icon: <Zap className="size-5 fill-current sm:size-6" />, value: '১,২৫০ XP', label: 'আজকের স্কোর' },
  rank: { tone: 'brand', icon: <Crown className="size-5 fill-current sm:size-6" />, value: '#৩', label: 'লিডারবোর্ড' },
  bank: { tone: 'green', icon: <ListChecks className="size-5 sm:size-6" />, value: '১ লক্ষ+', label: 'অনুশীলনী প্রশ্ন' },
} as const

export function Hero() {
  const { data: user, isLoading: loading } = useUserProfile()

  return (
    <section className="relative isolate overflow-hidden px-4 pt-16 sm:pt-20 lg:pt-24">
      {/* soft glows */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 size-[26rem] -translate-x-1/2 rounded-full bg-brand-soft/70 blur-3xl sm:size-[34rem] dark:bg-brand-tint" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-t from-gold/25 via-gold/5 to-transparent" />

      <AnimatedTitle>
        <div className="flex w-full flex-col items-center justify-center gap-2 text-balance py-4 text-center font-display text-[1.75rem] font-bold capitalize leading-normal tracking-tighter sm:py-6 sm:text-4xl sm:leading-snug md:gap-4 md:text-6xl">
          <h1 className='font-kobita'>অনুশীলন</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <h1>সফলতার নির্ভরযোগ্য</h1>
            <h1 className="-rotate-2 rounded-full border border-gold/40 bg-gold/30 px-[0.35em] py-1 text-brand shadow-[0_6px_0_0_rgba(233,172,54,0.45)] dark:text-gold">
              সূত্র
            </h1>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-center text-base text-muted-foreground sm:mt-4 sm:text-xl">
          প্রতিদিনের ছোট ছোট অনুশীলনেই গড়ে ওঠে বড় সাফল্য
        </p>
      </AnimatedTitle>

      {/* CTA */}
      <div className="relative z-10 mx-auto my-8 min-h-28 w-full max-w-80 sm:my-10">
        {!loading && !user && (
          <AnimatedList variants={list} className="flex flex-col gap-3">
            <AnimatedListItem variants={item}>
              <PressButton variant="primary" className="w-full">
                <NextLink href="/signup">অনুশীলন শুরু করো</NextLink>
              </PressButton>
            </AnimatedListItem>
            <AnimatedListItem variants={item}>
              <PressButton disabled={true} variant="secondary" className="w-full">
                <NextLink href="/login">আমার আগে থেকেই একাউন্ট আছে</NextLink>
              </PressButton>
            </AnimatedListItem>
          </AnimatedList>
        )}
        {!loading && user && (
          <MotionDiv initial="hidden" whileInView="visible" variants={item} transition={{ delay: 0.5 }}>
            <PressButton variant="shine" size="lg" className="w-full">
              <NextLink href="/dashboard" className="truncate">
                অনুশীলন চালিয়ে যাও
              </NextLink>
            </PressButton>
          </MotionDiv>
        )}
      </div>

      {/* ================= Mobile layout (< md): flowing, no overlap ================= */}
      <div className="mx-auto mb-12 max-w-md md:hidden">
        <div className="relative mx-auto w-full max-w-76 pt-5">
          <Float absolute={false} delay={0} duration={5} y={6}>
            <QuizCard />
          </Float>
          <Float className="-bottom-6 -left-4 z-10" delay={0.3} duration={4} rotate={-12}>
            <Tile className="size-14 -rotate-12 bg-linear-to-br from-gold/80 to-gold/20">
              <Image src={TargetSVG} alt="লক্ষ্য" style={{ scale: 0.75 }} />
            </Tile>
          </Float>
          <Float className="-bottom-6 -right-4 z-10" delay={0.5} duration={4.6} rotate={12}>
            <Tile className="size-14 rotate-12 bg-linear-to-bl from-brand-light/60 to-brand-soft">
              <Image src={BulbSVG} alt="আইডিয়া" />
            </Tile>
          </Float>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3">
          {(Object.keys(chips) as (keyof typeof chips)[]).map((k, i) => (
            <Float key={k} absolute={false} delay={0.2 * i} duration={3.6 + i * 0.4} y={6}>
              <Chip {...chips[k]} className="w-full" />
            </Float>
          ))}
        </div>
      </div>

      {/* ================= Desktop stage (md+): floating composition ================= */}
      <div className="relative mx-auto mb-10 hidden h-[430px] max-w-5xl md:block lg:h-[460px]">
        <Float className="inset-x-0 top-6 mx-auto w-80" delay={0} duration={5} y={8}>
          <QuizCard />
        </Float>

        {/* tiles */}
        <Float className="left-[6%] top-0 lg:left-[8%]" delay={0.2} duration={4.2} rotate={-12}>
          <Tile className="size-24 -rotate-12 bg-gradient-to-br from-gold/80 to-gold/20 lg:size-28">
            <Image src={TargetSVG} alt="লক্ষ্য" style={{ scale: 0.75 }} />
          </Tile>
        </Float>
        <Float className="right-[6%] top-2 lg:right-[8%]" delay={0.4} duration={4.8} y={14} rotate={12}>
          <Tile className="size-24 rotate-12 bg-gradient-to-bl from-brand-light/60 to-brand-soft lg:size-28">
            <Image src={BulbSVG} alt="আইডিয়া" />
          </Tile>
        </Float>
        <Float className="bottom-24 left-[14%] max-lg:hidden" delay={0.6} duration={4.5} rotate={-6}>
          <Tile className="size-28 -rotate-6 bg-gradient-to-r from-red-tint to-gold/30">
            <Image src={RewardSVG} alt="পুরস্কার" />
          </Tile>
        </Float>
        <Float className="bottom-28 right-[14%] max-lg:hidden" delay={0.8} duration={5.2} rotate={10}>
          <Tile className="size-28 rotate-6 bg-gradient-to-l from-emerald-400/40 to-emerald-100/40">
            <Image src={ExamAPlusSVG} alt="পরীক্ষা" style={{ scale: 0.7 }} />
          </Tile>
        </Float>

        {/* chips */}
        <Float className="left-[1%] top-[42%] lg:left-[3%]" delay={0.3} duration={3.8} y={10}>
          <Chip {...chips.streak} />
        </Float>
        <Float className="right-[1%] top-[46%] lg:right-[3%]" delay={0.5} duration={4.4} y={10}>
          <Chip {...chips.xp} />
        </Float>
        <Float className="bottom-0 left-[16%] lg:left-[26%]" delay={0.7} duration={4.1} y={9}>
          <Chip {...chips.rank} />
        </Float>
        <Float className="bottom-3 right-[14%] lg:right-[24%]" delay={0.9} duration={4.6} y={9}>
          <Chip {...chips.bank} />
        </Float>
        <Float className="left-[46%] top-[80%] max-lg:hidden" delay={1.1} duration={3.6} y={8}>
          <div className="grid size-14 place-items-center rounded-full bg-gold/30 text-gold shadow-md">
            <Trophy className="size-7 fill-current" />
          </div>
        </Float>
      </div>
    </section>
  )
}