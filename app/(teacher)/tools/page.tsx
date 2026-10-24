import { Card } from '@/components/ui/card'
import Link from 'next/link'

const ToolsPage = () => {
    return (
        <div >
            <h1 className='text-center py-2'>টুল সমূহ</h1>
            <div className="grid md:grid-cols-4 grid-cols-2">
                <Link href='/tools/booklet'>
                    <Card className='p-3 rounded-lg border cursor-pointer'>
                        বুকলেট তৈরি করুন
                    </Card>
                </Link>
            </div>
        </div>
    )
}

export default ToolsPage