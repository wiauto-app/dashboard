import { objectToQueryString } from "@/lib/utils";
import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CatalogBodyTypeItem,
  CatalogBodyTypePaginationParams,
} from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_CATALOG_BODY_TYPES } from "./route.constants";

const crud = createCatalogCrudService<CatalogBodyTypeItem>(
  V1_CATALOG_BODY_TYPES,
  "body_type",
);

export const bodyTypesService = {
  ...crud,
  findAll: async (
    params: CatalogBodyTypePaginationParams = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<CatalogBodyTypeItem>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<CatalogBodyTypeItem>>(
      `${V1_CATALOG_BODY_TYPES}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },
};
