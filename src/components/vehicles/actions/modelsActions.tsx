import type { CatalogModelItem } from "../types/catalog.types";
import { modelService } from "../services/modelService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const modelsActions = (
  row: CatalogModelItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(String(row.id), onSuccess, {
    deleteFn: modelService.delete,
    title: "Eliminar modelo",
    description:
      "¿Eliminar este modelo del catálogo? Los anuncios que lo usan pueden dejar de mostrarlo.",
    successToast: "Modelo eliminado correctamente",
    errorToast: "Error al eliminar el modelo",
  }),
];
