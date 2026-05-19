import type { DgtLabelCatalogItem } from "../types/catalog.types";
import { dgtLabelsService } from "../services/dgtLabelsService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const dgtLabelsActions = (
  row: DgtLabelCatalogItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: dgtLabelsService.delete,
    title: "Eliminar etiqueta DGT",
    description:
      "¿Eliminar esta etiqueta ambiental del catálogo? Verifica dependencias en anuncios.",
    successToast: "Etiqueta DGT eliminada correctamente",
    errorToast: "Error al eliminar la etiqueta DGT",
  }),
];
