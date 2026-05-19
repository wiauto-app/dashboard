/**
 * Valores alineados con `VehicleEntity` / dominio backend (`condition`, `status`,
 * `publisher_type`, `transmission_type`). Etiquetas solo para UI.
 */

export const VEHICLE_CONDITION_VALUES = ["new", "used"] as const;
export type VehicleConditionValue = (typeof VEHICLE_CONDITION_VALUES)[number];

export const VEHICLE_PUBLISHER_TYPE_VALUES = [
  "professional",
  "particular",
] as const;
export type VehiclePublisherTypeValue =
  (typeof VEHICLE_PUBLISHER_TYPE_VALUES)[number];

export const VEHICLE_TRANSMISSION_TYPE_VALUES = [
  "manual",
  "automatic",
] as const;
export type VehicleTransmissionTypeValue =
  (typeof VEHICLE_TRANSMISSION_TYPE_VALUES)[number];

export const VEHICLE_STATUS_VALUES = [
  "active",
  "pending",
  "inactive",
  "sold",
  "archived",
] as const;
export type VehicleStatusValue = (typeof VEHICLE_STATUS_VALUES)[number];

export const VEHICLE_CONDITION_OPTIONS: {
  value: VehicleConditionValue;
  label: string;
}[] = [
  { value: "new", label: "Nuevo" },
  { value: "used", label: "Usado" },
];

export const VEHICLE_TRANSMISSION_TYPE_OPTIONS: {
  value: VehicleTransmissionTypeValue;
  label: string;
}[] = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automática" },
];

export const VEHICLE_PUBLISHER_TYPE_OPTIONS: {
  value: VehiclePublisherTypeValue;
  label: string;
}[] = [
  { value: "professional", label: "Profesional" },
  { value: "particular", label: "Particular" },
];

export const VEHICLE_STATUS_OPTIONS: {
  value: VehicleStatusValue;
  label: string;
}[] = [
  { value: "active", label: "Activo" },
  { value: "pending", label: "Pendiente" },
  { value: "inactive", label: "Inactivo" },
  { value: "sold", label: "Vendido" },
  { value: "archived", label: "Archivado" },
];

/** Valor centinela para filtros “Todos” (no es valor de enum en BD). */
export const VEHICLE_FILTER_ALL_VALUE = "__all__" as const;
export const VEHICLE_FILTER_ALL_LABEL = "Todos" as const;
