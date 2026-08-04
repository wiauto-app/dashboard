import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_BILLING_COUPONS } from "./route.constants";

export interface DiscountCoupon {
  id: string;
  code: string;
  name: string;
  percent_off: number | null;
  amount_off_cents: number | null;
  currency: string | null;
  stripe_coupon_id: string;
  stripe_promotion_code_id: string;
  max_redemptions: number;
  times_redeemed: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDiscountCouponDto {
  name: string;
  code?: string;
  percent_off?: number;
  amount_off_cents?: number;
  currency?: string;
  max_redemptions?: number;
  expires_at?: string | null;
  active?: boolean;
}

export interface UpdateDiscountCouponDto {
  id: string;
  active?: boolean;
}

export const discountCouponsService = {
  findAll: async (
    params?: PaginationParams & { search?: string },
  ): Promise<PaginatedResult<DiscountCoupon>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<DiscountCoupon>>(
      `${V1_BILLING_COUPONS}?${query_string}`,
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

  findOne: async (id: string): Promise<apiResponse<DiscountCoupon>> => {
    return apiGet<DiscountCoupon>(`${V1_BILLING_COUPONS}/${id}`);
  },

  create: async (
    payload: CreateDiscountCouponDto,
  ): Promise<apiResponse<DiscountCoupon>> => {
    return apiPost<DiscountCoupon>(V1_BILLING_COUPONS, payload);
  },

  update: async (
    dto: UpdateDiscountCouponDto,
  ): Promise<apiResponse<DiscountCoupon>> => {
    const { id, ...body } = dto;
    return apiPatch<DiscountCoupon>(`${V1_BILLING_COUPONS}/${id}`, body);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_BILLING_COUPONS}/${id}`);
  },
};
