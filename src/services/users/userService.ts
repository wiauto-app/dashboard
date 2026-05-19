import type { User } from "@/types/user.types"
import {
  updateUserSchema,
  type UserSchema,
} from "@/validations/resources/user.schema"
import type z from "zod"
import { apiDelete, apiPatch, apiPost, type apiResponse } from "../api"
import { V1_ADMIN_USERS } from "./route.constants"

export type AdminUpdateUserPayload = z.infer<typeof updateUserSchema>

export const userService = {
  async createUser(user: UserSchema): Promise<apiResponse<User>> {
    const response = await apiPost<User>(V1_ADMIN_USERS, user)
    return response
  },

  async updateUser(
    id: string,
    user: AdminUpdateUserPayload,
  ): Promise<apiResponse<User>> {
    const response = await apiPatch<User>(V1_ADMIN_USERS, {
      id,
      ...user,
    })
    return response
  },

  async deleteUser(id: string): Promise<apiResponse<void>> {
    const response = await apiDelete<void>(V1_ADMIN_USERS + `/${id}`)
    return response
  },
}