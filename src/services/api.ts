import { API_URL } from "@/constants/env.constants"

export interface apiResponse<T> {
  message: string
  status: number
  ok: boolean
  data: T
}

const build_api_url = (path: string) => {
  const base = API_URL.replace(/\/$/, "")
  const normalized_path = path.startsWith("/") ? path : `/${path}`
  if (!base) {
    return normalized_path
  }
  return `${base}${normalized_path}`
}

export const fetchWithAuth = async <T>(
  path: string,
  options: RequestInit,
): Promise<apiResponse<T>> => {
  const request_url = build_api_url(path)
  const res = await fetch(request_url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const body: unknown = await res.json()

  
  if (!res.ok && res.status !== 401) {
    const err = body as { message?: string }
    return {
      message: err?.message ?? res.statusText,
      status: res.status,
      ok: false,
      data: null as T,
    }
  }

  if (res.status === 401 && !window.location.pathname.includes("/signIn/")) {
    window.location.href = "/signIn/";
    return {
      message: "Unauthorized",
      status: res.status,
      ok: false,
      data: null as T,
    }
  }
  return {
    message: (body as { message?: string })?.message ?? "",
    status: res.status,
    ok: true,
    data: body as T,
  }
}

export const apiGet = async <T>(path: string): Promise<apiResponse<T>> => {
  return fetchWithAuth<T>(path, { method: "GET" })
}

export const apiPost = async <T>(path: string, body: unknown): Promise<apiResponse<T>> => {
  return fetchWithAuth<T>(path, { method: "POST", body: JSON.stringify(body) })
}

export const apiPut = async <T>(path: string, body: unknown): Promise<apiResponse<T>> => {
  return fetchWithAuth<T>(path, { method: "PUT", body: JSON.stringify(body) })
}

export const apiDelete = async <T>(path: string): Promise<apiResponse<T>> => {
  return fetchWithAuth<T>(path, { method: "DELETE" })
}
