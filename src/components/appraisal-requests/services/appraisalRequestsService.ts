import { apiGet, apiPatch, type apiResponse } from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult } from "@/types/general.types";

import type { AppraisalRequestsParams } from "../schemas/appraisal-requests-params.schema";
import type {
  AppraisalRequestListItem,
  RespondAppraisalRequestPayload,
} from "../types/appraisal-request.types";
import { V1_ADMIN_APPRAISAL_REQUESTS } from "./route.constants";

export const appraisalRequestsService = {
  findAll: async (
    params?: AppraisalRequestsParams,
  ): Promise<PaginatedResult<AppraisalRequestListItem>> => {
    const merged: Record<string, string | number | undefined> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      status: params?.status,
      priority: params?.priority,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<AppraisalRequestListItem>>(
      `${V1_ADMIN_APPRAISAL_REQUESTS}${query_string ? `?${query_string}` : ""}`,
    );
    return response.data;
  },

  respond: async (
    id: string,
    payload: RespondAppraisalRequestPayload,
  ): Promise<apiResponse<AppraisalRequestListItem>> => {
    return apiPatch<AppraisalRequestListItem>(
      `${V1_ADMIN_APPRAISAL_REQUESTS}/${id}/respond`,
      payload,
    );
  },

  close: async (id: string): Promise<apiResponse<AppraisalRequestListItem>> => {
    return apiPatch<AppraisalRequestListItem>(
      `${V1_ADMIN_APPRAISAL_REQUESTS}/${id}/close`,
      {},
    );
  },
};
