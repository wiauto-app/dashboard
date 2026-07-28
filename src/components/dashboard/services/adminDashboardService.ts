import { apiGet } from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type {
  AdminDashboardParams,
  AdminDashboardResponse,
} from "../types/admin-dashboard.types";
import { V1_ADMIN_DASHBOARD } from "./route.constants";

export const adminDashboardService = {
  getOverview: async (
    params: AdminDashboardParams,
  ): Promise<AdminDashboardResponse> => {
    const queryString = objectToQueryString({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await apiGet<AdminDashboardResponse>(
      `${V1_ADMIN_DASHBOARD}${queryString ? `?${queryString}` : ""}`,
    );

    if (!response.ok || !response.data) {
      throw new Error(
        response.message || "No se pudo cargar el panel de administración",
      );
    }

    return response.data;
  },
};
