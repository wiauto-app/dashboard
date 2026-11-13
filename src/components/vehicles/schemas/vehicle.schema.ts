import z from "zod";
import {
  VEHICLE_CONDITION_VALUES,
  VEHICLE_PUBLISHER_TYPE_VALUES,
  VEHICLE_TRANSMISSION_TYPE_VALUES,
} from "../constants/vehicle-enums.constants";
import { phoneSchema } from "@/validations/resources/phone.schema";

export const VEHICLE_CONDITION = VEHICLE_CONDITION_VALUES;
export const VEHICLE_PUBLISHER_TYPE = VEHICLE_PUBLISHER_TYPE_VALUES;
export const VEHICLE_TRANSMISSION_TYPE = VEHICLE_TRANSMISSION_TYPE_VALUES;

export const QUICK_VEHICLE_LOCATION_REQUIRED_MESSAGE =
  "Indica dónde está el vehículo: código postal, ciudad o «Mi ubicación».";

const optionalUuid = z
  .union([
    z.uuid({ error: "Identificador no válido." }),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => {
    if (value === "" || value === undefined || value === null) {
      return undefined;
    }
    return value;
  });

const optionalUuidArray = z
  .array(z.uuid({ error: "Identificador no válido." }))
  .optional()
  .default([]);

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const emptyOrZeroToUndefined = (value: unknown) =>
  value === "" || value === null || Number(value) === 0 ? undefined : value;

const optionalBoundedNumber = (max: number, maxMessage: string) =>
  z.coerce
    .number({ error: "Introduce un número válido." })
    .min(0, { error: "El valor no puede ser negativo." })
    .max(max, { error: maxMessage })
    .optional();

/** Imagen del vehículo: upload_id (nuevo flujo) o path (legacy) + orden. */
export const vehicle_image_schema = z
  .object({
    id: z.uuid({ error: "Identificador no válido." }).optional(),
    upload_id: z
      .string()
      .min(1, { error: "La foto no se ha subido correctamente." })
      .optional(),
    path: z
      .string()
      .min(1, { error: "La foto no se ha subido correctamente." })
      .optional(),
    preview_url: z.string().min(1).optional(),
    expires_at: z.string().optional(),
    order: z
      .number({ error: "El orden de la imagen debe ser un número válido." })
      .int({ error: "El orden de la imagen debe ser un número entero." })
      .min(0, { error: "El orden de la imagen no puede ser negativo." }),
  })
  .refine((data) => data.upload_id || data.path, {
    message: "La foto no se ha subido correctamente. Vuelve a añadirla.",
    path: ["upload_id"],
  });

export type VehicleFormImage = z.infer<typeof vehicle_image_schema>;

const optional_vehicle_images_array = z
  .array(vehicle_image_schema)
  .optional()
  .default([]);

/**
 * Vídeo del formulario: `{ upload_id, order }` (subida multipart nueva) o
 * `{ id, order }` (vídeo ya guardado). El resto de campos son solo de UI y no
 * se envían al API.
 */
export const vehicle_video_schema = z
  .object({
    id: z.string().min(1).optional(),
    upload_id: z.string().min(1).optional(),
    order: z
      .number({ error: "El orden del vídeo debe ser un número válido." })
      .int({ error: "El orden del vídeo debe ser un número entero." })
      .min(0, { error: "El orden del vídeo no puede ser negativo." }),
    url: z.string().nullable().optional(),
    preview_url: z.string().optional(),
    thumbnail_url: z.string().nullable().optional(),
    file_name: z.string().optional(),
    status: z.string().optional(),
  })
  .refine((data) => Boolean(data.id) !== Boolean(data.upload_id), {
    message: "El vídeo no se ha subido correctamente. Vuelve a añadirlo.",
    path: ["upload_id"],
  });

export type VehicleFormVideo = z.infer<typeof vehicle_video_schema>;

const optional_vehicle_videos_array = z
  .array(vehicle_video_schema)
  .optional()
  .default([]);

const optionalCatalogId = (message: string) =>
  z.coerce
    .number({ error: message })
    .int({ error: message })
    .positive({ error: message })
    .optional();

export const fileSchema = z.object({
  path: z.string(),
  key: z.string(),
});
export const fileArray = z.array(fileSchema);

export const vehicleSchema = z.object({
  vehicle_type_id: z.uuid({ error: "Selecciona un tipo de vehículo." }),
  ref: z
    .string()
    .max(50, { error: "La referencia no puede tener más de 50 caracteres." })
    .optional(),
  license_plate: z
    .string()
    .optional()
    .transform((value) => {
      if (!value?.trim()) return "";
      return value.trim().toUpperCase().replace(/\s+/g, "");
    })
    .refine((value) => value === "" || /^\d{4}[A-Z]{3}$/.test(value), {
      error: "La matrícula debe tener el formato 1234ABC.",
    }),
  vin_code: z
    .string()
    .optional()
    .transform((value) => {
      if (!value?.trim()) return "";
      return value.trim().toUpperCase();
    })
    .refine((value) => value === "" || /^[A-HJ-NPR-Z0-9]{17}$/.test(value), {
      error: "El VIN debe tener exactamente 17 caracteres válidos.",
    }),
  images: optional_vehicle_images_array,
  videos: optional_vehicle_videos_array,
  version_id: z.coerce
    .number({ error: "Selecciona una versión del catálogo." })
    .int({ error: "Selecciona una versión del catálogo." })
    .positive({ error: "Selecciona una versión del catálogo." }),
  catalog_make_id: optionalCatalogId("Selecciona la marca."),
  catalog_model_id: optionalCatalogId("Selecciona el modelo."),
  catalog_year_id: optionalCatalogId("Selecciona el año."),
  catalog_body_type_id: optionalCatalogId("Selecciona la carrocería."),
  catalog_fuel_type_id: optionalCatalogId("Selecciona el combustible."),
  catalog_fuel_can_charge: z.boolean().optional().default(false),
  vehicle_price_id: optionalUuid,
  condition: z.enum(VEHICLE_CONDITION, {
    error: "Selecciona si el vehículo es nuevo o usado.",
  }),
  mileage: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: "Introduce el kilometraje." })
      .min(0, { error: "El kilometraje no puede ser negativo." })
      .max(9_999_999, {
        error: "El kilometraje no puede ser mayor a 9.999.999 km.",
      }),
  ),
  price: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: "Introduce el precio." })
      .min(1, { error: "El precio debe ser mayor que 0 €." })
      .max(9_999_999, {
        error: "El precio no puede ser mayor a 9.999.999 €.",
      }),
  ),
  finance_price: optionalBoundedNumber(
    9_999_999,
    "El precio financiado no puede ser mayor a 9999999.",
  ),
  offer_financing: z.boolean().default(false),
  show_first_cuota: z.boolean().default(false),
  by_brand_warranty: z.boolean().default(false),
  show_exact_location: z.boolean().default(false),
  color_id: optionalUuid,
  category_id: optionalUuid,
  dgt_label_id: optionalUuid,
  lat: z.preprocess(
    emptyToUndefined,
    z.coerce.number({ error: QUICK_VEHICLE_LOCATION_REQUIRED_MESSAGE }),
  ),
  lng: z.preprocess(
    emptyToUndefined,
    z.coerce.number({ error: QUICK_VEHICLE_LOCATION_REQUIRED_MESSAGE }),
  ),
  phone: phoneSchema,
  show_phone: z.boolean().default(true),
  has_whatsapp: z.boolean().default(false),
  description: z
    .string()
    .max(3000, { error: "La descripción no puede tener más de 3000 caracteres." })
    .optional(),
  transmission_type: z
    .enum(VEHICLE_TRANSMISSION_TYPE, {
      error: "Selecciona un tipo de transmisión.",
    })
    .default("manual"),
  power: z.preprocess(
    emptyOrZeroToUndefined,
    z.coerce
      .number({ error: "Introduce la potencia en CV." })
      .min(1, { error: "La potencia debe ser de al menos 1 CV." })
      .max(9999, { error: "La potencia no puede ser mayor a 9999 CV." })
      .optional(),
  ),
  displacement: z.preprocess(
    (value) => emptyToUndefined(value) ?? 0,
    z.coerce
      .number({ error: "Introduce la cilindrada en cc." })
      .min(0, { error: "La cilindrada no puede ser negativa." })
      .max(20_000, { error: "La cilindrada no puede ser mayor a 20000 cc." }),
  ),
  autonomy: optionalBoundedNumber(
    2000,
    "La autonomía no puede ser mayor a 2000 km.",
  ),
  battery_capacity: optionalBoundedNumber(
    500,
    "La capacidad de la batería no puede ser mayor a 500 kWh.",
  ),
  time_to_charge: optionalBoundedNumber(
    100,
    "El tiempo de carga no puede ser mayor a 100 h.",
  ),
  traction_id: optionalUuid,
  features_ids: optionalUuidArray,
  services_ids: optionalUuidArray,
  cuota_ids: optionalUuidArray,
  warranty_type_id: optionalUuid,
  publisher_type: z
    .enum(VEHICLE_PUBLISHER_TYPE, {
      error: "Selecciona el tipo de publicador.",
    })
    .default("particular"),
  show_review_collab: z.boolean().default(true),
  profile_id: optionalUuid,
});

export const createVehicleSchema = vehicleSchema.extend({
  profile_id: z.uuid({ error: "Selecciona el dueño del anuncio." }),
});

export const updateVehicleSchema = vehicleSchema.partial();
