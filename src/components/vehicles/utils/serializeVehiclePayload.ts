import { TEMP_STORAGE_SEGMENT } from "@/services/files/temp-storage-path";
import type { UpdateVehicleSchema, VehicleSchema } from "../types/vehicles.types";

export const is_temp_storage_path = (stored_path: string): boolean => {
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
  "catalog_fuel_can_charge",
] as const;

export const serializeVehiclePayload = (
  data: VehicleSchema | UpdateVehicleSchema,
  options?: { only_temp_images?: boolean; is_update?: boolean },
) => {
  const { phone, images, vehicle_price_id, videos, ...rest } = data;

  const payload: Record<string, unknown> = {
    ...rest,
    phone_code: phone?.phone_code,
    phone: phone?.phone,
  };

  for (const key of catalog_form_field_keys) {
    delete payload[key];
  }

  delete payload.email;

  if (options?.is_update) {
    delete payload.profile_id;
  }

  if (typeof payload.ref === "string") {
    const trimmed_ref = payload.ref.trim();
    if (!trimmed_ref) {
      delete payload.ref;
    } else {
      payload.ref = trimmed_ref;
    }
  }

  if (options?.is_update) {
    delete payload.profile_id;
    if (vehicle_price_id) {
      payload.vehicle_price_id = vehicle_price_id;
    }
  }

  if (images !== undefined) {
    const filtered_images = options?.only_temp_images
      ? images.filter((image) => is_temp_storage_path(image.path ?? ""))
      : images;

    if (filtered_images.length > 0) {
      payload.images = filtered_images.map((image) => {
        if (image.upload_id) {
          return { upload_id: image.upload_id, order: image.order };
        }

        const path = image.path?.trim();

        if (image.id) {
          if (path && !is_temp_storage_path(path)) {
            return { id: image.id, path, order: image.order };
          }
          return { id: image.id, order: image.order };
        }

        return { path: path ?? "", order: image.order };
      });
    }
  }

  // Update: `videos` es el estado final (`[]` borra todos). Create: se omite si está vacío.
  if (videos !== undefined && (options?.is_update || videos.length > 0)) {
    payload.videos = [...videos]
      .sort((a, b) => a.order - b.order)
      .map((video, index) =>
        video.upload_id
          ? { upload_id: video.upload_id, order: index }
          : { id: video.id, order: index },
      );
  }

  return payload;
};
