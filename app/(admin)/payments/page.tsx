"use client";

import Link from "next/link";
import { useState } from "react";
import { useAllPayments, useUpdatePaymentStatus } from "@/hooks/use-payments";
import { createPaymentService, IPopulatedPaymentRecord, PaymentStatusType } from "@/services/payment.service";
import { Edit, Trash, RotateCcw, Eye, BookOpen, X } from "lucide-react";
import EditPaymentModal, { EditPaymentData } from "./_compoents/EditPaymentModal";
import { apiClient } from "@/lib/api/api-client";
import { AxiosError } from "axios";
import { toast } from "sonner";

const PAGE_SIZE = 20;

type PaymentStatusFilter = PaymentStatusType | "all";

const statusLabels: Record<PaymentStatusFilter, string> = {
    all: "সব",
    pending: "অপেক্ষমাণ",
    verified: "অনুমোদিত",
    rejected: "বাতিল",
    invalid: "অবৈধ",
};

const statusClasses: Record<PaymentStatusFilter, string> = {
    all: "bg-gray-100 text-gray-700 border-gray-200",
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
    rejected: "bg-rose-50 text-rose-800 border-rose-200",
    invalid: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AdminPaymentsPage() {
    const [page, setPage] = useState(1);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>("all");
    const updatePaymentStatus = useUpdatePaymentStatus();
    const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

    const [phoneNumberSearch, setPhoneNumberSearch] = useState("");
    const [transactionIdSearch, setTransactionIdSearch] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<IPopulatedPaymentRecord | null>(null);

    // Subject viewing modal state
    const [viewingSubjectsPayment, setViewingSubjectsPayment] = useState<IPopulatedPaymentRecord | null>(null);

    const [phoneSearch, setPhoneSearch] = useState("");
    const [transactionSearch, setTransactionSearch] = useState("");

    const { data, isLoading, isFetching, isError, refetch } = useAllPayments({
        page,
        limit: PAGE_SIZE,
        paymentStatus,
        phoneNumberSearch: phoneSearch,
        transactionIdSearch: transactionSearch,
    });

    const handlePaymentAction = async (
        paymentId: string,
        status: "verified" | "rejected" | "invalid"
    ) => {
        let message: string | undefined;

        if (status === "rejected") {
            message = window.prompt("এই পেমেন্টটি বাতিল করার কারণ লিখুন:")?.trim();
            if (!message) return;
        }

        if (status === "invalid") {
            message = window.prompt("এই পেমেন্টটি অবৈধ হওয়ার কারণ লিখুন:")?.trim();
            if (!message) return;
        }

        const confirmed = window.confirm(
            status === "verified"
                ? "আপনি কি নিশ্চিতভাবে এই পেমেন্টটি অনুমোদন করতে চান?"
                : status === "rejected"
                    ? "আপনি কি নিশ্চিতভাবে এই পেমেন্টটি বাতিল করতে চান?"
                    : "আপনি কি নিশ্চিতভাবে পেমেন্টটিকে অবৈধ হিসেবে চিহ্নিত করতে চান?"
        );

        if (!confirmed) return;

        try {
            setProcessingPaymentId(paymentId);
            await updatePaymentStatus.mutateAsync({
                paymentId,
                status,
                message,
            });
            toast.success("পেমেন্ট স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে");
        } catch (error) {
            console.error(error);
            toast.error("পেমেন্ট স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।");
        } finally {
            setProcessingPaymentId(null);
        }
    };

    const handlePaymentUpdate = async (updateData: EditPaymentData) => {
        const paymentService = createPaymentService(apiClient);
        if (!selectedPayment) {
            toast.error('কোনো পেমেন্ট নির্বাচন করা হয়নি');
            return;
        }
        try {
            await paymentService.updatePaymentInfo(selectedPayment._id, updateData);
            toast.success("পেমেন্ট সফলভাবে আপডেট করা হয়েছে");
            setSelectedPayment(null);
        } catch (error) {
            const errMsg = (error as AxiosError<{ message: string }>).response?.data.message;
            toast.error(errMsg || "পেমেন্ট আপডেট করতে ব্যর্থ হয়েছে");
            console.log('error', error);
        } finally {
            refetch();
        }
    };

    const handlePaymentDelete = async (paymentId: string) => {
        const confirmed = window.confirm("আপনি কি নিশ্চিতভাবে এই পেমেন্ট রেকর্ডটি মুছে ফেলতে চান?");
        if (!confirmed) return;

        const paymentService = createPaymentService(apiClient);
        try {
            await paymentService.deletePayment(paymentId);
            toast.success('পেমেন্ট সফলভাবে মুছে ফেলা হয়েছে');
        } catch (error) {
            const errMsg = (error as AxiosError<{ message: string }>).response?.data.message;
            toast.error(errMsg || "পেমেন্ট মুছতে ব্যর্থ হয়েছে");
            console.log('error', error);
        } finally {
            refetch();
        }
    };

    const payments = data?.items ?? [];

    return (
        <main className="min-h-screen pb-10 text-slate-800">
            {/* Edit Modal */}
            {selectedPayment && (
                <EditPaymentModal
                    open={!!selectedPayment}
                    onOpenChange={() => setSelectedPayment(null)}
                    payment={selectedPayment}
                    onSave={handlePaymentUpdate}
                />
            )}

            {/* Subjects Modal */}
            {viewingSubjectsPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:p-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="text-indigo-600" size={22} />
                                <h3 className="text-lg font-semibold tracking-tight text-slate-900">নির্বাচিত বিষয়সমূহ</h3>
                            </div>
                            <button
                                onClick={() => setViewingSubjectsPayment(null)}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="my-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                <span className="font-semibold text-gray-800">ব্যবহারকারী:</span> {viewingSubjectsPayment.userId.name} ({viewingSubjectsPayment.userId.email}) <br />
                                <span className="font-semibold text-gray-800">প্ল্যান:</span> {viewingSubjectsPayment.plan} ({viewingSubjectsPayment.durationDays} দিন)
                            </div>

                            {(() => {
                                const grouped = viewingSubjectsPayment.selectedSubjects?.reduce((acc, curr) => {
                                    const className = curr.subjectId.class.name;
                                    if (!acc[className]) {
                                        acc[className] = [] as any;
                                    }
                                    acc[className].push(curr);
                                    return acc;
                                }, {} as Record<string, typeof viewingSubjectsPayment.selectedSubjects>);

                                if (!grouped || Object.keys(grouped).length === 0) {
                                    return <p className="text-center py-6 text-gray-500">কোনো বিষয় পাওয়া যায়নি।</p>;
                                }

                                return Object.entries(grouped).map(([className, subjects]) => (
                                    <div key={className} className="overflow-hidden rounded-xl border border-slate-200">
                                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                                            শ্রেণি: {className}
                                        </div>
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b border-slate-100 bg-white text-xs uppercase text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">বিষয়</th>
                                                    <th className="px-4 py-3 text-right font-medium">মূল্য</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {subjects?.map((sub, idx) => (
                                                    <tr key={idx} className="transition-colors hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-slate-700">{sub.subjectId.name}</td>
                                                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">৳{sub.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ));
                            })()}
                        </div>

                        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setViewingSubjectsPayment(null)}
                                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-700"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">পেমেন্টসমূহ</h1>
                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                            সাবস্ক্রিপশন পেমেন্ট অনুরোধগুলো পরিচালনা ও পর্যালোচনা করুন
                        </p>
                    </div>

                    <Link
                        href="/admin-dashboard"
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                        ← ড্যাশবোর্ডে ফিরে যান
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px_auto]">
                        <input
                            type="text"
                            placeholder="ফোন নম্বর দিয়ে খুঁজুন..."
                            value={phoneNumberSearch}
                            onChange={(e) => setPhoneNumberSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setPhoneSearch(phoneNumberSearch.trim());
                                    setPage(1);
                                }
                            }}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        />

                        <input
                            type="text"
                            placeholder="ট্রানজ্যাকশন আইডি দিয়ে খুঁজুন..."
                            value={transactionIdSearch}
                            onChange={(e) => setTransactionIdSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setTransactionSearch(transactionIdSearch.trim());
                                    setPage(1);
                                }
                            }}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        />

                        <select
                            value={paymentStatus}
                            onChange={(e) => {
                                setPaymentStatus(e.target.value as PaymentStatusFilter);
                                setPage(1);
                            }}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => {
                                setPhoneSearch("");
                                setTransactionSearch("");
                                setPhoneNumberSearch("");
                                setTransactionIdSearch("");
                                setPaymentStatus("all");
                                setPage(1);
                            }}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                        >
                            <RotateCcw size={15} className="text-gray-500" />
                            ফিল্টার মুছুন
                        </button>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                        💡 ফোন নম্বর বা ট্রানজ্যাকশন আইডি লিখে <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-slate-600">Enter</kbd> প্রেস করুন।
                    </p>
                </div>

                {/* Content Container */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">

                    {/* MOBILE CARD VIEW (< md) */}
                    <div className="divide-y divide-slate-100 md:hidden">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="animate-pulse space-y-3 p-4 sm:p-5">
                                    <div className="h-4 w-3/4 rounded-md bg-slate-200" />
                                    <div className="h-3 w-1/2 rounded-md bg-slate-100" />
                                    <div className="h-10 rounded-lg bg-slate-100" />
                                </div>
                            ))
                        ) : isError ? (
                            <div className="p-10 text-center text-sm text-rose-600">
                                পেমেন্ট তথ্য লোড করতে ব্যর্থ হয়েছে।
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="p-10 text-center text-sm text-slate-500">
                                কোনো পেমেন্ট পাওয়া যায়নি।
                            </div>
                        ) : (
                            payments.map((payment) => {
                                const status = payment.paymentStatus as PaymentStatusFilter;
                                return (
                                    <div key={payment._id} className={`space-y-4 p-4 sm:p-5 ${isFetching ? "opacity-60" : ""}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900">{payment.userId.name}</h3>
                                                <p className="text-xs leading-5 text-slate-500">{payment.userId.email}</p>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClasses[status] ?? statusClasses.all}`}>
                                                {statusLabels[status] ?? status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-3 gap-y-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs sm:p-4">
                                            <div>
                                                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">ফোন নম্বর</span>
                                                <span className="wrap-break-word font-medium text-slate-800">{payment.phoneNumber}</span>
                                            </div>
                                            <div>
                                                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">পরিমাণ</span>
                                                <span className="font-semibold text-emerald-700">৳{payment.amount}</span>
                                            </div>
                                            <div className="col-span-2 min-w-0">
                                                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">ট্রানজ্যাকশন আইডি</span>
                                                <span className="mt-0.5 inline-block max-w-full break-all rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-slate-700">
                                                    {payment.transactionId}
                                                </span>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-between gap-3">
                                                <div>
                                                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">প্ল্যান</span>
                                                    <span className="font-medium text-slate-800">
                                                        {payment.plan} ({payment.durationDays} দিন)
                                                        {payment.plan === "subject_yearly" && ` • ${payment.selectedSubjects?.length ?? 0} টি বিষয়`}
                                                    </span>
                                                </div>
                                                {payment.plan === "subject_yearly" && payment.selectedSubjects && payment.selectedSubjects.length > 0 && (
                                                    <button
                                                        onClick={() => setViewingSubjectsPayment(payment)}
                                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
                                                    >
                                                        <Eye size={13} /> বিষয়সমূহ দেখুন
                                                    </button>
                                                )}
                                            </div>
                                            <div>
                                                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">তারিখ</span>
                                                <span className="text-slate-600">
                                                    {new Date(payment.createdAt).toLocaleDateString("bn-BD", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 pt-3 min-[420px]:flex-row min-[420px]:items-center">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                                >
                                                    <Edit size={14} className="text-gray-500" /> এডিট
                                                </button>
                                                <button
                                                    onClick={() => handlePaymentDelete(payment._id)}
                                                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                                                >
                                                    <Trash size={14} className="text-rose-500" /> ডিলিট
                                                </button>
                                            </div>

                                            {status === "pending" ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={processingPaymentId === payment._id}
                                                        onClick={() => handlePaymentAction(payment._id, "verified")}
                                                        className="min-h-9 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        অনুমোদন
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={processingPaymentId === payment._id}
                                                        onClick={() => handlePaymentAction(payment._id, "rejected")}
                                                        className="min-h-9 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        বাতিল
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">প্রসেস সম্পন্ন</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* DESKTOP TABLE VIEW (>= md) */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-262.5 text-left text-sm text-slate-600">
                            <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold tracking-wide text-slate-600">
                                <tr>
                                    <th className="px-4 py-4">ব্যবহারকারী</th>
                                    <th className="px-4 py-4">ফোন নম্বর</th>
                                    <th className="px-4 py-4">ট্রানজ্যাকশন আইডি</th>
                                    <th className="px-4 py-4">প্ল্যান ও বিষয়সমূহ</th>
                                    <th className="px-4 py-4">পরিমাণ</th>
                                    <th className="px-4 py-4">স্ট্যাটাস</th>
                                    <th className="px-4 py-4">তারিখ</th>
                                    <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <tr key={index}>
                                            {Array.from({ length: 8 }).map((_, cell) => (
                                                <td key={cell} className="px-4 py-4">
                                                    <div className="h-4 animate-pulse rounded bg-gray-100" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-rose-500 font-medium">
                                            পেমেন্ট তথ্য লোড করতে ব্যর্থ হয়েছে।
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                            কোনো পেমেন্ট পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => {
                                        const status = payment.paymentStatus as PaymentStatusFilter;

                                        return (
                                            <tr key={payment._id} className={`transition-colors hover:bg-slate-50/80 ${isFetching ? "opacity-60" : ""}`}>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-slate-900">{payment.userId.name}</div>
                                                    <div className="text-xs leading-5 text-slate-500">{payment.userId.email}</div>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-800">
                                                    {payment.phoneNumber}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="inline-block max-w-45 break-all rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                                                        {payment.transactionId}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-xs leading-relaxed">
                                                    <span className="mb-1 block font-semibold text-slate-800">
                                                        {payment.plan} ({payment.durationDays} দিন)
                                                    </span>
                                                    {payment.plan === "subject_yearly" && payment.selectedSubjects && payment.selectedSubjects.length > 0 && (
                                                        <button
                                                            onClick={() => setViewingSubjectsPayment(payment)}
                                                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-[11px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                                                        >
                                                            <Eye size={12} /> বিষয়সমূহ দেখুন ({payment.selectedSubjects.length})
                                                        </button>
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 font-semibold text-emerald-700">
                                                    ৳{payment.amount}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClasses[status] ?? statusClasses.all}`}>
                                                        {statusLabels[status] ?? status}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                                                    {new Date(payment.createdAt).toLocaleDateString("bn-BD", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </td>

                                                <td className="px-4 py-4 text-right">
                                                    {status === "pending" ? (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                disabled={processingPaymentId === payment._id}
                                                                onClick={() => handlePaymentAction(payment._id, "verified")}
                                                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                অনুমোদন
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={processingPaymentId === payment._id}
                                                                onClick={() => handlePaymentAction(payment._id, "rejected")}
                                                                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                বাতিল
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedPayment(payment)}
                                                                title="এডিট করুন"
                                                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePaymentDelete(payment._id)}
                                                                title="মুছে ফেলুন"
                                                                className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="text-xs text-slate-400">প্রসেস সম্পন্ন</span>
                                                            <button
                                                                onClick={() => setSelectedPayment(payment)}
                                                                title="এডিট করুন"
                                                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePaymentDelete(payment._id)}
                                                                title="মুছে ফেলুন"
                                                                className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:px-5">
                        <p className="text-center text-xs text-slate-500 sm:text-left sm:text-sm">
                            {data
                                ? `মোট ${data.totalItems}টি পেমেন্ট · পৃষ্ঠা ${data.currentPage} এর ${data.totalPages}`
                                : "লোড হচ্ছে..."}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1 || isFetching}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                পূর্ববর্তী
                            </button>

                            <span className="min-w-12 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200">
                                {data?.currentPage ?? page}
                            </span>

                            <button
                                type="button"
                                disabled={!data || data.nextPage === null || isFetching}
                                onClick={() => {
                                    if (data?.nextPage) {
                                        setPage(data.nextPage);
                                    }
                                }}
                                className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                পরবর্তী
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}