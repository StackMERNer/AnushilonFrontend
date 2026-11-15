"use client";

import CopyToClipboard from "@/components/global/copy-to-clipboard";
import PendingPaymentsBanner from "@/components/PendingPaymentsBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/useUserProfile";
import { apiClient } from "@/lib/api/api-client";
import { facebookPageUrl, getMaxPrice, plansInfo, PlanType } from "@/lib/constants";
import { createPaymentService } from "@/services/payment.service";
import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";


export const PER_SUBJECT_PRICING = 100;
export const SUBJECT_YEARLY_DURATION = 365;
const BKASH_NUMBER = "01894178289";
const NAGAD_NUMBER = "01894178289";

import { createUserService } from "@/services/user.service";
import { toast } from "sonner"; // or whichever toast lib you use

type SelectedUser = { _id: string; name: string; email: string };

const BKASH_LOGO =
    "https://res.cloudinary.com/dc5li4dua/image/upload/v1764752717/anushilon/BKash-bKash-Logo.wine_ug4m05.png";

const NAGAD_LOGO =
    "https://res.cloudinary.com/dg8g7l3sq/image/upload/v1790873963/02067786-19ea-4124-ac4c-1c7f9093257f.png";

type PaymentMethod = "bKash" | "nagad";
type EditablePlan = PlanType | "custom";

// Initial values come from the URL selection, used once
const getInitialAmount = (plan: EditablePlan | null, subjectCount: number) => {
    if (plan === "subject_yearly") {
        return Math.min(subjectCount * PER_SUBJECT_PRICING, getMaxPrice());
    }
    return plansInfo.find((p) => p.type === plan)?.price ?? 0;
};

const getInitialDuration = (plan: EditablePlan | null) => {
    if (plan === 'subject_yearly') {
        return SUBJECT_YEARLY_DURATION
    }
    return plansInfo.find((p) => p.type === plan)?.durationDays ?? 0;
}

const PaymentMethods = () => {
    const searchParams = useSearchParams();
    const { data: user, refetch: refetchUserProfile } = useUserProfile();
    const isAdmin = user?.role === "admin";

    const urlPlan = searchParams.get("plan") as EditablePlan | null;
    const subjectsParam = searchParams.get("subjects");

    // Constant, derived from the URL only
    const selectedSubjects = useMemo(
        () =>
            subjectsParam
                ? subjectsParam.split(",").map((item) => ({
                    subjectId: item.split("_")[0],
                    price: PER_SUBJECT_PRICING,
                }))
                : [],
        [subjectsParam]
    );

    // ---- Single sources of truth (initialized once from the URL) ----
    const [plan, setPlan] = useState<EditablePlan | null>(urlPlan);
    const [amount, setAmount] = useState(() =>
        String(getInitialAmount(urlPlan, subjectsParam ? subjectsParam.split(",").length : 0) || "")
    );
    const [durationDays, setDurationDays] = useState(() =>
        String(getInitialDuration(urlPlan) || "")
    );

    // ---- Admin: buy for another user ----
    const [buyForOther, setBuyForOther] = useState(false);
    const [searchEmail, setSearchEmail] = useState("");
    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

    const canEdit = isAdmin && buyForOther;

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bKash");
    const [transactionId, setTransactionId] = useState("");
    const [senderNumber, setSenderNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const selectedPlan = plansInfo.find((p) => p.type === plan);
    const paymentAmount = Number(amount) || 0;

    const planLabel =
        plan === "custom"
            ? "কাস্টম"
            : plan === "subject_yearly"
                ? "বিষয়ভিত্তিক সাবস্ক্রিপশন"
                : selectedPlan?.name;

    const hasValidPlan =
        plan === "custom"
            ? isAdmin
            : plan === "subject_yearly"
                ? selectedSubjects.length > 0
                : !!selectedPlan;

    const currentPaymentNumber = paymentMethod === "bKash" ? BKASH_NUMBER : NAGAD_NUMBER;
    const currentPaymentLogo = paymentMethod === "bKash" ? BKASH_LOGO : NAGAD_LOGO;

    const handleToggleBuyForOther = (checked: boolean) => {
        setBuyForOther(checked);
        if (!checked) {
            setSelectedUser(null);
            setSearchEmail("");
        }
    };

    const handleSearchWithEmail = () => {
        if (!searchEmail.trim()) return;
        createUserService(apiClient)
            .getUserByEmailOrId(searchEmail.trim())
            .then((found) => {
                if (found) {
                    setSelectedUser({ _id: found._id, name: found.name!, email: found.email });
                } else {
                    toast.error("ইউজার পাওয়া যায় নি।");
                }
            })
            .catch((error) => {
                console.error(error);
                toast.error("ইউজার খুঁজতে সমস্যা হয়েছে।");
            });
    };

    const handlePaymentSubmit = async () => {
        setErrorMessage("");
        setResponseMessage("");

        if (!plan || !hasValidPlan) {
            setErrorMessage("অনুগ্রহ করে একটি সঠিক প্লান নির্বাচন করুন।");
            return;
        }
        if (!user) {
            setErrorMessage("পেমেন্ট করার জন্য আপনাকে লগইন করতে হবে।");
            return;
        }
        if (canEdit && !selectedUser) {
            setErrorMessage("কোন ইউজারের জন্য ক্রয় করছেন তা সিলেক্ট করুন।");
            return;
        }
        if (!transactionId.trim()) {
            setErrorMessage("Transaction ID জমা দিন।");
            return;
        }
        if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
            setErrorMessage("সঠিক পরিমাণ দিন।");
            return;
        }
        const duration = Number(durationDays);
        if (canEdit && (!Number.isInteger(duration) || duration <= 0)) {
            setErrorMessage("সঠিক মেয়াদ (দিন) দিন।");
            return;
        }

        try {
            setLoading(true);
            const response = await createPaymentService(apiClient).recordPayment({
                plan,
                amount: paymentAmount,
                selectedSubjects: plan === "subject_yearly" ? selectedSubjects : undefined,
                paymentMethod,
                transactionId: transactionId.trim(),
                phoneNumber: senderNumber.trim() || undefined,
                // Only sent when the admin toggle is on; the backend rejects these from non-admins
                ...(canEdit ? { targetUserId: selectedUser!._id, durationDays: duration } : {}),
            });

            setResponseMessage(response.message);

            if (response.autoVerified && (!canEdit || selectedUser?._id === user._id)) {
                refetchUserProfile();
            }

            setTransactionId("");
            setSenderNumber("");
            if (canEdit) {
                setSelectedUser(null);
                setSearchEmail("");
            }
        } catch (error) {
            setErrorMessage(
                (error instanceof AxiosError && error.response?.data?.message) ||
                "পেমেন্ট এর তথ্য জমা দিতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!hasValidPlan && !isAdmin) {
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
        <div className="min-h-screen flex flex-col justify-center items-center py-10 md:px-4 px-1">
            <div className="max-w-xl pb-4">
                <PendingPaymentsBanner />
            </div>
            <div className="w-full max-w-xl bg-white dark:bg-neutral-900 shadow-md rounded-xl md:p-5 p-2 border">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            প্রশ্নকোষ
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {planLabel ?? "প্লান নির্বাচন করুন"}
                        </p>
                    </div>

                    <div className="text-2xl font-bold">
                        {toBnDigits(paymentAmount)}৳
                    </div>
                </div>


                {/* Selected Subjects */}
                {plan === "subject_yearly" && selectedSubjects.length > 0 && (
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

                            {isAdmin && (
                                <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer font-semibold">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={buyForOther}
                                            onChange={(e) => handleToggleBuyForOther(e.target.checked)}
                                        />
                                        অন্য ইউজারের জন্য ক্রয়
                                    </label>

                                    {buyForOther && (
                                        <div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={searchEmail}
                                                    onChange={(e) => setSearchEmail(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleSearchWithEmail()}
                                                    placeholder="ইউজারের ইমেইল"
                                                    className="h-11"
                                                />
                                                <Button type="button" onClick={handleSearchWithEmail}>
                                                    খুঁজুন
                                                </Button>
                                            </div>



                                            {selectedUser && (
                                                <div className="mt-3 flex items-center justify-between rounded-lg bg-white dark:bg-neutral-900 border p-3">
                                                    <div>
                                                        <p className="font-medium">{selectedUser.name}</p>
                                                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                                                        বাদ দিন
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Amount */}
                            <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex justify-between items-center gap-3">
                                    <span>পরিমাণ</span>
                                    {canEdit ? (
                                        <Input
                                            type="number"
                                            min={1}
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="h-10 w-32 text-right font-bold"
                                        />
                                    ) : (
                                        <span className="font-bold text-lg">{toBnDigits(paymentAmount)} টাকা</span>
                                    )}
                                </div>
                            </div>

                            {buyForOther && <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex justify-between items-center gap-3">
                                    <label className="font-medium">মেয়াদ</label>
                                    {canEdit ? <Input
                                        type="number"
                                        min={1}
                                        value={durationDays}
                                        disabled={!canEdit}
                                        onChange={(e) => setDurationDays(e.target.value)}
                                        className="h-10 w-32 text-right font-bold"
                                    /> :
                                        <span className="font-bold text-lg">{toBnDigits(Number(durationDays))} দিন</span>}
                                </div>
                            </div>}

                            {buyForOther && <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex justify-between items-center gap-3">
                                    <label className="font-medium">প্লান</label>
                                    <select
                                        className="h-10  rounded-md border bg-background px-3 disabled:opacity-60"
                                        value={plan ?? ""}
                                        disabled={!canEdit}
                                        onChange={(e) => setPlan(e.target.value as EditablePlan)}
                                    >
                                        <option value="" disabled>নির্বাচন করুন</option>
                                        {plansInfo
                                            .filter((p) => p.type !== "free")
                                            .map((p) => (
                                                <option
                                                    key={p.type}
                                                    value={p.type}
                                                    disabled={p.type === "subject_yearly" && selectedSubjects.length === 0}
                                                >
                                                    {p.name}
                                                </option>
                                            ))}

                                        <option value="custom">কাস্টম</option>
                                        {(selectedSubjects.length > 0) && <option value="subject_yearly">বিষয় বিত্তিক বাৎসরিক</option>}
                                    </select>
                                </div>
                            </div>
                            }


                            {/* Instructions */}
                            <p className="text-sm text-muted-foreground">
                                উপরের নম্বরে{" "}
                                <strong>
                                    {toBnDigits(paymentAmount)} টাকা
                                </strong>{" "}
                                Send Money করুন। পেমেন্টের পর নিচে{" "}
                                <strong>
                                    Transaction ID জমা দিন।
                                </strong>{" "}
                            </p>
                            {/* <p className="text-sm text-muted-foreground">
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
                            </p> */}

                            {/* Transaction ID */}
                            <div>
                                <label
                                    htmlFor="transactionId"
                                    className="text-sm font-medium"
                                >
                                    Transaction ID *
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
                                    className="mt-2 h-12"
                                    required
                                />
                            </div>

                            {/* OR */}
                            {/* <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="h-px flex-1 bg-border" />

                                <span>অথবা</span>

                                <div className="h-px flex-1 bg-border" />
                            </div> */}

                            {/* Sender Number */}
                            <div>
                                <label
                                    htmlFor="senderNumber"
                                    className="text-sm font-medium"
                                >
                                    যে {paymentMethod} নম্বর থেকে টাকা
                                    পাঠিয়েছেন (অপশনাল)
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
                                    className="mt-2 h-12"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success */}
                {responseMessage && (
                    <div className="mt-4 p-3 rounded-lg bg-green-100 text-green-800">
                        {responseMessage}
                    </div>
                )}

                {/* Error */}
                {errorMessage && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 ">
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
                        ? "সাবমিট হচ্ছে..."
                        : "সাবমিট করুন"}
                </button>

                {/* Support */}
                <p className="text-center text-sm text-muted-foreground mt-5">
                    পেমেন্ট সংক্রান্ত কোনো সমস্যা হলে{" "}
                    <Link
                        href={facebookPageUrl}
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