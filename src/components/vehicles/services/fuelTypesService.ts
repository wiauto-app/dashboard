import { objectToQueryString } from "@/lib/utils";
import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CatalogFuelTypeItem,
  CatalogFuelTypePaginationParams,
} from "../types/catalog.types";
import { V1_CATALOG_FUEL_TYPES } from "./route.constants";

type FuelTypeResponse = { fuel_type: CatalogFuelTypeItem };

export const fuelTypesService = {
  findAll: async (
    params: CatalogFuelTypePaginationParams,
  ): Promise<PaginatedResult<CatalogFuelTypeItem>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<CatalogFuelTypeItem>>(
      `${V1_CATALOG_FUEL_TYPES}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: number): Promise<CatalogFuelTypeItem> => {
    const response = await apiGet<FuelTypeResponse>(`${V1_CATALOG_FUEL_TYPES}/${id}`);
    return response.data.fuel_type;
  },
};
