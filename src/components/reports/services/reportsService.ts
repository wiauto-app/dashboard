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
  CreateReportPayload,
  ReportListItem,
  UpdateReportPayload,
} from "../types/report.types";
import type { ReportsParams } from "../schemas/reports-params.schema";
import { V1_ADMIN_REPORTS } from "./route.constants";

export const reportsService = {
  findAll: async (
    params?: ReportsParams,
  ): Promise<PaginatedResult<ReportListItem>> => {
    const merged: Record<string, string | number | undefined> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      query: params?.search,
      status: params?.status,
      target_type: params?.target_type,
      category_id: params?.category_id,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<ReportListItem>>(
      `${V1_ADMIN_REPORTS}${query_string ? `?${query_string}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<ReportListItem>> => {
    return apiGet<ReportListItem>(`${V1_ADMIN_REPORTS}/${id}`);
  },

  create: async (
    payload: CreateReportPayload,
  ): Promise<apiResponse<ReportListItem>> => {
    const body = {
      ...payload,
      file_url: payload.file_url?.trim() ? payload.file_url : null,
    };
    return apiPost<ReportListItem>(V1_ADMIN_REPORTS, body);
  },

  update: async (
    id: string,
    payload: UpdateReportPayload,
  ): Promise<apiResponse<ReportListItem>> => {
    const body = {
      ...payload,
      ...(payload.file_url !== undefined
        ? {
            file_url: payload.file_url?.trim() ? payload.file_url : null,
          }
        : {}),
      ...(payload.admin_notes !== undefined
        ? {
            admin_notes: payload.admin_notes?.trim()
              ? payload.admin_notes.trim()
              : null,
          }
        : {}),
    };
    return apiPatch<ReportListItem>(`${V1_ADMIN_REPORTS}/${id}`, body);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_ADMIN_REPORTS}/${id}`);
  },
};
