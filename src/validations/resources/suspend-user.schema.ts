import { z } from "zod";


export const suspendUserSchema = z.object({
  suspension_duration_type_id: z.uuid({ error: "El tipo de duración es requerido." }),
  suspension_reason: z.string().min(1, { error: "La razón es requerida." }),
}); 