import { Hero } from '@/components/marketing/Hero'
import { MarketingFooter } from './_components/MarketingFooter'
import { MarketingHeader } from './_components/MarketingHeader'

const MarketingPage = () => {
    return (
        <main className="min-h-screen bg-background text-foreground antialiased selection:bg-brand-soft selection:text-brand">
            <MarketingHeader />
            <Hero />
            <MarketingFooter />
        </main>
    )
}

export default MarketingPage