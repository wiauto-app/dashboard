import { apiDelete, apiGet, apiPatch, apiPost, type apiResponse } from "@/services/api"
import { V1_ROLES } from "@/components/roles/services/route.constants"
import type { Role, RolesParams } from "@/components/roles/types/role.types"
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult } from "@/types/general.types";

interface RoleDto {
  name: string;
  is_admin: boolean;
  is_developer: boolean;
  is_default?: boolean;
}

interface UpdateRoleDto {
  name?: string;
  is_admin?: boolean;
  is_developer?: boolean;
  is_default?: boolean;
}

export const rolesService = {
  async findAll(params?: RolesParams): Promise<PaginatedResult<Role>> {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<Role>>(V1_ROLES + `?${queryString}`)
    return response.data
  },
  async findOne(id: string): Promise<apiResponse<Role>> {
    const response = await apiGet<Role>(V1_ROLES + `/${id}`)
    return response
  },
  async create(role: RoleDto): Promise<apiResponse<Role>> {
    const response = await apiPost<Role>(V1_ROLES, role)
    return response
  },
  async update(id: string, role: UpdateRoleDto): Promise<apiResponse<Role>> {
    const response = await apiPatch<Role>(V1_ROLES + `/${id}`, role)
    return response
  },
  async delete(id: string): Promise<apiResponse<void>> {
    const response = await apiDelete<void>(V1_ROLES + `/${id}`)
    return response
  }
}