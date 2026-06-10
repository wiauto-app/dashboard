export type VehicleStatus =
  | "active"
  | "pending"
  | "inactive"
  | "sold"
  | "archived";

export const VEHICLE_STATUS_OPTIONS: {
  value: VehicleStatus;
  label: string;
}[] = [
  { value: "active", label: "Activo" },
  { value: "pending", label: "Pendiente" },
  { value: "inactive", label: "Inactivo" },
  { value: "sold", label: "Vendido" },
  { value: "archived", label: "Archivado" },
];

export const get_vehicle_status_label = (status: VehicleStatus): string =>
  VEHICLE_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
  status;
