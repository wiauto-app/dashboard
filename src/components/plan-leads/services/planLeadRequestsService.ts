import {
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import type { PlanEntitlementInput } from "@/components/billing/services/billingPlansService";
import { V1_ADMIN_PLAN_LEAD_REQUESTS } from "./route.constants";

export type PlanLeadStatus =
  | "pending"
  | "contacted"
  | "proposal_sent"
  | "accepted"
  | "rejected"
  | "cancelled";

export type PlanLeadCarsQuantity =
  | "1-10"
  | "11-20"
  | "21-50"
  | "51-100"
  | "101+";

export type PlanLeadInterval = "month" | "year" | "one_time";

export interface PlanLeadRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  cars_quantity: PlanLeadCarsQuantity | string;
  message: string | null;
  profile_id?: string | null;
  status: PlanLeadStatus;
  base_plan_id?: string | null;
  proposed_price_cents?: number | null;
  proposed_interval?: PlanLeadInterval | null;
  proposed_stripe_price_id?: string | null;
  proposal_notes?: string | null;
  proposed_overrides?: PlanEntitlementInput[] | null;
  created_at: string;
  updated_at: string;
}

export interface UpdatePlanLeadRequestDto {
  status?: PlanLeadStatus;
  base_plan_id?: string | null;
  proposed_price_cents?: number | null;
  proposed_interval?: PlanLeadInterval | null;
  proposal_notes?: string | null;
  proposed_overrides?: PlanEntitlementInput[];
}

export interface CreatePlanLeadProposalDto {
  base_plan_id: string;
  proposed_price_cents: number;
  proposed_interval: PlanLeadInterval;
  proposal_notes?: string | null;
  proposed_overrides?: PlanEntitlementInput[];
}

export const PLAN_LEAD_STATUS_LABELS: Record<PlanLeadStatus, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  proposal_sent: "Propuesta enviada",
  accepted: "Aceptado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
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

  findOne: async (id: string): Promise<apiResponse<PlanLeadRequest>> => {
    return apiGet<PlanLeadRequest>(`${V1_ADMIN_PLAN_LEAD_REQUESTS}/${id}`);
  },

  update: async (
    id: string,
    dto: UpdatePlanLeadRequestDto,
  ): Promise<apiResponse<PlanLeadRequest>> => {
    return apiPatch<PlanLeadRequest>(`${V1_ADMIN_PLAN_LEAD_REQUESTS}/${id}`, dto);
  },

  createProposal: async (
    id: string,
    dto: CreatePlanLeadProposalDto,
  ): Promise<apiResponse<PlanLeadRequest>> => {
    return apiPost<PlanLeadRequest>(
      `${V1_ADMIN_PLAN_LEAD_REQUESTS}/${id}/proposal`,
      dto,
    );
  },
};
