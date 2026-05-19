/** Base URL del API Nest (sin barra final). En Vite usa prefijo VITE_. */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
export const getMapsApiKey = (): string => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!key) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set")
  }
  return key
}

export const GOOGLE_MAPS_API_KEY = getMapsApiKey()
export const app_mode = import.meta.env.MODE
