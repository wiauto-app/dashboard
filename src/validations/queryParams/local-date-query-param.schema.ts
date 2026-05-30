import { isValid, parseISO } from "date-fns";
import { z } from "zod";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Query param de fecha calendario (`yyyy-MM-dd`).
 * Usa `parseISO` para medianoche local y evitar el desfase de un día
 * que produce `z.coerce.date()` con strings solo-fecha (UTC vs local).
 */
export const localDateQueryParamSchema = z
  .union([z.string(), z.date()])
  .optional()
  .transform((value, ctx) => {
    if (value == null || value === "") {
      return undefined;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }

    const dateOnly = value.slice(0, 10);

    if (!DATE_ONLY_PATTERN.test(dateOnly)) {
      ctx.addIssue({
        code: "custom",
        message: "Formato de fecha invalido. Use yyyy-MM-dd",
      });
      return z.NEVER;
    }

    const parsed = parseISO(dateOnly);

    if (!isValid(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: "Fecha invalida",
      });
      return z.NEVER;
    }

    return parsed;
  });
