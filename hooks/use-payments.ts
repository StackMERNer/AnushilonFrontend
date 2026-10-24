"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import {
  createPaymentService,
  PaymentStatusType,
} from "@/services/payment.service";

const paymentService = createPaymentService(apiClient);

export function useAllPayments({
  page = 1,
  limit = 20,
  paymentStatus,
  phoneNumberSearch = "",
  transactionIdSearch = "",
}: {
  page?: number;
  limit?: number;
  paymentStatus: PaymentStatusType | "all";
  phoneNumberSearch?: string;
  transactionIdSearch?: string;
}) {
  return useQuery({
    queryKey: [
      "payments",
      "all",
      page,
      limit,
      paymentStatus,
      phoneNumberSearch,
      transactionIdSearch,
    ],

    queryFn: () =>
      paymentService.getAllPayments({
        page,
        limit,
        paymentStatus,
        phoneNumberSearch,
        transactionIdSearch,
      }),

    placeholderData: (previousData) => previousData,
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentService.updatePaymentStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "all"],
      });
    },
  });
}
