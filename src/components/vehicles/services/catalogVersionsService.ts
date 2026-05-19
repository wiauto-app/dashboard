import { objectToQueryString } from "@/lib/utils";
import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogVersionItem, CatalogVersionPaginationParams } from "../types/catalog.types";
import { V1_CATALOG_VERSIONS } from "./route.constants";

type VersionResponse = { version: CatalogVersionItem };

const DEFAULT_LIMIT = 100;

export const catalogVersionsService = {
  findAll: async (
    params: CatalogVersionPaginationParams = {
      page: 1,
      limit: DEFAULT_LIMIT,
    },
  ): Promise<PaginatedResult<CatalogVersionItem>> => {
    const queryString = objectToQueryString({
      ...params,
      page: params.page ?? 1,
      limit: params.limit ?? DEFAULT_LIMIT,
    });
    const response = await apiGet<PaginatedResult<CatalogVersionItem>>(
      `${V1_CATALOG_VERSIONS}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: number): Promise<CatalogVersionItem> => {
    const response = await apiGet<VersionResponse>(`${V1_CATALOG_VERSIONS}/${id}`);
    return response.data.version;
  },
};
