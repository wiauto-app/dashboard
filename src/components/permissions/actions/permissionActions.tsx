import type { Permission } from "../types/permission.type";
import { permissionService } from "../services/permissionService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const permissionActions = (
  row: Permission,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: permissionService.deletePermission,
    title: "Eliminar permiso",
    description: "¿Estás seguro de querer eliminar este permiso?",
    successToast: "Permiso eliminado correctamente",
    errorToast: "Error al eliminar el permiso",
    undo_pending_message:
      "El permiso se eliminará en unos segundos. Pulsa Deshacer para cancelar.",
  }),
];
