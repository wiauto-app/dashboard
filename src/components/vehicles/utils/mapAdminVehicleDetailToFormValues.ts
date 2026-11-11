import type { AdminVehicleDetail, VehicleSchema } from "../types/vehicles.types";

export const mapAdminVehicleDetailToFormValues = (
  detail: AdminVehicleDetail,
): VehicleSchema => {
  const active_price = detail.vehicle_prices?.find(
    (item) => item.status === "active",
  );

  return {
    vin_code: detail.vin_code ?? "",
    vehicle_type_id: detail.vehicle_type_id ?? "",
    category_id: detail.category_id ?? undefined,
    description: detail.description ?? "",
    price: detail.price,
    vehicle_price_id: active_price?.id,
    mileage: detail.mileage,
    condition: detail.condition,
    lat: detail.lat,
    lng: detail.lng,
    version_id: detail.version_id,
    catalog_make_id: detail.version_catalog?.make_id,
    catalog_model_id: detail.version_catalog?.model_id,
    catalog_body_type_id: detail.version_catalog?.body_type_id,
    catalog_fuel_type_id: detail.version_catalog?.fuel_type_id,
    catalog_year_id: detail.version_catalog?.year_id,
    catalog_fuel_can_charge: false,
    traction_id: detail.traction_id ?? "",
    transmission_type: detail.transmission_type,
    power: detail.power || undefined,
    displacement: detail.displacement ?? 0,
    autonomy: detail.autonomy || undefined,
    battery_capacity: detail.battery_capacity || undefined,
    time_to_charge: detail.time_to_charge || undefined,
    license_plate: detail.license_plate || "",
    ref: detail.ref ?? "",
    publisher_type: detail.publisher_type,
    phone: {
      phone_code: detail.phone_code || "+34",
      phone: detail.phone,
    },
    show_phone: detail.show_phone ?? true,
    has_whatsapp: detail.has_whatsapp ?? false,
    color_id: detail.color_id ?? undefined,
    dgt_label_id: detail.dgt_label_id ?? undefined,
    warranty_type_id: detail.warranty_type_id ?? undefined,
    features_ids: detail.features_ids ?? [],
    services_ids: detail.services_ids ?? [],
    cuota_ids: detail.cuota_ids ?? [],
    images: detail.images ?? [],
    videos: detail.videos ?? [],
    offer_financing: detail.offer_financing ?? false,
    finance_price: detail.finance_price ?? undefined,
    show_first_cuota: detail.show_first_cuota ?? false,
    by_brand_warranty: detail.by_brand_warranty ?? false,
    show_exact_location: detail.show_exact_location ?? false,
    show_review_collab: detail.show_review_collab ?? true,
  };
};
