"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import {
  createPaymentSalesService,
  SalesSummaryFilters,
} from "@/services/payment.service";

const service = createPaymentSalesService(apiClient);
export function usePaymentSalesSummary(filters: SalesSummaryFilters) {
  return useQuery({
    queryKey: ["payments", "sales-summary", filters],
    queryFn: () => service.getSalesSummary(filters),
    placeholderData: (previousData) => previousData,
  });
}
