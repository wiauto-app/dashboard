import { getImageUrl } from "@/lib/utils";

import type { VehicleFormImage } from "../schemas/vehicle.schema";

export const getVehicleFormImageDisplayUrl = (
  image: Pick<VehicleFormImage, "path" | "preview_url">,
): string | undefined => {
  const preview = image.preview_url?.trim();
  if (preview) {
    return preview;
  }

  const path = image.path?.trim();
  if (path) {
    return getImageUrl(path);
  }

  return undefined;
};
