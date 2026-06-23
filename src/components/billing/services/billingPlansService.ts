import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_BILLING_PLANS } from "./route.constants";

export type PlanPrice = {
  id?: string;
  interval: "month" | "year" | "one_time";
  amount_cents: number;
  currency?: string;
  is_active?: boolean;
  stripe_price_id?: string | null;
};

export type PlanFeature = {
  id?: string;
  label: string;
  description?: string | null;
  included?: boolean;
  sort_order?: number;
};

export type SubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  audience: "particular" | "professional" | "buyer";
  billing_type: "recurring" | "one_time";
  role_id?: string | null;
  stripe_product_id?: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  prices?: PlanPrice[];
  features?: PlanFeature[];
};

export type CreateSubscriptionPlanDto = Omit<SubscriptionPlan, "id" | "stripe_product_id"> & {
  prices?: PlanPrice[];
  features?: PlanFeature[];
};

export type UpdateSubscriptionPlanDto = Partial<CreateSubscriptionPlanDto> & {
  id: string;
};

export const billingPlansService = {
  findAll: async (
    params?: PaginationParams & { search?: string },
  ): Promise<PaginatedResult<SubscriptionPlan>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<SubscriptionPlan>>(
      `${V1_BILLING_PLANS}?${query_string}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<SubscriptionPlan>> => {
    const response = await apiGet<SubscriptionPlan>(`${V1_BILLING_PLANS}/${id}`);
    return response;
  },

  create: async (payload: CreateSubscriptionPlanDto): Promise<apiResponse<SubscriptionPlan>> => {
    return apiPost<SubscriptionPlan>(V1_BILLING_PLANS, payload);
  },

  update: async (dto: UpdateSubscriptionPlanDto): Promise<apiResponse<SubscriptionPlan>> => {
    const { id, ...body } = dto;
    return apiPatch<SubscriptionPlan>(`${V1_BILLING_PLANS}/${id}`, body);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_BILLING_PLANS}/${id}`);
  },

  syncStripe: async (id: string): Promise<apiResponse<SubscriptionPlan>> => {
    return apiPost<SubscriptionPlan>(`${V1_BILLING_PLANS}/${id}/sync-stripe`, {});
  },
};
