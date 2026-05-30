import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CreateTicketCategoryPayload,
  TicketCategoryItem,
  UpdateTicketCategoryPayload,
} from "../types/ticket-category.types";
import type { SupportCatalogParams } from "../schemas/support-catalog-params.schema";
import { V1_TICKET_CATEGORIES } from "./route.constants";

export const ticketCategoriesService = {
  findAll: async (
    params?: SupportCatalogParams,
  ): Promise<PaginatedResult<TicketCategoryItem>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<TicketCategoryItem>>(
      `${V1_TICKET_CATEGORIES}${query_string ? `?${query_string}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<TicketCategoryItem>> => {
    return apiGet<TicketCategoryItem>(`${V1_TICKET_CATEGORIES}/${id}`);
  },

  create: async (
    payload: CreateTicketCategoryPayload,
  ): Promise<apiResponse<TicketCategoryItem>> => {
    return apiPost<TicketCategoryItem>(V1_TICKET_CATEGORIES, payload);
  },

  update: async (
    payload: UpdateTicketCategoryPayload,
  ): Promise<apiResponse<TicketCategoryItem>> => {
    return apiPatch<TicketCategoryItem>(V1_TICKET_CATEGORIES, payload);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_TICKET_CATEGORIES}/${id}`);
  },
};
