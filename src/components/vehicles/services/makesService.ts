import { apiGet } from "@/services/api";
import type { PaginationParams } from "@/types/general.types";
import type { CatalogMakeItem } from "../types/catalog.types";
import { createPaginatedListService } from "./createPaginatedListService";
import { V1_CATALOG_MAKES } from "./route.constants";

const listService = createPaginatedListService<CatalogMakeItem>(V1_CATALOG_MAKES);

type MakeResponse = { make: CatalogMakeItem };

export const makesService = {
  findAll: (params: PaginationParams) => listService.findAll(params),

  findOne: async (id: number): Promise<CatalogMakeItem> => {
    const response = await apiGet<MakeResponse>(`${V1_CATALOG_MAKES}/${id}`);
    return response.data.make;
  },
};
