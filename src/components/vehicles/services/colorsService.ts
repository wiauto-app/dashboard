import type { ColorCatalogItem } from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_COLORS } from "./route.constants";

export const colorsService =
  createCatalogCrudService<ColorCatalogItem>(V1_COLORS, "color");
