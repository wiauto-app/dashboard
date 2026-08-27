import type { DynamicTableAction } from "@/components/dynamic-table/types";
import type { Profile } from "@/types/profiles.types";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { userService } from "./userService";
import { PlanAccessGrantDialog } from "@/components/users/planAccessGrantDialog";

export const userActions = (
  row: Profile,
  onSuccess?: () => void,
): DynamicTableAction[] => {
  const actions: DynamicTableAction[] = [
    {
      key: `assign-plan-${row.id}`,
      label: "Asignar plan",
      component: <PlanAccessGrantDialog profile={row} onSuccess={onSuccess} />,
    },
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
