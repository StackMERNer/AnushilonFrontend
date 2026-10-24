import { apiClient } from "@/lib/api/api-client";
import { createPaymentService } from "@/services/payment.service";
import { useQuery } from "@tanstack/react-query";

export function usePaymentHistory() {
    const service = createPaymentService(apiClient);
    return useQuery({
        queryKey: ["user-payment-history"],
        queryFn: async () => {
            return (await service.getUserPaymentHistory()).data;
        },
    })
}