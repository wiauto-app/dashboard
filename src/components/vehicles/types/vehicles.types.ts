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

export interface Vehicle {
  id: string;
  title: string;
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
  title: "",
  description: "",
  price: 0,
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