import type { CommunityCatalogItem } from "@/components/locations/types/location.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_COMMUNITIES } from "./route.constants";

export const communitiesService = createCatalogCrudService<CommunityCatalogItem>(
  V1_COMMUNITIES,
  "community",
);
