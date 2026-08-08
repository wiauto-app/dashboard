import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_BILLING_FEATURED_LISTING_OFFERS } from "./route.constants";

export interface FeaturedListingOffer {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  boost_weight: number;
  amount_cents: number;
  currency: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFeaturedListingOfferDto {
  title: string;
  description?: string | null;
  duration_days: number;
  boost_weight: number;
  amount_cents: number;
  currency?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateFeaturedListingOfferDto
  extends Partial<CreateFeaturedListingOfferDto> {
  id: string;
}

export const featuredListingOffersService = {
  findAll: async (
    params?: PaginationParams & { search?: string },
  ): Promise<PaginatedResult<FeaturedListingOffer>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<FeaturedListingOffer>>(
      `${V1_BILLING_FEATURED_LISTING_OFFERS}?${query_string}`,
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

  findOne: async (id: string): Promise<apiResponse<FeaturedListingOffer>> => {
    return apiGet<FeaturedListingOffer>(
      `${V1_BILLING_FEATURED_LISTING_OFFERS}/${id}`,
    );
  },

  create: async (
    payload: CreateFeaturedListingOfferDto,
  ): Promise<apiResponse<FeaturedListingOffer>> => {
    return apiPost<FeaturedListingOffer>(
      V1_BILLING_FEATURED_LISTING_OFFERS,
      payload,
    );
  },

  update: async (
    dto: UpdateFeaturedListingOfferDto,
  ): Promise<apiResponse<FeaturedListingOffer>> => {
    const { id, ...body } = dto;
    return apiPatch<FeaturedListingOffer>(
      `${V1_BILLING_FEATURED_LISTING_OFFERS}/${id}`,
      body,
    );
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_BILLING_FEATURED_LISTING_OFFERS}/${id}`);
  },

  syncStripe: async (
    id: string,
  ): Promise<apiResponse<FeaturedListingOffer>> => {
    return apiPost<FeaturedListingOffer>(
      `${V1_BILLING_FEATURED_LISTING_OFFERS}/${id}/sync-stripe`,
    );
  },
};
