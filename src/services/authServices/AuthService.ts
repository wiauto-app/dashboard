import type { User } from "@/interfaces/user.interface"
import { apiGet, apiPost } from "../api"


export const authService = {

  async login(email: string, password: string) {
    return apiPost<{ token: string }>('/auth/admin/login', { email, password })
  },

  async refreshToken(refreshToken: string) {
    return apiPost<{ token: string }>('/auth/refresh-token', { refreshToken })
  },

  async logout() {
    return apiPost<{ message: string }>('/auth/admin/logout', {})
  },

  async getMe() {
    return apiGet<User>('/auth/me')
  },
}