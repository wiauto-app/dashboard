/** Segmento de ruta provisional; el backend lo elimina al publicar el recurso. */
export const TEMP_STORAGE_SEGMENT = "temp";

/** Prefijo de clave S3 para galería de vehículos en borrador. */
export const VEHICLE_GALLERY_TEMP_PREFIX = "temp/vehicle-gallery";

/**
 * Ruta compuesta enviada al API (`bucket/temp/...`).
 * Debe coincidir con la convención del backend (`temp-storage-path.ts`).
 */
export const build_temp_vehicle_image_compound_path = (
  bucket_name: string,
  object_key: string,
): string => `${bucket_name}/${object_key}`;
