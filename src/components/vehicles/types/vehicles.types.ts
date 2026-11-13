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
  publisher_type: "dealership" | "particular";
  transmission_type: "manual" | "automatic";
  power: number;
  displacement: number;
  license_plate: string;
  autonomy: number;
  battery_capacity: number;
  time_to_charge: number;
  phone_code: string;
  phone: string;
  has_whatsapp: boolean;
  show_phone: boolean;
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

/** Vídeo del detalle (`videos[]`). `url` solo existe con `status === "ready"`. */
export interface AdminVehicleVideo {
  id: string;
  url: string | null;
  thumbnail_url: string | null;
  duration_s: number | null;
  width: number | null;
  height: number | null;
  order: number;
  status: "uploaded" | "processing" | "ready" | "failed";
}

/** Detalle admin para edición (`GET /v1/admin/vehicles/:id`). */
export interface AdminVehicleDetail {
  id: string;
  ref?: string | null;
  vin_code?: string | null;
  vehicle_type_id: string | null;
  category_id: string | null;
  description: string;
  price: number;
  finance_price?: number | null;
  offer_financing?: boolean;
  show_first_cuota?: boolean;
  by_brand_warranty?: boolean;
  show_exact_location?: boolean;
  show_review_collab?: boolean;
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
  publisher_type: "dealership" | "particular";
  phone_code: string;
  phone: string;
  has_whatsapp: boolean;
  show_phone: boolean;
  email: string;
  features_ids: string[];
  services_ids: string[];
  color_id: string | null;
  dgt_label_id: string | null;
  warranty_type_id: string | null;
  cuota_ids: string[];
  images: VehicleFormImage[];
  videos?: AdminVehicleVideo[];
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
  publisher_type: "dealership" | "particular";
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
  has_whatsapp: boolean;
  show_phone: boolean;
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

/** Valores iniciales del formulario antes de validar (km, precio y ubicación vacíos). */
export interface CreateVehicleFormDefaultValues
  extends Omit<CreateVehicleSchema, "mileage" | "price" | "lat" | "lng"> {
  mileage?: number;
  price?: number;
  lat?: number;
  lng?: number;
}

export const createVehicleDefaultValues: CreateVehicleFormDefaultValues = {
  profile_id: "",
  vehicle_type_id: "",
  ref: "",
  license_plate: "",
  vin_code: "",
  images: [],
  videos: [],
  version_id: 0,
  catalog_fuel_can_charge: false,
  condition: "used",
  mileage: undefined,
  price: undefined,
  lat: undefined,
  lng: undefined,
  phone: { phone_code: "+34", phone: "" },
  show_phone: true,
  has_whatsapp: false,
  description: "",
  transmission_type: "manual",
  power: undefined,
  displacement: 0,
  traction_id: "",
  offer_financing: false,
  show_first_cuota: false,
  by_brand_warranty: false,
  show_exact_location: false,
  features_ids: [],
  services_ids: [],
  cuota_ids: [],
  color_id: undefined,
  category_id: undefined,
  dgt_label_id: undefined,
  warranty_type_id: undefined,
  publisher_type: "particular",
  show_review_collab: true,
  vehicle_price_id: undefined,
};


export interface Feature {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}