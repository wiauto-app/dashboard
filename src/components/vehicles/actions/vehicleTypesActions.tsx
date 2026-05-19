import type { CatalogItemWithSlug } from "../types/catalog.types";
import { vehicleTypesService } from "../services/vehicleTypesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const vehicleTypesActions = (
  row: CatalogItemWithSlug,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: vehicleTypesService.delete,
    title: "Eliminar tipo de vehículo",
    description:
      "¿Eliminar este tipo del catálogo? Comprueba que ningún anuncio dependa de él.",
    successToast: "Tipo de vehículo eliminado correctamente",
    errorToast: "Error al eliminar el tipo de vehículo",
  }),
];
