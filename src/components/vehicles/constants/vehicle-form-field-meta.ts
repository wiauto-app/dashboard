/**
 * Metadatos de campos del formulario de vehículo, alineados con
 * `CreateVehicleHttpDto` (campos con `@IsOptional()`).
 */
export const VEHICLE_FORM_OPTIONAL_FIELD_KEYS = {
  vin_code: true,
  license_plate: true,
  transmission_type: true,
  displacement: true,
  autonomy: true,
  battery_capacity: true,
  time_to_charge: true,
  features_ids: true,
  services_ids: true,
  cuota_ids: true,
  color_id: true,
  dgt_label_id: true,
  warranty_type_id: true,
  images: true,
  videos: true,
} as const;

export type VehicleFormOptionalFieldKey = keyof typeof VEHICLE_FORM_OPTIONAL_FIELD_KEYS;

export const isVehicleFormFieldOptional = (
  field: string,
): field is VehicleFormOptionalFieldKey =>
  field in VEHICLE_FORM_OPTIONAL_FIELD_KEYS;

export const OPTIONAL_FIELD_SUFFIX = "(opcional)";

export const formatFieldLabel = (label: string, optional = false): string =>
  optional ? `${label} ${OPTIONAL_FIELD_SUFFIX}` : label;
