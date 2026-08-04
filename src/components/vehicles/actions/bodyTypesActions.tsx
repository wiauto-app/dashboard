import type { CatalogBodyTypeItem } from "../types/catalog.types";
import { bodyTypesService } from "../services/bodyTypesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const bodyTypesActions = (
  row: CatalogBodyTypeItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(String(row.id), onSuccess, {
    deleteFn: bodyTypesService.delete,
    title: "Eliminar carrocería",
    description:
      "¿Eliminar este tipo de carrocería del catálogo? Los anuncios que lo usan pueden dejar de mostrarlo.",
    successToast: "Carrocería eliminada correctamente",
    errorToast: "Error al eliminar la carrocería",
  }),
];
