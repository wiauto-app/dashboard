import type { MunicipalityCatalogItem } from "@/components/locations/types/location.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_MUNICIPALITIES } from "./route.constants";

export const municipalitiesService =
  createCatalogCrudService<MunicipalityCatalogItem>(
    V1_MUNICIPALITIES,
    "municipality",
  );
