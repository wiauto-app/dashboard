import { apiGet, apiPatch, type apiResponse } from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_ADMIN_PLAN_CONTACT_LEADS } from "./route.constants";

export type PlanContactLeadStatus = "pending" | "contacted" | "closed";

export interface PlanContactLead {
  id: string;
  phone: string;
  source: string;
  status: PlanContactLeadStatus;
  created_at: string;
  updated_at: string;
}

export interface UpdatePlanContactLeadDto {
  status: PlanContactLeadStatus;
}

export const PLAN_CONTACT_LEAD_STATUS_LABELS: Record<
  PlanContactLeadStatus,
  string
> = {
  pending: "Pendiente",
  contacted: "Contactado",
  closed: "Cerrado",
};

export const planContactLeadsService = {
  findAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResult<PlanContactLead>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<PlanContactLead>>(
      `${V1_ADMIN_PLAN_CONTACT_LEADS}?${query_string}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<PlanContactLead>> => {
    return apiGet<PlanContactLead>(`${V1_ADMIN_PLAN_CONTACT_LEADS}/${id}`);
  },

  update: async (
    id: string,
    dto: UpdatePlanContactLeadDto,
  ): Promise<apiResponse<PlanContactLead>> => {
    return apiPatch<PlanContactLead>(
      `${V1_ADMIN_PLAN_CONTACT_LEADS}/${id}`,
      dto,
    );
  },
};
