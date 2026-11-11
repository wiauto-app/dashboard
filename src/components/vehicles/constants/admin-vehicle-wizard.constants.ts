import type { VehicleSchema } from "../types/vehicles.types";

export type AdminVehicleFormField = keyof VehicleSchema | "profile_id";

export interface AdminVehicleWizardStep {
  id: number;
  label: string;
  fields: AdminVehicleFormField[];
}

export const ADMIN_VEHICLE_SUBMIT_ATTR = "data-admin-vehicle-submit";

const TECHNICAL_SHEET_FIELDS: AdminVehicleFormField[] = [
  "transmission_type",
  "power",
  "displacement",
  "autonomy",
  "battery_capacity",
  "time_to_charge",
  "traction_id",
];

const DATA_STEP_FIELDS: AdminVehicleFormField[] = [
  "profile_id",
  "images",
  "videos",
  "vehicle_type_id",
  "license_plate",
  "vin_code",
  "ref",
  "version_id",
  "catalog_make_id",
  "catalog_model_id",
  "catalog_year_id",
  "condition",
  "mileage",
  "price",
  "publisher_type",
  "lat",
  "lng",
  "show_exact_location",
  "phone",
  "show_phone",
  "has_whatsapp",
  "show_review_collab",
];

const EXTRA_STEP_FIELDS: AdminVehicleFormField[] = [
  "catalog_body_type_id",
  "catalog_fuel_type_id",
  "catalog_fuel_can_charge",
  "color_id",
  "category_id",
  "dgt_label_id",
  ...TECHNICAL_SHEET_FIELDS,
  "features_ids",
  "services_ids",
];

const FINANCE_STEP_FIELDS: AdminVehicleFormField[] = [
  "offer_financing",
  "finance_price",
  "show_first_cuota",
  "by_brand_warranty",
  "cuota_ids",
  "warranty_type_id",
  "description",
];

const ADMIN_DATA_STEP: AdminVehicleWizardStep = {
  id: 1,
  label: "Datos",
  fields: DATA_STEP_FIELDS,
};

const ADMIN_EXTRA_STEP: AdminVehicleWizardStep = {
  id: 2,
  label: "Extra",
  fields: EXTRA_STEP_FIELDS,
};

const ADMIN_FINANCE_STEP: AdminVehicleWizardStep = {
  id: 3,
  label: "Garantía y financiación",
  fields: FINANCE_STEP_FIELDS,
};

export const ADMIN_VEHICLE_WIZARD_STEPS: AdminVehicleWizardStep[] = [
  ADMIN_DATA_STEP,
  ADMIN_EXTRA_STEP,
  ADMIN_FINANCE_STEP,
];

export const getAdminVehicleStepByIndex = (
  stepIndex: number,
): AdminVehicleWizardStep | undefined =>
  ADMIN_VEHICLE_WIZARD_STEPS[stepIndex - 1];
