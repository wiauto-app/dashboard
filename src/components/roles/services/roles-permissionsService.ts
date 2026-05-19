import { apiDelete, apiGet, apiPost, apiPut, type apiResponse } from "@/services/api"
import { V1_ROLES_PERMISSIONS } from "./route.constants"
import type { Permission } from "@/components/permissions/types/permission.type"


interface PermissionDto {
  role_id: string;
  permission_id: string;
}

interface SyncPermissionsDto {
  role_id: string;
  permission_ids: string[];
}
export const rolesPermissionsService = {
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const response = await apiGet<Permission[]>(V1_ROLES_PERMISSIONS + `/${roleId}`)
    return response.data
  },
  async assignPermission(assignPermissionDto: PermissionDto): Promise<apiResponse<void>> {
    const response = await apiPost<void>(V1_ROLES_PERMISSIONS, assignPermissionDto)
    return response
  },
  async removePermission(removePermissionDto: PermissionDto): Promise<apiResponse<void>> {
    const response = await apiDelete<void>(V1_ROLES_PERMISSIONS, removePermissionDto)
    return response
  },
  async syncPermissions(syncPermissionsDto: SyncPermissionsDto): Promise<apiResponse<void>> {
    const response = await apiPut<void>(V1_ROLES_PERMISSIONS , syncPermissionsDto)
    return response
  },
}