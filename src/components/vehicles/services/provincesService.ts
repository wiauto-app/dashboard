import type { ProvinceCatalogItem } from "@/components/locations/types/location.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_PROVINCES } from "./route.constants";

export const provincesService = createCatalogCrudService<ProvinceCatalogItem>(
  V1_PROVINCES,
  "province",
);
