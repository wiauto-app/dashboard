import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_BILLING_ASSISTANT_CREDIT_PACKS } from "./route.constants";

export interface AssistantCreditPack {
  id: string;
  title: string;
  description: string | null;
  credits_quantity: number;
  amount_cents: number;
  currency: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAssistantCreditPackDto {
  title: string;
  description?: string | null;
  credits_quantity: number;
  amount_cents: number;
  currency?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateAssistantCreditPackDto
  extends Partial<CreateAssistantCreditPackDto> {
  id: string;
}

export const assistantCreditPacksService = {
  findAll: async (
    params?: PaginationParams & { search?: string },
  ): Promise<PaginatedResult<AssistantCreditPack>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<AssistantCreditPack>>(
      `${V1_BILLING_ASSISTANT_CREDIT_PACKS}?${query_string}`,
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

  findOne: async (id: string): Promise<apiResponse<AssistantCreditPack>> => {
    return apiGet<AssistantCreditPack>(
      `${V1_BILLING_ASSISTANT_CREDIT_PACKS}/${id}`,
    );
  },

  create: async (
    payload: CreateAssistantCreditPackDto,
  ): Promise<apiResponse<AssistantCreditPack>> => {
    return apiPost<AssistantCreditPack>(
      V1_BILLING_ASSISTANT_CREDIT_PACKS,
      payload,
    );
  },

  update: async (
    dto: UpdateAssistantCreditPackDto,
  ): Promise<apiResponse<AssistantCreditPack>> => {
    const { id, ...body } = dto;
    return apiPatch<AssistantCreditPack>(
      `${V1_BILLING_ASSISTANT_CREDIT_PACKS}/${id}`,
      body,
    );
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_BILLING_ASSISTANT_CREDIT_PACKS}/${id}`);
  },

  syncStripe: async (
    id: string,
  ): Promise<apiResponse<AssistantCreditPack>> => {
    return apiPost<AssistantCreditPack>(
      `${V1_BILLING_ASSISTANT_CREDIT_PACKS}/${id}/sync-stripe`,
    );
  },
};
