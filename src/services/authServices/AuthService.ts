import type { User } from "@/types/user.types"
import { apiGet, apiPost } from "../api"


export const authService = {

  async login(email: string, password: string) {
    const response = await apiPost<{ token: string }>('/auth/admin/login', { email, password })
    return response
  },

  async refreshToken() {
    return await apiPost<{ token: string }>('/auth/admin/refresh',{})
  },

  async logout() {
    return await apiPost<{ message: string }>('/auth/admin/logout', {})
  },

  async getMe() {
    return await apiGet<User>('/auth/me')
  },
}