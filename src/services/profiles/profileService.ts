import type { Profile, UserParams } from "@/types/profiles.types"
import { apiGet, apiPost } from "../api"
import { V1_PROFILES, V1_USERS } from "./route.constants"
import type { PaginatedResult } from "@/types/general.types"
import { objectToQueryString } from "@/lib/utils"
import type { UserSchema } from "@/validations/resources/user.schema"


export const profileService = {
  async getProfiles(filter?: UserParams): Promise<PaginatedResult<Profile> | null> {
    const queryString = objectToQueryString(filter);
    const response = await apiGet<PaginatedResult<Profile>>(V1_PROFILES + `?${queryString}`)
    if(!response.ok) {
      return null
    }
    return response.data
  },

  async createProfile(profile: UserSchema): Promise<Profile | null> {
    const response = await apiPost<Profile>(V1_USERS, profile)
    if(!response.ok) {
      return null
    }
    console.log(response)
    return response.data
  }
}