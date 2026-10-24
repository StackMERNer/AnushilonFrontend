import { EditPaymentData } from "@/app/(admin)/payments/_compoents/EditPaymentModal";
import { PlanType } from "@/lib/constants";
import { PaginatedResponse } from "@/types/pagination";
import { AxiosInstance } from "axios";

export type MobileBankingType = "bKash" | "nagad" | "rocket";
export type PaymentStatusType = "pending" | "verified" | "rejected" | "invalid";

export interface IPaymentRecord {
  userId: string;
  _id: string;

  plan: PlanType;

  email: string;

  name?: string;

  durationDays: number; // will be calculated based on plan on backend

  amount: number;

  currency: "BDT";

  paymentMethod: MobileBankingType;

  transactionId?: string;
  phoneNumber?: string;
  selectedSubjects?: {
    subjectId: string;
    price: number;
  }[];
  statusMessage?: string;

  createdAt: Date;
  updatedAt: Date;
  paymentStatus: "pending" | "verified" | "rejected" | "invalid";
}

export interface IPopulatedPaymentRecord extends Omit<
  IPaymentRecord,
  "selectedSubjects" | "userId"
> {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  selectedSubjects: [
    {
      price: number;
      subjectId: {
        name: string;
        class: {
          _id: string;
          name: string;
        };
      };
    },
  ];
}

export type IPaymentPayload = Omit<
  IPaymentRecord,
  | "_id"
  | "paymentStatus"
  | "durationDays"
  | "userId"
  | "currency"
  | "createdAt"
  | "updatedAt"
  | "email"
>;

export function createPaymentService(client: AxiosInstance) {
  const base = "/payments";
  return {
    recordPayment: (data: IPaymentPayload) => client.post(base, data),
    getUserPaymentHistory: () =>
      client.get<IPaymentRecord[]>(`${base}/history`),
    getAllPayments: ({
      page,
      limit,
      paymentStatus,
      phoneNumberSearch,
      transactionIdSearch,
    }: {
      page: number;
      limit: number;
      transactionIdSearch: string;
      phoneNumberSearch: string;
      paymentStatus: PaymentStatusType | "all";
    }) =>
      client
        .get<PaginatedResponse<IPopulatedPaymentRecord>>(`${base}/all`, {
          params: {
            page,
            limit,
            paymentStatus,
            phoneNumberSearch,
            transactionIdSearch,
          },
        })
        .then((r) => r.data),
    updatePaymentStatus: ({
      paymentId,
      status,
      message,
    }: {
      paymentId: string;
      status: Exclude<PaymentStatusType, "pending">;
      message?: string;
    }) =>
      client
        .patch<{
          message: string;
          payment: IPaymentRecord;
        }>(`${base}/${paymentId}/status`, {
          status,
          message,
        })
        .then((r) => r.data),

    updatePaymentInfo: (paymentId: string, data: Partial<EditPaymentData>) =>
      client
        .patch<IPaymentRecord>(`${base}/${paymentId}`, data)
        .then((r) => r.data),
    deletePayment: (paymentId: string) => client.delete(`${base}/${paymentId}`),
  };
}

export type SalesGroupBy = "day" | "month";
export type SalesPaymentMethod = "all" | "bKash" | "nagad" | "rocket";
export type SalesPlan =
  | "all"
  | "monthly"
  | "six_month"
  | "yearly"
  | "subject_yearly"
  | "custom";

export interface SalesSummaryFilters {
  from?: string;
  to?: string;
  groupBy?: SalesGroupBy;
  paymentMethod?: SalesPaymentMethod;
  plan?: SalesPlan;
}
export interface SalesSummaryResponse {
  filters: {
    from: string | null;
    to: string | null;
    groupBy: SalesGroupBy;
    paymentMethod: SalesPaymentMethod;
    plan: SalesPlan;
  };
  summary: {
    revenue: number;
    paymentCount: number;
    averagePayment: number;
    uniqueCustomers: number;
    thisMonth: {
      revenue: number;
      paymentCount: number;
    };
  };
  timeline: { date: string; revenue: number; paymentCount: number }[];
  byMethod: { name: string; revenue: number; paymentCount: number }[];
  byPlan: { name: string; revenue: number; paymentCount: number }[];
}
export function createPaymentSalesService(client: AxiosInstance) {
  return {
    getSalesSummary: async (filters: SalesSummaryFilters) =>
      (
        await client.get<SalesSummaryResponse>("/payments/sales-summary", {
          params: filters,
        })
      ).data,
  };
}
