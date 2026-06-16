import type {
  AdminVehicleDetail,
  AdminVehicleListItem,
  AdminVehicleVersionRef,
  VehicleVersionSummary,
} from "../types/vehicles.types";

export type { VehicleVersionSummary, AdminVehicleVersionRef as AdminVehicleVersion };

type VehicleDisplayNameInput = {
  version_summary?: VehicleVersionSummary | null;
  version?: AdminVehicleVersionRef | null;
  license_plate?: string | null;
  id?: string;
};

const extract_catalog_names = (
  vehicle?: VehicleDisplayNameInput | VehicleVersionSummary | null,
): string[] => {
  if (!vehicle) {
    return [];
  }

  if ("version_summary" in vehicle && vehicle.version_summary) {
    const { make_name, model_name, version_name } = vehicle.version_summary;
    return [make_name, model_name, version_name];
  }

  if ("version" in vehicle && vehicle.version) {
    const { make, model, name } = vehicle.version as AdminVehicleVersionRef;
    return [make?.name, model?.name, name].filter(
      (part): part is string => Boolean(part),
    );
  }

  if ("make_name" in vehicle) {
    return [
      vehicle.make_name,
      vehicle.model_name,
      vehicle.version_name,
    ];
  }

  return [];
};

export const getVehicleDisplayName = (
  vehicle?: AdminVehicleListItem | AdminVehicleDetail | VehicleDisplayNameInput | null,
  options?: { fallback?: string },
): string => {
  const catalog_name = extract_catalog_names(vehicle).filter(Boolean).join(" ");
  if (catalog_name) {
    return catalog_name;
  }

  const license_plate = vehicle?.license_plate?.trim();
  if (license_plate) {
    return license_plate;
  }

  if (vehicle?.id) {
    return vehicle.id;
  }

  return options?.fallback ?? "Vehículo";
};
