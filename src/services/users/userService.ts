import type { User } from "@/types/user.types"
import {
  updateUserSchema,
} from "@/validations/resources/user.schema"
import { profileSchema } from "@/validations/resources/profile.schema"
import type z from "zod"
import { apiDelete, apiPatch, apiPost, type apiResponse } from "../api"
import { V1_ADMIN_USERS } from "./route.constants"

export type AdminUpdateUserPayload = z.infer<typeof updateUserSchema>
export type AdminUserProfilePayload = z.infer<typeof profileSchema>
export type AdminUpsertUserPayload = AdminUserProfilePayload & {
  email: string;
  password?: string;
}
type AdminUpdateApiPayload = AdminUpdateUserPayload &
  AdminUserProfilePayload & { id: string };

export const userService = {
  async createUser(user: AdminUpsertUserPayload): Promise<apiResponse<User>> {
    const response = await apiPost<User>(V1_ADMIN_USERS, user)
    return response
  },

  async updateUser(
    id: string,
    user: AdminUpsertUserPayload,
  ): Promise<apiResponse<User>> {
    const payload: AdminUpdateApiPayload = {
      id,
      email: user.email,
      name: user.name,
      last_name: user.last_name,
      role_id: user.role_id,
      avatar_url: user.avatar_url,
      ...(user.password ? { password: user.password } : {}),
    };

    const response = await apiPatch<User>(V1_ADMIN_USERS, {
      ...payload,
    })
    return response
  },

  async deleteUser(id: string): Promise<apiResponse<void>> {
    const response = await apiDelete<void>(V1_ADMIN_USERS + `/${id}`)
    return response
  },
}