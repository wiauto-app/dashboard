import type { VehicleServiceCatalogItem } from "../types/catalog.types";
import { catalogServicesService } from "../services/catalogServicesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const catalogServicesActions = (
  row: VehicleServiceCatalogItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: catalogServicesService.delete,
    title: "Eliminar servicio",
    description:
      "¿Eliminar este servicio del catálogo? Los anuncios que lo incluyen pueden verse afectados.",
    successToast: "Servicio eliminado correctamente",
    errorToast: "Error al eliminar el servicio",
  }),
];
