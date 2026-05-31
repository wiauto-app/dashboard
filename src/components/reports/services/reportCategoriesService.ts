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
  CreateReportCategoryPayload,
  ReportCategoryItem,
  UpdateReportCategoryPayload,
} from "../types/report-category.types";
import type { ReportsCatalogParams } from "../schemas/reports-catalog-params.schema";
import { V1_ADMIN_REPORT_CATEGORIES } from "./route.constants";

export const reportCategoriesService = {
  findAll: async (
    params?: ReportsCatalogParams,
  ): Promise<PaginatedResult<ReportCategoryItem>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
      target_type: params?.target_type,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<ReportCategoryItem>>(
      `${V1_ADMIN_REPORT_CATEGORIES}${query_string ? `?${query_string}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<ReportCategoryItem>> => {
    return apiGet<ReportCategoryItem>(`${V1_ADMIN_REPORT_CATEGORIES}/${id}`);
  },

  create: async (
    payload: CreateReportCategoryPayload,
  ): Promise<apiResponse<ReportCategoryItem>> => {
    return apiPost<ReportCategoryItem>(V1_ADMIN_REPORT_CATEGORIES, payload);
  },

  update: async (
    payload: UpdateReportCategoryPayload,
  ): Promise<apiResponse<ReportCategoryItem>> => {
    return apiPatch<ReportCategoryItem>(V1_ADMIN_REPORT_CATEGORIES, payload);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_ADMIN_REPORT_CATEGORIES}/${id}`);
  },
};
