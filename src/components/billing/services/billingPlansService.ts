import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_BILLING_FEATURE_CATALOG, V1_BILLING_PLANS } from "./route.constants";
import { toast } from "sonner";

export type EntitlementValueType = "boolean" | "limit" | "unlimited";

export type PlanVersionStatus = "draft" | "published" | "archived";

export type EntitlementFeature =
  | "vehicles"
  | "photos_per_vehicle"
  | "videos_per_vehicle"
  | "ai_requests"
  | "users"
  | "video_upload"
  | "ai_generation"
  | "statistics"
  | "featured_listings"
  | "dismissed_vehicles"
  | "advanced_listing_editor";

export interface EntitlementBooleanValue {
  bool: boolean;
}

export interface EntitlementLimitValue {
  limit: number;
}

export interface EntitlementUnlimitedValue {
  unlimited: true;
}

export type EntitlementValue =
  | EntitlementBooleanValue
  | EntitlementLimitValue
  | EntitlementUnlimitedValue;

export interface PlanEntitlementInput {
  feature: EntitlementFeature | string;
  value_type: EntitlementValueType;
  value: EntitlementValue;
}

export interface FeatureCatalogItem {
  feature: EntitlementFeature | string;
  value_type: EntitlementValueType;
  label: string;
  description: string;
  metered: boolean;
}

export interface PlanEntitlement {
  id?: string;
  plan_version_id?: string;
  feature: string;
  value_type: EntitlementValueType;
  value: EntitlementValue;
}

export interface PlanVersion {
  id: string;
  plan_id: string;
  version: number;
  status: PlanVersionStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  entitlements?: PlanEntitlement[];
}

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

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  /** @deprecated */
  audience?: "particular" | "dealership" | "buyer" | null;
  billing_type: "recurring" | "one_time";
  stripe_product_id?: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  effect_config?: PlanEffectConfig;
  prices?: PlanPrice[];
  features?: PlanFeature[];
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description?: string | null;
  billing_type: SubscriptionPlan["billing_type"];
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  prices?: PlanPrice[];
  features?: PlanFeature[];
  effect_config?: PlanEffectConfig;
}

export interface UpdateSubscriptionPlanDto extends Partial<CreateSubscriptionPlanDto> {
  id: string;
}

export interface ReplaceDraftEntitlementsDto {
  entitlements: PlanEntitlementInput[];
}

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
    return (
      response.data ?? {
        data: [],
        total: 0,
        page: merged.page,
        limit: merged.limit,
      }
    );
  },

  findOne: async (id: string): Promise<apiResponse<SubscriptionPlan>> => {
    return apiGet<SubscriptionPlan>(`${V1_BILLING_PLANS}/${id}`);
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
    const response =  await apiDelete<void>(`${V1_BILLING_PLANS}/${id}`);
    if(!response.ok){
      toast.error(response.message ?? "Error al eliminar el plan");
    }
    return response;
  },

  syncStripe: async (id: string): Promise<apiResponse<SubscriptionPlan>> => {
    return apiPost<SubscriptionPlan>(`${V1_BILLING_PLANS}/${id}/sync-stripe`, {});
  },

  getFeatureCatalog: async (): Promise<FeatureCatalogItem[]> => {
    const response = await apiGet<FeatureCatalogItem[]>(V1_BILLING_FEATURE_CATALOG);
    return response.data ?? [];
  },

  listVersions: async (planId: string): Promise<apiResponse<PlanVersion[]>> => {
    return apiGet<PlanVersion[]>(`${V1_BILLING_PLANS}/${planId}/versions`);
  },

  ensureDraft: async (planId: string): Promise<apiResponse<PlanVersion>> => {
    return apiPost<PlanVersion>(`${V1_BILLING_PLANS}/${planId}/versions/draft`, {});
  },

  replaceDraftEntitlements: async (
    planId: string,
    entitlements: PlanEntitlementInput[],
  ): Promise<apiResponse<PlanVersion>> => {
    return apiPut<PlanVersion>(
      `${V1_BILLING_PLANS}/${planId}/versions/draft/entitlements`,
      { entitlements } satisfies ReplaceDraftEntitlementsDto,
    );
  },

  publishPlan: async (planId: string): Promise<apiResponse<PlanVersion>> => {
    return apiPost<PlanVersion>(`${V1_BILLING_PLANS}/${planId}/publish`, {});
  },
};
