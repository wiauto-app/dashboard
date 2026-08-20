import { apiDelete, apiGet, apiPut, type apiResponse } from "@/services/api";

const V1_ADMIN_PLAN_ACCESS_GRANTS = "v1/admin/plan-access-grants";

export interface PlanAccessGrant {
  id: string;
  profile_id: string;
  plan_id: string;
  plan_name: string;
  plan_version_id: string;
  plan_version: number;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AssignPlanAccessGrantInput {
  plan_id: string;
  expires_at?: string | null;
  reason?: string | null;
}

export const planAccessGrantService = {
  getActive: async (profile_id: string): Promise<PlanAccessGrant | null> => {
    const response = await apiGet<PlanAccessGrant | null>(
      `${V1_ADMIN_PLAN_ACCESS_GRANTS}/profiles/${profile_id}`,
    );
    return response.ok ? response.data : null;
  },

  assign: async (
    profile_id: string,
    input: AssignPlanAccessGrantInput,
  ): Promise<apiResponse<PlanAccessGrant>> => {
    return apiPut<PlanAccessGrant>(
      `${V1_ADMIN_PLAN_ACCESS_GRANTS}/profiles/${profile_id}`,
      input,
    );
  },

  revoke: async (profile_id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(
      `${V1_ADMIN_PLAN_ACCESS_GRANTS}/profiles/${profile_id}`,
    );
  },
};
