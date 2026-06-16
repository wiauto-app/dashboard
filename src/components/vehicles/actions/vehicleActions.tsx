import type { AdminVehicleListItem } from "../types/vehicles.types";
import { getVehicleDisplayName } from "../utils/getVehicleDisplayName";
import { vehiclesService } from "../services/vehiclesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { VehicleStatusMenu } from "./VehicleStatusMenu";

export const vehicleActions = (row: AdminVehicleListItem, onSuccess?: () => void) => [
  {
    key: "vehicle-status",
    label: "Cambiar estado",
    component: (
      <VehicleStatusMenu
        key={`vehicle-status-${row.id}`}
        row={row}
        onSuccess={onSuccess}
      />
    ),
  },
  deleteRowAction(row.id, onSuccess, {
    deleteFn: vehiclesService.delete,
    title: "Eliminar anuncio",
    description: `¿Estás seguro de que quieres eliminar el anuncio «${getVehicleDisplayName(row)}»? Esta acción no se puede deshacer.`,
    successToast: "Anuncio eliminado correctamente",
    errorToast: "Error al eliminar el anuncio",
  }),
];
