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

export interface PlanPrice {
  id?: string;
  interval: "month" | "year" | "one_time";
  amount_cents: number;
  currency?: string;
  is_active?: boolean;
  stripe_price_id?: string | null;
}

export interface PlanFeature {
  id?: string;
  label: string;
  description?: string | null;
  included?: boolean;
  sort_order?: number;
}

export interface PlanEffectConfig {
  type?: "assistant_credits" | "feature_vehicle";
  credits?: number;
}

export interface PlanQuotas {
  max_listings: number;
  max_photos: number;
  allow_videos: boolean;
  featured_monthly?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  audience: "particular" | "professional" | "buyer";
  billing_type: "recurring" | "one_time";
  role_id?: string | null;
  stripe_product_id?: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_custom: boolean;
  target_dealership_id?: string | null;
  quotas: PlanQuotas;
  sort_order: number;
  effect_config?: PlanEffectConfig;
  prices?: PlanPrice[];
  features?: PlanFeature[];
  /** Etiqueta derivada para el listado (badge). */
  visibility_label?: "Público" | "Personalizado";
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description?: string | null;
  audience: SubscriptionPlan["audience"];
  billing_type: SubscriptionPlan["billing_type"];
  role_id?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  is_custom?: boolean;
  target_dealership_id?: string | null;
  quotas?: PlanQuotas;
  sort_order?: number;
  prices?: PlanPrice[];
  features?: PlanFeature[];
  effect_config?: PlanEffectConfig;
}

export interface UpdateSubscriptionPlanDto extends Partial<CreateSubscriptionPlanDto> {
  id: string;
}

export interface CheckoutLinkResponse {
  checkout_url: string;
  plan_id: string;
  dealership_id: string;
  profile_id: string;
}

export const DEFAULT_PLAN_QUOTAS: PlanQuotas = {
  max_listings: 50,
  max_photos: 30,
  allow_videos: true,
  featured_monthly: 5,
};

const with_visibility_label = (plan: SubscriptionPlan): SubscriptionPlan => ({
  ...plan,
  is_custom: plan.is_custom ?? false,
  quotas: plan.quotas ?? DEFAULT_PLAN_QUOTAS,
  visibility_label: plan.is_custom ? "Personalizado" : "Público",
});

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
    const page = response.data;
    return {
      ...page,
      data: (page?.data ?? []).map(with_visibility_label),
    };
  },

  findOne: async (id: string): Promise<apiResponse<SubscriptionPlan>> => {
    const response = await apiGet<SubscriptionPlan>(`${V1_BILLING_PLANS}/${id}`);
    if (response.ok && response.data) {
      return { ...response, data: with_visibility_label(response.data) };
    }
    return response;
  },

  create: async (
    payload: CreateSubscriptionPlanDto,
  ): Promise<apiResponse<SubscriptionPlan>> => {
    return apiPost<SubscriptionPlan>(V1_BILLING_PLANS, payload);
  },

  update: async (
    dto: UpdateSubscriptionPlanDto,
  ): Promise<apiResponse<SubscriptionPlan>> => {
    const { id, ...body } = dto;
    return apiPatch<SubscriptionPlan>(`${V1_BILLING_PLANS}/${id}`, body);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_BILLING_PLANS}/${id}`);
  },

  syncStripe: async (id: string): Promise<apiResponse<SubscriptionPlan>> => {
    return apiPost<SubscriptionPlan>(`${V1_BILLING_PLANS}/${id}/sync-stripe`, {});
  },

  createCheckoutLink: async (
    id: string,
  ): Promise<apiResponse<CheckoutLinkResponse>> => {
    return apiPost<CheckoutLinkResponse>(
      `${V1_BILLING_PLANS}/${id}/checkout-link`,
      {},
    );
  },
};
