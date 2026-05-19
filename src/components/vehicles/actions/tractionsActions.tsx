import type { CatalogItemWithSlug } from "../types/catalog.types";
import { tractionsService } from "../services/tractionsService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const tractionsActions = (
  row: CatalogItemWithSlug,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: tractionsService.delete,
    title: "Eliminar tracción",
    description:
      "¿Eliminar esta tracción del catálogo? Los anuncios que la usan pueden verse afectados.",
    successToast: "Tracción eliminada correctamente",
    errorToast: "Error al eliminar la tracción",
  }),
];
