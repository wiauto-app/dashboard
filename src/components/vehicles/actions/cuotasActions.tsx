import type { Cuota } from "../types/vehicles.types";
import { cuotasService } from "../services/cuotasService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const cuotasActions = (row: Cuota, onSuccess?: () => void) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: cuotasService.delete,
    title: "Eliminar plan de cuotas",
    description:
      "¿Estás seguro de querer eliminar este plan? Los anuncios dejarán de asociarlo.",
    successToast: "Plan de cuotas eliminado correctamente",
    errorToast: "Error al eliminar el plan de cuotas",
  }),
];
