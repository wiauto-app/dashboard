import { apiDelete, apiGet, apiPatch, apiPost, type apiResponse } from "@/services/api"
import type { Permission, PermissionParams } from "../types/permission.type"
import { V1_PERMISSIONS } from "./route.constants"
import type { PaginatedResult } from "@/types/general.types"
import { objectToQueryString } from "@/lib/utils"

export interface CreatePermissionDto {
  name: string;
  key: string;
  value?: number;
}

export interface UpdatePermissionDto {
  name?: string;
  key?: string;
  value?: number;
}

export const permissionService = {
  async findAll(filter?: PermissionParams): Promise<PaginatedResult<Permission>> {
    const queryString = objectToQueryString(filter);
    const response = await apiGet<PaginatedResult<Permission>>(V1_PERMISSIONS + `?${queryString}`)
    return response.data
  },
  async findOne(id: string): Promise<apiResponse<Permission>> {
    const response = await apiGet<Permission>(V1_PERMISSIONS + `/${id}`)
    return response
  },
  async createPermission(data: CreatePermissionDto): Promise<apiResponse<Permission>> {
    const response = await apiPost<Permission>(V1_PERMISSIONS, data)
    return response
  },
  async updatePermission(id: string, data: UpdatePermissionDto): Promise<apiResponse<Permission>> {
    const response = await apiPatch<Permission>(V1_PERMISSIONS + `/${id}`, data)
    return response
  },
  async deletePermission(id: string): Promise<apiResponse<void>> {
    const response = await apiDelete<void>(V1_PERMISSIONS + `/${id}`)
    return response
  },
}