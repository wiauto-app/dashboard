import { API_URL } from "@/constants/env.constants"

export interface apiResponse<T> {
  ok: boolean,
  message: string,
  data: T,
  status: number,
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
  options: RequestInit & { noResponse?: boolean; _auth_retry_count?: number } = {},
): Promise<apiResponse<T>> => {

  const request_url = build_api_url(path)

  const {
    noResponse,
    _auth_retry_count = 0,
    headers: request_headers,
    ...fetch_options
  } = options

  const is_signin_route = window.location.pathname.includes("/signIn")
  const is_auth_refresh_request = request_url.includes("/auth/admin/refresh")
  const is_auth_logout_request = request_url.includes("/auth/admin/logout")

  const best_effort_raw_logout = async () => {
    try {
      await fetch(`${API_URL}/auth/admin/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
    } catch {
      // Intencional: logout es best-effort; lo importante es redirigir.
    }
  }

  const res = await fetch(request_url, {
    ...fetch_options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...request_headers,
    },
  })

  if (
    res.status === 401 &&
    !is_signin_route &&
    !is_auth_refresh_request &&
    !is_auth_logout_request
  ) {
    if (_auth_retry_count >= 1) {
      await best_effort_raw_logout()
      window.location.href = "/signIn"
      return {
        ok: false,
        message: "Sesión expirada",
        status: res.status,
        data: null as T,
      }
    }

    const refresh_response = await fetch(`${API_URL}/auth/admin/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (refresh_response.ok) {
      return fetchWithAuth<T>(path, {
        ...options,
        _auth_retry_count: _auth_retry_count + 1,
      })
    }

    await best_effort_raw_logout()
    window.location.href = "/signIn"
    return {
      ok: false,
      message: "Sesión expirada",
      status: res.status,
      data: null as T,
    }
  }

  if (noResponse) {
    return {
      ok: res.ok,
      message: res.statusText,
      status: res.status,
      data: null as T,
    }
  }

  return (await res.json()) as apiResponse<T>
}
export const apiGet = async <T>(path: string): Promise<apiResponse<T>> => {
  return fetchWithAuth<T>(path, { method: "GET" })
}

export const apiPost = async <T>(path: string, body: unknown): Promise<apiResponse<T>> => {
  return fetchWithAuth<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
}

export const apiPut = async <T>(path: string, body: unknown): Promise<apiResponse<T>> => {
  return fetchWithAuth<T>(path, { method: "PUT", body: JSON.stringify(body) })
}

export const apiDelete = async <T>(path: string, body?: unknown): Promise<apiResponse<T>> => {
  const options: RequestInit & { noResponse?: boolean } = {
    method: "DELETE",
    noResponse: true,
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  return fetchWithAuth<T>(path, options);
}

export const apiPatch = async <T>(path: string, body: unknown): Promise<apiResponse<T>> => {
  return fetchWithAuth<T>(path, { method: "PATCH", body: JSON.stringify(body) })
}

export const uploadSignedFile = async <T>(
  url: string,
  file: File,
  opts?: { content_type?: string },
): Promise<apiResponse<T>> => {
  const content_type =
    opts?.content_type?.trim() ||
    file.type.trim() ||
    "application/octet-stream";
  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": content_type,
    },
  })
  if (!response.ok) {
    return {
      message: response.statusText,
      status: response.status,
      ok: false,
      data: null as T,
    }
  }
  return {
    message: response.statusText,
    status: response.status,
    ok: true,
    data: response.body as T,
  }
}