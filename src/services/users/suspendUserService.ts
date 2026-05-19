import type { SuspendUserSchema } from "@/types/user.types";
import { apiPost } from "../api";
import { V1_USER_SUSPENSIONS } from "./route.constants";


export const suspendUserService = {
  async suspendUser(target_user_id: string, data: SuspendUserSchema) {
    const response = await apiPost<void>(`${V1_USER_SUSPENSIONS}/suspend`, {
      target_user_id: target_user_id,
      ...data,
    });
    return response;
  },

  async unsuspendUser(target_user_id: string) {
    const response = await apiPost<void>(`${V1_USER_SUSPENSIONS}/unsuspend`, {
      target_user_id: target_user_id,
    });
    return response;
  },
}