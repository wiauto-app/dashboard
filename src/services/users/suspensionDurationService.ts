import type { SuspensionDurationType } from "@/types/suspension-duration.types";
import { apiDelete, apiGet, apiPost, apiPut } from "../api";
import { V1_ADMIN_SUSPENSION } from "./route.constants";
import type { PaginatedResult } from "@/types/general.types";


export interface CreateSuspensionDurationTypeDto {
  key: string;
  label: string;
  duration_ms: string | null;
  is_active: boolean;
}

export interface UpdateSuspensionDurationTypeDto extends CreateSuspensionDurationTypeDto {
  id: string;
}

export const suspensionDurationService = {
  async findAll() {
    const response = await apiGet<PaginatedResult<SuspensionDurationType>>(V1_ADMIN_SUSPENSION);
    return response;
  },

  async findOne(id: string) {
    const response = await apiGet<SuspensionDurationType>(`${V1_ADMIN_SUSPENSION}/${id}`);
    return response;
  },

  async create(suspensionDurationType: CreateSuspensionDurationTypeDto) {
    const response = await apiPost<SuspensionDurationType>(V1_ADMIN_SUSPENSION, suspensionDurationType);
    return response;
  },

  async update(id: string, suspensionDurationType: UpdateSuspensionDurationTypeDto) {
    const response = await apiPut<SuspensionDurationType>(`${V1_ADMIN_SUSPENSION}/${id}`, suspensionDurationType);
    return response;
  },

  async delete(id: string) {
    const response = await apiDelete(`${V1_ADMIN_SUSPENSION}/${id}`);
    return response;
  },
}
