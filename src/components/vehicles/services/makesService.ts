import type { CatalogMakeItem } from "@/components/vehicles/types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_CATALOG_MAKES } from "./route.constants";

export const makesService = createCatalogCrudService<CatalogMakeItem>(
  V1_CATALOG_MAKES,
  "make",
);
