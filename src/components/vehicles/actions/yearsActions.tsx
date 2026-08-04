import type { CatalogYearItem } from "../types/catalog.types";
import { yearsService } from "../services/yearsService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const yearsActions = (row: CatalogYearItem, onSuccess?: () => void) => [
  deleteRowAction(String(row.id), onSuccess, {
    deleteFn: yearsService.delete,
    title: "Eliminar año",
    description:
      "¿Eliminar este año del catálogo? Los anuncios que lo usan pueden dejar de mostrarlo.",
    successToast: "Año eliminado correctamente",
    errorToast: "Error al eliminar el año",
  }),
];
