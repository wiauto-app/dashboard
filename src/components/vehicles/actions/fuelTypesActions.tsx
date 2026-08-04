import type { CatalogFuelTypeItem } from "../types/catalog.types";
import { fuelTypesService } from "../services/fuelTypesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const fuelTypesActions = (
  row: CatalogFuelTypeItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(String(row.id), onSuccess, {
    deleteFn: fuelTypesService.delete,
    title: "Eliminar combustible",
    description:
      "¿Eliminar este tipo de combustible del catálogo? Los anuncios que lo usan pueden dejar de mostrarlo.",
    successToast: "Combustible eliminado correctamente",
    errorToast: "Error al eliminar el combustible",
  }),
];
