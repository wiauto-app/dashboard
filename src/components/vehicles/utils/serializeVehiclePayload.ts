import { TEMP_STORAGE_SEGMENT } from "@/services/files/temp-storage-path";
import type { UpdateVehicleSchema, VehicleSchema } from "../types/vehicles.types";

const is_temp_storage_path = (stored_path: string): boolean => {
  const normalized = stored_path.trim().replace(/^\/+/, "");
  if (!normalized) {
    return false;
  }
  return normalized.split("/").filter(Boolean).includes(TEMP_STORAGE_SEGMENT);
};

export const serializeVehiclePayload = (
  data: VehicleSchema | UpdateVehicleSchema,
  options?: { only_temp_images?: boolean },
) => {
  const { phone, videos: _videos, images, ...rest } = data;

  const payload: Record<string, unknown> = {
    ...rest,
    phone_code: phone?.phone_code,
    phone: phone?.phone,
  };

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
