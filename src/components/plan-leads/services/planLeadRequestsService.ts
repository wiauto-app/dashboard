import {
  apiGet,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_ADMIN_PLAN_LEAD_REQUESTS } from "./route.constants";

export type PlanLeadRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  created_at: string;
  updated_at: string;
};

export const planLeadRequestsService = {
  findAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResult<PlanLeadRequest>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<PlanLeadRequest>>(
      `${V1_ADMIN_PLAN_LEAD_REQUESTS}?${query_string}`,
    );
    return response.data;
  },
};
