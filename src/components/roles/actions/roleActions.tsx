import type { Role } from "../types/role.types";
import { rolesService } from "../services/rolesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const roleActions = (row: Role, onSuccess?: () => void) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: rolesService.delete,
    title: "Eliminar rol",
    description: "¿Estás seguro de querer eliminar este rol?",
    successToast: "Rol eliminado correctamente",
    errorToast: "Error al eliminar el rol",
  }),
];
