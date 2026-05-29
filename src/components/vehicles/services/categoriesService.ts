import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import type {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";
import { V1_CATEGORIES } from "./route.constants";

export const categoriesService = {
  findAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResult<CategoryItem>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<CategoryItem>>(
      `${V1_CATEGORIES}${query_string ? `?${query_string}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<CategoryItem>> => {
    return apiGet<CategoryItem>(`${V1_CATEGORIES}/${id}`);
  },

  create: async (
    payload: CreateCategoryPayload,
  ): Promise<apiResponse<CategoryItem>> => {
    return apiPost<CategoryItem>(V1_CATEGORIES, payload);
  },

  update: async (
    payload: UpdateCategoryPayload,
  ): Promise<apiResponse<CategoryItem>> => {
    return apiPatch<CategoryItem>(V1_CATEGORIES, payload);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_CATEGORIES}/${id}`);
  },
};
