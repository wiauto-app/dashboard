import type { FieldValues, Resolver } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

/**
 * Adapta un schema Zod/Standard Schema a Resolver de RHF cuando
 * input/output difieren (z.coerce, .default, .transform) o el schema
 * es una unión create|update.
 */
export const asFormResolver = <TFieldValues extends FieldValues>(
  schema: Parameters<typeof standardSchemaResolver>[0],
): Resolver<TFieldValues> =>
  standardSchemaResolver(schema) as Resolver<TFieldValues>;
