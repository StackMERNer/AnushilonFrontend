"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CreditCard, RefreshCw, Users, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usePaymentSalesSummary } from "@/hooks/use-payment-sales";
import { SalesGroupBy, SalesPaymentMethod, SalesPlan } from "@/services/payment.service";

const money = (v: number) => new Intl.NumberFormat("bn-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(v);
const number = (v: number) => new Intl.NumberFormat("bn-BD").format(v);
const asDateInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const now = new Date();
const defaultTo = asDateInput(now);
const defaultFrom = asDateInput(new Date(now.getFullYear(), now.getMonth() - 11, 1));

const methodLabels: Record<SalesPaymentMethod, string> = { all: "সব মাধ্যম", bKash: "bKash", nagad: "Nagad", rocket: "Rocket" };
const planLabels: Record<SalesPlan, string> = { all: "সব প্ল্যান", monthly: "মাসিক", six_month: "৬ মাস", yearly: "বার্ষিক", subject_yearly: "বিষয়ভিত্তিক বার্ষিক", custom: "কাস্টম" };

// Helper: YYYY-MM-DD to DD/MM/YYYY
const formatDateForInput = (isoStr: string) => {
    if (!isoStr) return "";
    const [year, month, day] = isoStr.split("-");
    if (!year || !month || !day) return isoStr;
    return `${day}/${month}/${year}`;
};

// Helper: DD/MM/YYYY to YYYY-MM-DD
const parseDateFromInput = (inputStr: string) => {
    const parts = inputStr.split("/");
    if (parts.length === 3) {
        const [day, month, year] = parts;
        if (year?.length === 4 && month?.length <= 2 && day?.length <= 2) {
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
    }
    return inputStr;
};

function Metric({ title, value, hint, Icon }: { title: string; value: string; hint: string; Icon: React.ElementType }) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 wrap-break-word text-2xl font-bold tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p>
        </div><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon size={20} /></span></div>
    </div>;
}

export default function SalesSummaryPage() {
    const [from, setFrom] = useState(defaultFrom);
    const [to, setTo] = useState(defaultTo);

    // Local text states for inputs so user can see and type dd/mm/yyyy seamlessly
    const [fromText, setFromText] = useState(formatDateForInput(defaultFrom));
    const [toText, setToText] = useState(formatDateForInput(defaultTo));

    const groupBy: SalesGroupBy = "month";
    const [paymentMethod, setPaymentMethod] = useState<SalesPaymentMethod>("all");
    const [plan, setPlan] = useState<SalesPlan>("all");

    const filters = useMemo(() => ({ from, to, groupBy, paymentMethod, plan }), [from, to, groupBy, paymentMethod, plan]);
    const { data, isLoading, isFetching, isError, refetch } = usePaymentSalesSummary(filters);
    const timeline = data?.timeline ?? [];
    const byMethod = data?.byMethod ?? [];
    const byPlan = data?.byPlan ?? [];

    const handleFromChange = (val: string) => {
        setFromText(val);
        const parsed = parseDateFromInput(val);
        if (parsed.length === 10 && parsed.includes("-")) {
            setFrom(parsed);
        }
    };

    const handleToChange = (val: string) => {
        setToText(val);
        const parsed = parseDateFromInput(val);
        if (parsed.length === 10 && parsed.includes("-")) {
            setTo(parsed);
        }
    };

    const reset = () => {
        setFrom(defaultFrom);
        setTo(defaultTo);
        setFromText(formatDateForInput(defaultFrom));
        setToText(formatDateForInput(defaultTo));
        setPaymentMethod("all");
        setPlan("all");
    };

    return <main className="min-h-screen px-3 py-5 text-slate-800 sm:px-5 sm:py-7 lg:px-8">
        <div className="mx-auto max-w-375">
            <header className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="md:flex justify-between w-full items-start">
                    <div className="mb-2 items-center gap-2 text-xs font-semibold uppercase text-indigo-600">
                        <h1 className="text-md font-bold tracking-tight text-slate-950 sm:text-3xl">বিক্রয় সারসংক্ষেপ</h1>
                        <p className="mt-1.5 max-w-2xl text-sm text-slate-500">অনুমোদিত পেমেন্টের আয়, লেনদেন এবং সাবস্ক্রিপশন বিক্রয় বিশ্লেষণ করুন।</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => refetch()} disabled={isFetching} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"><RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /> রিফ্রেশ</button>
                        <Link href="/admin-dashboard" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"><ArrowLeft size={15} /> ড্যাশবোর্ড</Link>
                    </div>
                </div>
            </header>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5">
                <div className="mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-slate-500" /><h2 className="font-semibold text-slate-900">ফিল্টার</h2>{isFetching && <span className="text-xs text-slate-400">আপডেট হচ্ছে…</span>}</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    <label className="text-xs font-medium text-slate-500">
                        শুরুর তারিখ (DD/MM/YYYY)
                        <input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            value={fromText}
                            onChange={e => handleFromChange(e.target.value)}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-mono"
                        />
                    </label>
                    <label className="text-xs font-medium text-slate-500">
                        শেষ তারিখ (DD/MM/YYYY)
                        <input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            value={toText}
                            onChange={e => handleToChange(e.target.value)}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-mono"
                        />
                    </label>
                    <div className="flex flex-col justify-end"><span className="text-xs font-medium text-slate-500">চার্ট</span><div className="mt-1.5 flex h-11 items-center rounded-xl border border-indigo-100 bg-indigo-50 px-3 text-sm font-semibold text-indigo-700">মাসভিত্তিক বিক্রয়</div></div>
                    <label className="text-xs font-medium text-slate-500">পেমেন্ট মাধ্যম<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as SalesPaymentMethod)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10">{Object.entries(methodLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                    <label className="text-xs font-medium text-slate-500">সাবস্ক্রিপশন প্ল্যান<select value={plan} onChange={e => setPlan(e.target.value as SalesPlan)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10">{Object.entries(planLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                    <div className="flex items-end"><button onClick={reset} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 hover:bg-slate-100">ফিল্টার রিসেট</button></div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">চার্টে গত ১২ মাসের বিক্রয় দেখানো হয়; শুধু অনুমোদিত (verified), মুছে না ফেলা BDT পেমেন্ট গণনা করা হয়। তারিখ UTC অনুযায়ী ফিল্টার করা হয়।</p>
            </section>

            {isError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">বিক্রয়ের তথ্য লোড করা যায়নি। API route, admin permission এবং server logs পরীক্ষা করুন। <button onClick={() => refetch()} className="font-semibold underline">আবার চেষ্টা করুন</button></div> : <>
                <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric
                        title="এই মাসের আয়"
                        value={
                            isLoading
                                ? "—"
                                : money(data?.summary.thisMonth?.revenue ?? 0)
                        }
                        hint="চলতি মাসের অনুমোদিত পেমেন্ট"
                        Icon={Wallet}
                    />

                    <Metric
                        title="এই মাসের লেনদেন"
                        value={
                            isLoading
                                ? "—"
                                : number(data?.summary.thisMonth?.paymentCount ?? 0)
                        }
                        hint="চলতি মাসের মোট লেনদেন"
                        Icon={CreditCard}
                    />
                    <Metric title="মোট আয়" value={isLoading ? "—" : money(data?.summary.revenue ?? 0)} hint="অনুমোদিত পেমেন্ট থেকে" Icon={Wallet} />
                    <Metric title="মোট লেনদেন" value={isLoading ? "—" : number(data?.summary.paymentCount ?? 0)} hint="এই ফিল্টারের মধ্যে" Icon={CreditCard} />
                    <Metric title="ইউনিক গ্রাহক" value={isLoading ? "—" : number(data?.summary.uniqueCustomers ?? 0)} hint="অন্তত একটি অনুমোদিত পেমেন্ট" Icon={Users} />
                </section>

                <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold text-slate-900">আয়ের প্রবণতা</h2><p className="mt-1 text-xs text-slate-400">প্রতি মাসের মোট আয়</p></div><span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700">BDT</span></div>
                        <div className="h-70 w-full sm:h-85">{isLoading ? <div className="h-full animate-pulse rounded-xl bg-slate-50" /> : timeline.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-slate-400">এই সময়সীমায় কোনো বিক্রয় নেই।</div> : <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timeline} margin={{ top: 10, right: 12, left: 2, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} interval="preserveStartEnd" tickFormatter={(value: string) => { const [year, month] = value.split("-").map(Number); return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("bn-BD", { month: "short", year: "2-digit", timeZone: "UTC" }); }} />
                                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={62} tickFormatter={(v: number) => number(v)} />
                                <Tooltip formatter={(v) => [money(Number(v)), "আয়"]} labelFormatter={label => formatDateForInput(String(label))} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }} />
                                <Bar dataKey="revenue" name="মোট আয়" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={44} />
                            </BarChart>
                        </ResponsiveContainer>}</div>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5">
                        <h2 className="font-semibold text-slate-900">পেমেন্ট মাধ্যম অনুযায়ী</h2><p className="mt-1 text-xs text-slate-400">আয় ও লেনদেনের সংখ্যা</p>
                        <div className="mt-4 space-y-4">{byMethod.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">কোনো তথ্য নেই।</p> : byMethod.map(item => {
                            const max = Math.max(...byMethod.map(x => x.revenue), 1);
                            return <div key={item.name}><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{methodLabels[item.name as SalesPaymentMethod] ?? item.name}</span><span className="text-right font-semibold text-slate-900">{money(item.revenue)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, item.revenue / max * 100)}%` }} /></div><p className="mt-1 text-xs text-slate-400">{number(item.paymentCount)}টি লেনদেন</p></div>;
                        })}</div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5"><h2 className="font-semibold text-slate-900">প্ল্যান অনুযায়ী বিক্রয়</h2><p className="mt-1 text-xs text-slate-400">নির্বাচিত সময়সীমায় প্রতিটি প্ল্যানের মোট আয়</p></div>
                    {byPlan.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">কোনো বিক্রয় পাওয়া যায়নি।</div> : <div className="overflow-x-auto"><table className="w-full min-w-130 text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3 font-semibold sm:px-5">প্ল্যান</th><th className="px-4 py-3 text-right font-semibold sm:px-5">লেনদেন</th><th className="px-4 py-3 text-right font-semibold sm:px-5">মোট আয়</th></tr></thead><tbody className="divide-y divide-slate-100">{byPlan.map(item => <tr key={item.name} className="hover:bg-slate-50/70"><td className="px-4 py-3.5 font-medium text-slate-800 sm:px-5">{planLabels[item.name as SalesPlan] ?? item.name}</td><td className="px-4 py-3.5 text-right text-slate-600 sm:px-5">{number(item.paymentCount)}</td><td className="px-4 py-3.5 text-right font-semibold text-emerald-700 sm:px-5">{money(item.revenue)}</td></tr>)}</tbody></table></div>}
                </section>
            </>}
        </div>
    </main>;
}