import { objectToQueryString } from "@/lib/utils";
import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CatalogBodyTypeItem,
  CatalogBodyTypePaginationParams,
} from "../types/catalog.types";
import { V1_CATALOG_BODY_TYPES } from "./route.constants";

type BodyTypeResponse = { body_type: CatalogBodyTypeItem };

export const bodyTypesService = {
  findAll: async (
    params: CatalogBodyTypePaginationParams,
  ): Promise<PaginatedResult<CatalogBodyTypeItem>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<CatalogBodyTypeItem>>(
      `${V1_CATALOG_BODY_TYPES}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: number): Promise<CatalogBodyTypeItem> => {
    const response = await apiGet<BodyTypeResponse>(`${V1_CATALOG_BODY_TYPES}/${id}`);
    return response.data.body_type;
  },
};
