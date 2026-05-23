import type { Vehicle } from "../types/vehicles.types";
import { vehiclesService } from "../services/vehiclesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const vehicleActions = (row: Vehicle, onSuccess?: () => void) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: vehiclesService.delete,
    title: "Eliminar anuncio",
    description: `¿Estás seguro de que quieres eliminar el anuncio «${row.title}»? Esta acción no se puede deshacer.`,
    successToast: "Anuncio eliminado correctamente",
    errorToast: "Error al eliminar el anuncio",
  }),
];
