import type { VehicleFormImage } from "../schemas/vehicle.schema";
import type z from "zod";
import type { vehiclesSchema } from "../schemas/vehicles-params.schema";
import type { createVehicleSchema, updateVehicleSchema, vehicleSchema } from "../schemas/vehicle.schema";

export type { VehicleFormImage, VehicleFormVideo } from "../schemas/vehicle.schema";


export interface Cuota {
  id: string;
  name: string;
  slug: string;
  value: number;
  created_at: Date;
  updated_at: Date;
}

export interface VehicleListItemCatalogRef {
  id: string;
  name: string;
  slug: string;
}

export interface VehicleListItemImage {
  id: string;
  url: string;
}

export interface VehicleListItemPublisher {
  id: string;
  name: string;
  avatar_url: string;
}

export interface VehicleVersionSummary {
  make_name: string;
  model_name: string;
  version_name: string;
}

export interface AdminVehicleVersionRef {
  id: number;
  name: string;
  make?: { name: string } | null;
  model?: { name: string } | null;
}

/** Alias para respuestas admin con relación `version` cargada. */
export type AdminVehicleVersion = AdminVehicleVersionRef;

/** Fila del listado admin (`GET /v1/admin/vehicles`). */
export interface AdminVehicleListItem {
  id: string;
  version_summary: VehicleVersionSummary;
  price: number;
  mileage: number;
  lat: number;
  lng: number;
  condition: "new" | "used";
  status: "active" | "pending" | "inactive" | "sold" | "archived";
  is_featured: boolean;
  views: number;
  publisher_type: "professional" | "particular";
  transmission_type: "manual" | "automatic";
  power: number;
  displacement: number;
  license_plate: string;
  autonomy: number;
  battery_capacity: number;
  time_to_charge: number;
  phone_code: string;
  phone: string;
  email: string;
  version_id: number;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
  images: VehicleListItemImage[];
  features: VehicleListItemCatalogRef[];
  services: VehicleListItemCatalogRef[];
  vehicle_type: VehicleListItemCatalogRef | null;
  category: VehicleListItemCatalogRef | null;
  color: (VehicleListItemCatalogRef & { hex_code: string }) | null;
  dgt_label: (VehicleListItemCatalogRef & { code: string }) | null;
  warranty_type: VehicleListItemCatalogRef | null;
  cuotas: (VehicleListItemCatalogRef & { value: number })[];
  publisher: VehicleListItemPublisher;
  traction: VehicleListItemCatalogRef;
}

export type VehiclePriceHistoryItem = {
  id: string;
  price: number;
  status: "active" | "inactive";
  created_at: string;
};

/** Detalle admin para edición (`GET /v1/admin/vehicles/:id`). */
export interface AdminVehicleVersionCatalog {
  make_id: number;
  model_id: number;
  body_type_id: number;
  fuel_type_id: number;
  year_id: number;
}

/** Detalle admin para edición (`GET /v1/admin/vehicles/:id`). */
export interface AdminVehicleDetail {
  id: string;
  vin_code?: string | null;
  vehicle_type_id: string | null;
  category_id: string | null;
  description: string;
  price: number;
  vehicle_prices: VehiclePriceHistoryItem[];
  mileage: number;
  condition: "new" | "used";
  lat: number;
  lng: number;
  version_id: number;
  version: AdminVehicleVersion;
  version_catalog: AdminVehicleVersionCatalog;
  traction_id: string;
  transmission_type: "manual" | "automatic";
  power: number;
  displacement: number;
  autonomy: number;
  battery_capacity: number;
  time_to_charge: number;
  license_plate: string;
  publisher_type: "professional" | "particular";
  phone_code: string;
  phone: string;
  email: string;
  features_ids: string[];
  services_ids: string[];
  color_id: string | null;
  dgt_label_id: string | null;
  warranty_type_id: string | null;
  cuota_ids: string[];
  images: VehicleFormImage[];
}

/** Detalle completo del vehículo (creación / edición). */
export interface Vehicle {
  id: string;
  description: string;
  price: number;
  mileage: number;
  condition: "new" | "used";
  status: "active" | "pending" | "inactive" | "sold" | "archived";
  is_featured: boolean;
  views: number;
  publisher_type: "professional" | "particular";
  expires_at: Date;
  lat: number;
  lng: number;
  transmission_type: "manual" | "automatic";
  power: number;
  displacement: number;
  license_plate: string;
  autonomy: number;
  battery_capacity: number;
  time_to_charge: number;
  phone_code: string;
  phone: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  version_id: number;
  suggestions: string[];
  // version: VersionEntity;
  // traction: TractionEntity;
  // vehicle_type: VehicleTypeEntity | null;
  // color: ColorEntity | null;
  // dgt_label: DgtLabelEntity | null;
  // warranty_type: WarrantyTypeEntity | null;
  // cuotas: CuotaEntity[];
  // images?: VehicleImagesEntity[];
  // videos?: VideosEntity[];
  // features?: FeaturesEntity[];
  // services?: ServiceEntity[];
  // profile: ProfileEntity;
  // reviews: ReviewEntity[];
  // deleted_at?: Date;
}

export type VehiclesParams = z.infer<typeof vehiclesSchema>


export type VehicleSchema = z.infer<typeof vehicleSchema>;
export type CreateVehicleSchema = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleSchema = z.infer<typeof updateVehicleSchema>;
/** Valores del formulario antes de validar (permite strings vacíos en selects). */

export const createVehicleDefaultValues: VehicleSchema = {
  vin_code: undefined,
  vehicle_type_id: "",
  description: "",
  price: 0,
  vehicle_price_id: undefined,
  mileage: 0,
  condition: "used", 
  
  lat: 0,
  lng: 0,
  
  version_id: 0,
  traction_id: "",
  transmission_type: "manual",
  power: 0,
  displacement: 0,
  publisher_type: "professional",
  phone: { phone_code: "", phone: "" },
  email: "",
  category_id: undefined,
  features_ids: [],
  services_ids: [],
  cuota_ids: [],
  images: [],
  videos: [],
  color_id: undefined,
  dgt_label_id: undefined,
  warranty_type_id: undefined,
};


export interface Feature {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}