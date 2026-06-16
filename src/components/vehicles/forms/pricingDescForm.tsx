import { Controller, useFormContext } from "react-hook-form";
import type { VehiclePriceHistoryItem, VehicleSchema } from "../types/vehicles.types";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PricingSuggestion } from "./pricingSuggestion";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { OptionalFieldLabel } from "./optionalFieldLabel";
import { useQuery } from "@tanstack/react-query";
import { cuotasService } from "../services/cuotasService";
import { VehiclePriceSelector } from "./vehiclePriceSelector";

type PricingDescFormProps = {
  vehicle_prices?: VehiclePriceHistoryItem[];
  isEditMode?: boolean;
};

const toggleCuotaIdInList = (
  current_ids: string[],
  cuota_id: string,
  checked: boolean,
): string[] => {
  if (checked) {
    if (current_ids.includes(cuota_id)) {
      return current_ids;
    }
    return [...current_ids, cuota_id];
  }
  return current_ids.filter((id) => id !== cuota_id);
};

export const PricingDescForm = ({
  vehicle_prices = [],
  isEditMode = false,
}: PricingDescFormProps) => {
  const form = useFormContext<VehicleSchema>();
  const { data: cuotas_page } = useQuery({
    queryKey: ["cuotas", "all-plans"],
    queryFn: () => cuotasService.findAll({ page: 1, limit: 100 }),
  });

  const cuotas = cuotas_page?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PricingSuggestion />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <VehiclePriceSelector
          vehicle_prices={vehicle_prices}
          isEditMode={isEditMode}
        />
      </div>
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        )}
      />
      <Separator />
      <div className="flex flex-col gap-4">
        <OptionalFieldLabel optional>
          Planes de financiación / cuotas
        </OptionalFieldLabel>
        <p className="text-sm text-muted-foreground">
          Marca uno o más planes disponibles para este anuncio (p. ej. plazos en
          meses).
        </p>
        <Controller
          name="cuota_ids"
          control={form.control}
          render={({ field, fieldState }) => {
            const ids = Array.isArray(field.value) ? field.value : [];

            return (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {cuotas.map((cuota) => {
                    const checkbox_id = `vehicle-cuota-${cuota.id}`;
                    const is_checked = ids.includes(cuota.id);
                    const label = `${cuota.name} (${cuota.value})`;

                    return (
                      <Field
                        key={cuota.id}
                        orientation="horizontal"
                        className="flex-row-reverse items-center gap-3"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor={checkbox_id}>{label}</FieldLabel>
                        <Checkbox
                          id={checkbox_id}
                          checked={is_checked}
                          onCheckedChange={(checked) => {
                            const is_on = checked === true;
                            field.onChange(
                              toggleCuotaIdInList(
                                ids,
                                cuota.id,
                                is_on,
                              ),
                            );
                          }}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    );
                  })}
                </div>
                {!cuotas.length ? (
                  <p className="text-sm text-muted-foreground">
                    No hay planes configurados. Añádelos en Administración de
                    vehículos → Cuotas.
                  </p>
                ) : null}
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </>
            );
          }}
        />
      </div>
    </div>
  );
};
