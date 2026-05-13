/** Base URL del API Nest (sin barra final). En Vite usa prefijo VITE_. */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const app_mode = import.meta.env.MODE
