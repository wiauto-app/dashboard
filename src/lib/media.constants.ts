/**
 * URL pública del CDN de media (`https://media.wiauto.es`).
 * Pathnames: `/{bucket}/{key}`. Los PUT firmados usan el host de la URL firmada (API R2), no este.
 * `VITE_MINIO_ENDPOINT` se mantiene como fallback temporal.
 */
export const MEDIA_URL =
  import.meta.env.VITE_MEDIA_URL ?? import.meta.env.VITE_MINIO_ENDPOINT;
