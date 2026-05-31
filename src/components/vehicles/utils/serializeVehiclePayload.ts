import { TEMP_STORAGE_SEGMENT } from "@/services/files/temp-storage-path";
import type { UpdateVehicleSchema, VehicleSchema } from "../types/vehicles.types";

const is_temp_storage_path = (stored_path: string): boolean => {
  const normalized = stored_path.trim().replace(/^\/+/, "");
  if (!normalized) {
    return false;
  }
  return normalized.split("/").filter(Boolean).includes(TEMP_STORAGE_SEGMENT);
};

const catalog_form_field_keys = [
  "catalog_make_id",
  "catalog_model_id",
  "catalog_body_type_id",
  "catalog_fuel_type_id",
  "catalog_year_id",
] as const;

export const serializeVehiclePayload = (
  data: VehicleSchema | UpdateVehicleSchema,
  options?: { only_temp_images?: boolean; is_update?: boolean },
) => {
  const { phone, images, vehicle_price_id, ...rest } = data;
  void data.videos;

  const payload: Record<string, unknown> = {
    ...rest,
    phone_code: phone?.phone_code,
    phone: phone?.phone,
  };

  for (const key of catalog_form_field_keys) {
    delete payload[key];
  }

  if (options?.is_update && vehicle_price_id) {
    payload.vehicle_price_id = vehicle_price_id;
  }

  if (images !== undefined) {
    const filtered_images = options?.only_temp_images
      ? images.filter((image) => is_temp_storage_path(image.path))
      : images;

    if (filtered_images.length > 0) {
      payload.images = filtered_images;
    }
  }

  return payload;
};
