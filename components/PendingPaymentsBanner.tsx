
'use client';

import { usePendingPaments } from '@/hooks/use-payment-history';
import { Clock3, ShieldCheck } from 'lucide-react';

const PendingPaymentsBanner = () => {
    const { data: pendingPayments, isLoading } = usePendingPaments();

    if (isLoading || !pendingPayments?.length) {
        return null;
    }

    const count = pendingPayments.length;

    return (
        <div className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 sm:p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
            <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                    <Clock3 size={21} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">
                            পেমেন্ট যাচাই করা হচ্ছে
                        </h3>

                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                            {count} টি পেন্ডিং
                        </span>
                    </div>

                    <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        আপনার {count} টি পেমেন্ট যাচাইয়ের অপেক্ষায় আছে।
                        যাচাই সম্পন্ন হলে আপনার সাবস্ক্রিপশন স্বয়ংক্রিয়ভাবে
                        আপডেট করা হবে। আপাতত আপনাকে কিছু করতে হবে না।
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <ShieldCheck size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>পেমেন্ট নিশ্চিত হওয়ার পরই সাবস্ক্রিপশন সক্রিয় হবে।</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingPaymentsBanner;
