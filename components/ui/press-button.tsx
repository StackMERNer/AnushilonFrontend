import * as React from 'react'
import { Button as BaseButton } from '@/components/ui/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * 3D "press" look: the bottom edge is a box-shadow (colored by --edge),
 * so the layout never shifts. On press the button sinks 3px.
 */
const lift =
  'shadow-[0_4px_0_0_var(--edge),0_12px_24px_-10px_rgba(27,8,81,0.5),inset_0_1px_0_rgba(255,255,255,0.28)] ' +
  'hover:brightness-110 active:translate-y-[3px] ' +
  'active:shadow-[0_1px_0_0_var(--edge),inset_0_1px_0_rgba(255,255,255,0.2)]'

/**
 * Shining slide effect: a skewed white streak sweeps across the button.
 * Needs the `button-shine` keyframes (see globals.css snippet).
 */
const shine =
  'relative isolate overflow-hidden ' +
  "after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1/3 after:content-[''] " +
  'after:-translate-x-[150%] after:skew-x-[-20deg] ' +
  'after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent ' +
  'after:animate-[button-shine_3.4s_ease-in-out_infinite] ' +
  'motion-reduce:after:animate-none disabled:after:hidden'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-bold uppercase tracking-wide ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  // disabled: uses tokens that exist in both themes, and kills gradients/shadows/shine
  'disabled:pointer-events-none disabled:bg-none disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent disabled:shadow-none disabled:opacity-70',
  {
    variants: {
      variant: {
        default:
          'bg-card text-card-foreground border-2 border-border [--edge:var(--border)] hover:bg-accent/60 ' +
          'shadow-[0_4px_0_0_var(--edge)] active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--edge)]',

        // Premium indigo. Light: deep indigo + white text. Dark: soft lavender + dark indigo text.
        primary:
          'bg-gradient-to-b from-brand-light to-brand text-white dark:text-brand-dark ' +
          '[--edge:var(--brand-dark)] dark:[--edge:#7054b5] ' +
          lift,

        secondary:
          'bg-gradient-to-b from-white to-secondary text-brand border border-line ' +
          'dark:from-[#2e2542] dark:to-[#272036] dark:text-[#e6ddfb] dark:border-white/10 ' +
          '[--edge:#d9d1ea] dark:[--edge:#0d0a16] ' +
          lift,

        // NEW: primary look + continuous shining slide
        shine:
          'bg-gradient-to-b from-brand-light to-brand text-white dark:text-brand-dark ' +
          '[--edge:var(--brand-dark)] dark:[--edge:#7054b5] ' +
          lift +
          ' ' +
          shine,

        // NEW: gold premium + shining slide (great for upgrade / reward CTAs)
        premium:
          'bg-gradient-to-b from-[#f8d77a] via-gold to-[#d9961f] text-brand-dark ' +
          '[--edge:#a8700f] ' +
          lift +
          ' ' +
          shine,

        danger:
          'bg-destructive text-destructive-foreground border-b-4 border-destructive-depth hover:bg-destructive/90 active:border-b-0',
        super:
          'bg-super text-super-foreground border-b-4 border-super-depth hover:bg-super/90 active:border-b-0',
        highlight:
          'bg-highlight-depth/75 text-super-foreground border-b-4 border-highlight-depth hover:bg-highlight-depth/65 active:border-b-0',
        golden:
          'bg-amber-300 text-amber-700 border-b-4 border-amber-400 hover:bg-amber-300/90 active:border-b-0',
        locked:
          'bg-neutral-200 text-neutral-400 border-b-4 border-current hover:bg-neutral-200/90 dark:bg-disabled dark:text-disabled-foreground dark:hover:bg-disabled/90',
        ghost:
          'bg-transparent border-2 border-transparent hover:bg-black/5 dark:bg-white/[0.015] dark:hover:bg-white/5',
        immersive:
          'bg-transparent text-current border-2 border-b-4 border-black/20 hover:opacity-85 active:border-b-0',
        active:
          'bg-secondary/15 text-secondary border-2 border-b-4 border-secondary/80 hover:bg-secondary/20',
        correct:
          'bg-green-500/15 text-green-500 border-2 border-b-4 border-green-500/80 hover:bg-green-500/20',
        incorrect:
          'bg-destructive/15 text-destructive border-2 border-b-4 border-destructive/80 hover:bg-destructive/20',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-14 px-8',
        icon: 'h-11 w-11',
        none: '',
        rounded: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ButtonProps = Omit<
  React.ComponentProps<typeof BaseButton>,
  'variant' | 'size'
> &
  VariantProps<typeof buttonVariants>

const PressButton = React.forwardRef<
  React.ElementRef<typeof BaseButton>,
  ButtonProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <BaseButton
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
})

PressButton.displayName = 'PressButton'

export { PressButton, buttonVariants }