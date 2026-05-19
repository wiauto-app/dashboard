import type { CatalogItemWithSlug } from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_TRACTIONS } from "./route.constants";

export const tractionsService =
  createCatalogCrudService<CatalogItemWithSlug>(V1_TRACTIONS, "traction");
