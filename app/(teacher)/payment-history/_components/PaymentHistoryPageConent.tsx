"use client";

import { usePaymentHistory } from "@/hooks/use-payment-history";
import React from "react";
import { CalendarDays, CreditCard, Hash, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IPaymentRecord } from "@/services/payment.service";
import Link from "next/link";

const planNames: Record<string, string> = {
  monthly: "মাসিক",
  six_month: "৬ মাস",
  yearly: "বার্ষিক",
  subject_yearly: "বিষয় ভিত্তিক - ১ বছর",
};

const statusConfig: Record<
  IPaymentRecord["paymentStatus"],
  { label: string; className: string }
> = {
  pending: {
    label: "পেন্ডিং",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  verified: {
    label: "ভেরিফাইড",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  rejected: {
    label: "বাতিল",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  invalid: {
    label: "অকার্যকর",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  },
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const PaymentHistoryPageContent = () => {
  const { data: payments, isLoading } = usePaymentHistory();
  console.log('payments', payments);
  if (isLoading) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        পেমেন্ট হিস্টোরি লোড হচ্ছে...
      </div>
    );
  }

  if (!payments?.length) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-xl border border-dashed max-w-5xl mx-auto px-2">
        <div className="text-center">
          <CreditCard className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

          <h3 className="text-lg font-semibold">
            কোনো পেমেন্ট হিস্টোরি নেই
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            আপনার কোনো পেমেন্টের তথ্য এখানে দেখা যাবে।
          </p>
          <Link
            href="/plans"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            একটি প্ল্যান কিনুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto px-2">
      {payments.map((payment) => {
        const status = statusConfig[payment.paymentStatus];

        return (
          <Card key={payment._id}>
            <CardContent className="p-5">
              <div className="flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      অনুশীলন —{" "}
                      {planNames[payment.plan] ?? payment.plan}
                    </h3>

                    <Badge className={status.className}>
                      {status.label}
                    </Badge>
                  </div>

                  <p className="mt-1 text-lg font-bold">
                    ৳{payment.amount.toLocaleString("bn-BD")}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>{payment.paymentMethod}</span>
                  </div>

                  {payment.transactionId && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span>
                        Transaction ID: {payment.transactionId}
                      </span>
                    </div>
                  )}

                  {payment.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{payment.phoneNumber}</span>
                    </div>
                  )}

                  {payment.createdAt && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(payment.createdAt)}</span>
                    </div>
                  )}


                </div>
                {
                  payment.statusMessage && (
                    <div className="flex items-center gap-2 p-2 bg-amber-100 rounded-lg mt-5">
                      <span>{payment.statusMessage}</span>
                    </div>
                  )
                }
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PaymentHistoryPageContent;