import type { VehicleServiceCatalogItem } from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_SERVICES } from "./route.constants";

/** Catálogo de servicios opcionales asociables a vehículos (`v1/services`). */
export const catalogServicesService =
  createCatalogCrudService<VehicleServiceCatalogItem>(V1_SERVICES, "service");
