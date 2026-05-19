import type { DgtLabelCatalogItem } from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_DGT_LABELS } from "./route.constants";

export const dgtLabelsService =
  createCatalogCrudService<DgtLabelCatalogItem>(V1_DGT_LABELS, "dgt_label");
