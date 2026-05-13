import type { Role } from "@/types/profiles.types"
import { apiGet } from "../api"
import { V1_ROLES } from "./route.constants"


export const rolesService = {
  async getRoles(): Promise<Role[]> {
    const response = await apiGet<Role[]>(V1_ROLES)
    return response.data
  }
}