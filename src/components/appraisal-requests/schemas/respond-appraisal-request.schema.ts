import z from "zod";

export const respondAppraisalRequestSchema = z
  .object({
    estimated_price_min: z.coerce
      .number({ error: "Introduce el precio mínimo estimado." })
      .min(0, { error: "El precio no puede ser negativo." }),
    estimated_price_max: z.coerce
      .number({ error: "Introduce el precio máximo estimado." })
      .min(0, { error: "El precio no puede ser negativo." }),
    admin_note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.estimated_price_max < data.estimated_price_min) {
      ctx.addIssue({
        code: "custom",
        message: "El precio máximo no puede ser menor al mínimo.",
        path: ["estimated_price_max"],
      });
    }
  });

export type RespondAppraisalRequestSchema = z.infer<
  typeof respondAppraisalRequestSchema
>;
