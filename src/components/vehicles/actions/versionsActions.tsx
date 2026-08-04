import type { CatalogVersionItem } from "../types/catalog.types";
import { catalogVersionsService } from "../services/catalogVersionsService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const versionsActions = (
  row: CatalogVersionItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(String(row.id), onSuccess, {
    deleteFn: catalogVersionsService.delete,
    title: "Eliminar versión",
    description:
      "¿Eliminar esta versión del catálogo? Los anuncios que la usan pueden dejar de mostrarla.",
    successToast: "Versión eliminada correctamente",
    errorToast: "Error al eliminar la versión",
  }),
];
