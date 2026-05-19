import type { DynamicTableAction } from "@/components/dynamic-table/types";
import type { Profile } from "@/types/profiles.types";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { userService } from "./userService";

export const userActions = (
  row: Profile,
  onSuccess?: () => void,
): DynamicTableAction[] => {
  const actions: DynamicTableAction[] = [
    // {
    //   key: "suspend",
    //   ...
    // },
    deleteRowAction(row.id, onSuccess, {
      deleteFn: userService.deleteUser,
      title: "Eliminar usuario",
      description: "¿Estás seguro de querer eliminar este usuario?",
      successToast: "Usuario eliminado correctamente",
      errorToast: "Error al eliminar el usuario",
    }),
  ];

  return actions;
};
