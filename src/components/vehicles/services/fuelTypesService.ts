import { objectToQueryString } from "@/lib/utils";
import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CatalogFuelTypeItem,
  CatalogFuelTypePaginationParams,
} from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_CATALOG_FUEL_TYPES } from "./route.constants";

const crud = createCatalogCrudService<CatalogFuelTypeItem>(
  V1_CATALOG_FUEL_TYPES,
  "fuel_type",
);

export const fuelTypesService = {
  ...crud,
  findAll: async (
    params: CatalogFuelTypePaginationParams = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<CatalogFuelTypeItem>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<CatalogFuelTypeItem>>(
      `${V1_CATALOG_FUEL_TYPES}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },
};
