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

const optionalUuid = z
  .union([
    z.uuid({ error: "Identificador no válido." }),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => {
    if (value === "" || value === undefined) return undefined;
    if (value === null) return null;
    return value;
  });

const optionalUuidArray = z
  .array(z.uuid({ error: "Identificador no válido." }))
  .optional()
  .default([]);

/** Imagen del vehículo: ruta en almacenamiento y orden de visualización (0 … n-1). */
export const vehicle_image_schema = z.object({
  path: z.string().min(1, { error: "La ruta de la imagen no es válida." }),
  order: z
    .number({ error: "El orden de la imagen debe ser un número válido." })
    .int({ error: "El orden de la imagen debe ser un número entero." })
    .min(0, { error: "El orden de la imagen no puede ser negativo." }),
});

export type VehicleFormImage = z.infer<typeof vehicle_image_schema>;

const optional_vehicle_images_array = z
  .array(vehicle_image_schema)
  .optional()
  .default([]);

/** Vídeo del vehículo en el bucket `vehicles-videos` (clave final suele ser `.mp4`). */
export const vehicle_video_schema = z.object({
  path: z.string().min(1, { error: "La ruta del vídeo no es válida." }),
  order: z
    .number({ error: "El orden del vídeo debe ser un número válido." })
    .int({ error: "El orden del vídeo debe ser un número entero." })
    .min(0, { error: "El orden del vídeo no puede ser negativo." }),
});

export type VehicleFormVideo = z.infer<typeof vehicle_video_schema>;

const optional_vehicle_videos_array = z
  .array(vehicle_video_schema)
  .optional()
  .default([]);

const optionalNonNegativeNumber = z.coerce
  .number({ error: "Introduce un número válido." })
  .min(0, { error: "El valor no puede ser negativo." })
  .optional();

export const fileSchema = z.object({
  path: z.string(),
  key: z.string(),
});
export const fileArray = z.array(fileSchema);

export const vehicleSchema = z.object({
  vin_code: z
    .union([
      z.literal(""),
      z.string().min(1, { error: "El VIN debe tener al menos 1 carácter." }),
    ])
    .optional(),
  images: optional_vehicle_images_array,
  videos: optional_vehicle_videos_array,
  // --- Anuncio ---
  vehicle_type_id: z.uuid({ error: "Selecciona un tipo de vehículo." }),
  description: z
    .string()
    .min(1, { error: "La descripción es obligatoria." })
    .min(10, { error: "La descripción debe tener al menos 10 caracteres." }),
  price: z.coerce
    .number({ error: "Introduce un precio válido." })
    .min(0, { error: "El precio no puede ser negativo." }),
  mileage: z.coerce
    .number({ error: "Introduce un kilometraje válido." })
    .min(0, { error: "El kilometraje no puede ser negativo." }),
  condition: z.enum(VEHICLE_CONDITION, {
    error: "Selecciona si el vehículo es nuevo o usado.",
  }),

  // --- Ubicación ---
  lat: z.coerce.number({ error: "Introduce una latitud válida." }),
  lng: z.coerce.number({ error: "Introduce una longitud válida." }),

  // --- Catálogo y ficha técnica ---
  version_id: z.coerce
    .number({ error: "Selecciona una versión del catálogo." })
    .int({ error: "Selecciona una versión del catálogo." })
    .positive({ error: "Selecciona una versión del catálogo." }),
  /** Solo formulario: precarga la cascada del catálogo al editar. No se envía al API. */
  catalog_make_id: z.coerce.number().int().positive().optional(),
  catalog_model_id: z.coerce.number().int().positive().optional(),
  catalog_body_type_id: z.coerce.number().int().positive().optional(),
  catalog_fuel_type_id: z.coerce.number().int().positive().optional(),
  catalog_year_id: z.coerce.number().int().positive().optional(),
  /** Solo formulario: reactivar un precio histórico en update. No se envía en create. */
  vehicle_price_id: optionalUuid,
  traction_id: z.uuid({ error: "Selecciona un tipo de tracción." }),
  transmission_type: z.enum(VEHICLE_TRANSMISSION_TYPE, {
    error: "Selecciona un tipo de transmisión.",
  }).default("manual"),
  power: z.coerce
    .number({ error: "Introduce la potencia." })
    .optional(),
  displacement: z.coerce
    .number({ error: "Introduce la cilindrada." }),
  autonomy: optionalNonNegativeNumber,
  battery_capacity: optionalNonNegativeNumber,
  time_to_charge: optionalNonNegativeNumber,
  license_plate: z
    .union([
      z.literal(""),
      z
        .string()
        .min(5, { error: "La matrícula debe tener al menos 5 caracteres." }),
    ])
    .optional(),

  // --- Publicador y contacto ---
  publisher_type: z.enum(VEHICLE_PUBLISHER_TYPE, {
    error: "Selecciona el tipo de publicador.",
  }),
  phone: phoneSchema,
  email: z.email({ error: "Introduce un correo electrónico válido." }),

  // --- Relaciones opcionales (IDs) ---
  category_id: optionalUuid,
  color_id: optionalUuid,
  dgt_label_id: optionalUuid,
  warranty_type_id: optionalUuid,
  features_ids: optionalUuidArray,
  services_ids: optionalUuidArray,
  cuota_ids: optionalUuidArray,
});

export const createVehicleSchema = vehicleSchema;

export const updateVehicleSchema = vehicleSchema.partial();
