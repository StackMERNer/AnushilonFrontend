"use client";

import CopyToClipboard from "@/components/global/copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/useUserProfile";
import { apiClient } from "@/lib/api/api-client";
import { getMaxPrice, plansInfo, PlanType } from "@/lib/constants";
import { createPaymentService } from "@/services/payment.service";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const BKASH_NUMBER = "01894178289";
const NAGAD_NUMBER = "01894178289";

const BKASH_LOGO =
    "https://res.cloudinary.com/dc5li4dua/image/upload/v1764752717/anushilon/BKash-bKash-Logo.wine_ug4m05.png";

const NAGAD_LOGO =
    "https://res.cloudinary.com/dg8g7l3sq/image/upload/v1790873963/02067786-19ea-4124-ac4c-1c7f9093257f.png";

type PaymentMethod = "bKash" | "nagad";

const PaymentMethods = () => {
    const searchParams = useSearchParams();
    const planType = searchParams.get("plan") as PlanType | null;

    const { data: user } = useUserProfile();

    const subjectsParam = searchParams.get("subjects");

    const selectedSubjects = useMemo(() => {
        if (planType !== "subject_yearly" || !subjectsParam) {
            return [];
        }

        return subjectsParam.split(",").map((item) => {
            const [subjectId, price] = item.split("_");

            return {
                subjectId,
                price: 100,
            };
        });
    }, [planType, subjectsParam]);

    const isCustomPlan = planType === "subject_yearly";

    const customPlanPrice = useMemo(() => {
        const maxPrice = getMaxPrice();
        const customPrice = selectedSubjects.reduce(
            (total, subject) => total + subject.price,
            0
        );
        return customPrice > maxPrice ? maxPrice : customPrice;
    }, [selectedSubjects]);

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("bKash");

    const [transactionId, setTransactionId] = useState("");
    const [senderNumber, setSenderNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const selectedPlan = useMemo(
        () => plansInfo.find((plan) => plan.type === planType),
        [planType]
    );

    const paymentAmount = isCustomPlan
        ? customPlanPrice
        : selectedPlan?.price ?? 0;

    const currentPaymentNumber =
        paymentMethod === "bKash" ? BKASH_NUMBER : NAGAD_NUMBER;

    const currentPaymentLogo =
        paymentMethod === "bKash" ? BKASH_LOGO : NAGAD_LOGO;

    const handlePaymentSubmit = async () => {
        setErrorMessage("");
        setResponseMessage("");

        if (!planType || (!selectedPlan && !isCustomPlan)) {
            setErrorMessage("অনুগ্রহ করে একটি সঠিক প্লান নির্বাচন করুন।");
            return;
        }

        if (!transactionId.trim() && !senderNumber.trim()) {
            setErrorMessage(
                `Transaction ID অথবা যে ${paymentMethod} নম্বর থেকে টাকা পাঠিয়েছেন সেটি দিন।`
            );
            return;
        }

        if (!user) {
            setErrorMessage("পেমেন্ট করার জন্য আপনাকে লগইন করতে হবে।");
            return;
        }

        try {
            setLoading(true);

            const service = createPaymentService(apiClient);

            await service.recordPayment({
                plan: planType,
                amount: paymentAmount,
                selectedSubjects: isCustomPlan
                    ? selectedSubjects
                    : undefined,
                paymentMethod,
                transactionId: transactionId.trim() || undefined,
                phoneNumber: senderNumber.trim() || undefined,
            });

            setResponseMessage(
                "আপনার পেমেন্টের তথ্য জমা হয়েছে। পেমেন্টটি যাচাই করার পর আপনার প্লান সক্রিয় করা হবে।"
            );

            setTransactionId("");
            setSenderNumber("");
        } catch (error) {
            console.error(error);

            setErrorMessage(
                "পেমেন্ট এর তথ্য জমা দিতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।"
            );
        } finally {
            setLoading(false);
        }
    };

    const hasValidPlan =
        selectedPlan || (isCustomPlan && selectedSubjects.length > 0);

    if (!hasValidPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-6 text-center">
                    <h1 className="text-xl font-bold">
                        সঠিক প্লান নির্বাচন করুন
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        পেমেন্ট করার জন্য আগে একটি বৈধ প্লান নির্বাচন করতে হবে।
                    </p>

                    <Link href="/plans">
                        <Button className="mt-6 w-full">
                            প্লান দেখুন
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center py-10 px-4">
            <div className="w-full max-w-xl bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            প্রশ্নকোষ
                        </h1>

                        <p className="text-sm text-muted-foreground mt-1">
                            {isCustomPlan
                                ? "বিষয়ভিত্তিক সাবস্ক্রিপশন"
                                : `${selectedPlan?.name} প্লান`}
                        </p>
                    </div>

                    <div className="text-2xl font-bold">
                        {toBnDigits(paymentAmount)}৳
                    </div>
                </div>

                {/* Selected Subjects */}
                {isCustomPlan && (
                    <div className="mb-6 rounded-xl border bg-muted/30 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold">
                                নির্বাচিত বিষয়
                            </h2>

                            <span className="text-sm text-muted-foreground">
                                {toBnDigits(selectedSubjects.length)}টি
                            </span>
                        </div>

                        <div className="mt-3 border-t pt-3 flex justify-between font-bold">
                            <span>মোট</span>

                            <span>
                                {toBnDigits(paymentAmount)}৳
                            </span>
                        </div>
                    </div>
                )}

                {/* Payment Method Selection */}
                <div className="mb-6">
                    <h2 className="font-semibold mb-3">
                        পেমেন্ট পদ্ধতি
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        {/* bKash */}
                        <button
                            type="button"
                            onClick={() =>
                                setPaymentMethod("bKash")
                            }
                            className={`border rounded-xl p-3 transition ${paymentMethod === "bKash"
                                ? "border-[#CF2771] bg-pink-50 dark:bg-pink-950/30"
                                : "border-border"
                                }`}
                        >
                            <Image
                                priority
                                src={BKASH_LOGO}
                                width={70}
                                height={70}
                                alt="bKash"
                                className="mx-auto object-contain"
                            />

                            <p className="font-semibold mt-2">
                                bKash
                            </p>
                        </button>

                        {/* Nagad */}
                        <button
                            type="button"
                            onClick={() =>
                                setPaymentMethod("nagad")
                            }
                            className={`border rounded-xl p-3 transition ${paymentMethod === "nagad"
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                                : "border-border"
                                }`}
                        >
                            <Image
                                priority
                                src={NAGAD_LOGO}
                                width={70}
                                height={70}
                                alt="Nagad"
                                className="mx-auto object-contain"
                            />

                            <p className="font-semibold mt-2">
                                Nagad
                            </p>
                        </button>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="border rounded-xl overflow-hidden">
                    <div className="flex justify-center py-4">
                        <Image
                            priority
                            src={currentPaymentLogo}
                            height={100}
                            width={100}
                            alt={paymentMethod}
                            className="object-contain"
                        />
                    </div>

                    <div className="p-4">
                        <h2 className="font-bold text-lg mb-4">
                            {paymentMethod} দিয়ে পেমেন্ট করুন
                        </h2>

                        <div className="space-y-4">
                            {/* Payment Number */}
                            <div>
                                <p className="text-sm mb-2">
                                    নিচের নম্বরে Send Money করুন:
                                </p>

                                <div className="flex items-center gap-2">
                                    <span className="bg-muted px-3 py-2 rounded-lg font-semibold">
                                        {currentPaymentNumber}
                                    </span>

                                    <CopyToClipboard
                                        className="bg-muted p-2 rounded-lg cursor-pointer"
                                        data={currentPaymentNumber}
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span>পরিমাণ</span>

                                    <span className="font-bold text-lg">
                                        {toBnDigits(paymentAmount)} টাকা
                                    </span>
                                </div>
                            </div>

                            {/* Instructions */}
                            <p className="text-sm text-muted-foreground">
                                উপরের নম্বরে{" "}
                                <strong>
                                    {toBnDigits(paymentAmount)} টাকা
                                </strong>{" "}
                                Send Money করুন। পেমেন্টের পর নিচের{" "}
                                <strong>
                                    Transaction ID অথবা যে{" "}
                                    {paymentMethod} নম্বর থেকে টাকা পাঠিয়েছেন
                                </strong>{" "}
                                — যেকোনো একটি তথ্য দিন।
                            </p>

                            {/* Transaction ID */}
                            <div>
                                <label
                                    htmlFor="transactionId"
                                    className="text-sm font-medium"
                                >
                                    Transaction ID
                                </label>

                                <Input
                                    id="transactionId"
                                    value={transactionId}
                                    onChange={(event) =>
                                        setTransactionId(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Transaction ID লিখুন"
                                    className="mt-2"
                                />
                            </div>

                            {/* OR */}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="h-px flex-1 bg-border" />

                                <span>অথবা</span>

                                <div className="h-px flex-1 bg-border" />
                            </div>

                            {/* Sender Number */}
                            <div>
                                <label
                                    htmlFor="senderNumber"
                                    className="text-sm font-medium"
                                >
                                    যে {paymentMethod} নম্বর থেকে টাকা
                                    পাঠিয়েছেন
                                </label>

                                <Input
                                    id="senderNumber"
                                    type="tel"
                                    value={senderNumber}
                                    onChange={(event) =>
                                        setSenderNumber(
                                            event.target.value
                                        )
                                    }
                                    placeholder="01XXXXXXXXX"
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success */}
                {responseMessage && (
                    <div className="mt-4 p-3 rounded-lg bg-green-100 text-green-800 text-sm">
                        {responseMessage}
                    </div>
                )}

                {/* Error */}
                {errorMessage && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        {errorMessage}
                    </div>
                )}

                {/* Submit */}
                <button
                    disabled={loading}
                    onClick={handlePaymentSubmit}
                    className={`w-full mt-5 py-3 text-white rounded-lg cursor-pointer ${paymentMethod === "bKash"
                        ? "bg-[#CF2771] hover:bg-[#b91f63]"
                        : "bg-orange-500 hover:bg-orange-600"
                        }`}
                >
                    {loading
                        ? "জমা হচ্ছে..."
                        : "পেমেন্টের তথ্য জমা দিন"}
                </button>

                {/* Support */}
                <p className="text-center text-sm text-muted-foreground mt-5">
                    পেমেন্ট সংক্রান্ত কোনো সমস্যা হলে{" "}
                    <Link
                        href="https://www.facebook.com/profile.php?id=61594186144680"
                        target="_blank"
                        className="underline"
                    >
                        আমাদের ফেসবুক পেইজে যোগাযোগ করুন
                    </Link>
                    ।
                </p>
            </div>
        </div>
    );
};

const toBnDigits = (value: number) => {
    return value.toString().replace(
        /\d/g,
        (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]
    );
};

export default PaymentMethods;