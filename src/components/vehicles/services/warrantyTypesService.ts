import type { WarrantyTypeCatalogItem } from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_WARRANTY_TYPES } from "./route.constants";

export const warrantyTypesService =
  createCatalogCrudService<WarrantyTypeCatalogItem>(
    V1_WARRANTY_TYPES,
    "warranty_type",
  );
