import type { Feature } from "../types/vehicles.types";
import { featuresService } from "../services/featuresService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const featuresActions = (row: Feature, onSuccess?: () => void) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: featuresService.delete,
    title: "Eliminar característica",
    description: "¿Estás seguro de querer eliminar esta característica?",
    successToast: "Característica eliminada correctamente",
    errorToast: "Error al eliminar la característica",
  }),
];
