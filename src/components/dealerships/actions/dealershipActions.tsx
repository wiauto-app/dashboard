import type { Dealership } from "../types/dealership.types";
import { dealershipService } from "../services/dealershipService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const dealershipActions = (
  row: Dealership,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: dealershipService.delete,
    title: "Eliminar concesionario",
    description: "¿Estás seguro de querer eliminar este concesionario?",
    successToast: "Concesionario eliminado correctamente",
    errorToast: "Error al eliminar el concesionario",
  }),
];
