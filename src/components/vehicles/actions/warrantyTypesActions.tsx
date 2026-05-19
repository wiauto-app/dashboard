import type { WarrantyTypeCatalogItem } from "../types/catalog.types";
import { warrantyTypesService } from "../services/warrantyTypesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const warrantyTypesActions = (
  row: WarrantyTypeCatalogItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: warrantyTypesService.delete,
    title: "Eliminar tipo de garantía",
    description:
      "¿Eliminar este tipo de garantía del catálogo? Los anuncios asociados pueden verse afectados.",
    successToast: "Tipo de garantía eliminado correctamente",
    errorToast: "Error al eliminar el tipo de garantía",
  }),
];
