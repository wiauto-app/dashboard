import type { Profile, UserParams } from "@/types/profiles.types"
import { apiDelete, apiGet, apiPatch, apiPost } from "../api"
import { V1_ADMIN_PROFILES, V1_PROFILES } from "./route.constants"
import type { PaginatedResult } from "@/types/general.types"
import { objectToQueryString } from "@/lib/utils"
import type { ProfileSchema } from "@/validations/resources/profile.schema"


export const profileService = {
  async getProfiles(filter?: UserParams): Promise<PaginatedResult<Profile> | null> {
    const queryString = objectToQueryString(filter);
    const response = await apiGet<PaginatedResult<Profile>>(V1_PROFILES + `?${queryString}`)
    if (!response.ok) {
      return null
    }
    return response.data
  },

  async getProfile(id: string): Promise<Profile | null> {
    const response = await apiGet<Profile>(V1_PROFILES + `/${id}`)
    if (!response.ok) {
      return null
    }
    return response.data
  },

  async createProfile(id: string, profile: ProfileSchema) {
    const response = await apiPost<Profile>(V1_ADMIN_PROFILES, {
      id,
      ...profile,
    })
    return response
  },


  async updateProfile(id: string, profile: ProfileSchema) {
    const response = await apiPatch<Profile>(V1_ADMIN_PROFILES, {
      id,
      ...profile,
    })
    return response
  },

  async deleteProfile(id: string): Promise<void> {
    const response = await apiDelete<void>(V1_ADMIN_PROFILES + `/${id}`)
    if (!response.ok) {
      return
    }
    return response.data
  },
}