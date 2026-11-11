import { Controller, useFormContext } from "react-hook-form";
import { WarrantyTypesSelector } from "@/components/dynamicSelectors/warrantyTypesSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { ControllerInput } from "@/components/ui/controllerInput";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import type {
  VehiclePriceHistoryItem,
  VehicleSchema,
} from "../../types/vehicles.types";
import { cuotasService } from "../../services/cuotasService";
import { OptionalFieldLabel } from "../optionalFieldLabel";
import { VehiclePriceSelector } from "../vehiclePriceSelector";

interface AdminVehicleFinanceStepProps {
  isEditMode?: boolean;
  vehicle_prices?: VehiclePriceHistoryItem[];
}

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

export const AdminVehicleFinanceStep = ({
  isEditMode = false,
  vehicle_prices = [],
}: AdminVehicleFinanceStepProps) => {
  const form = useFormContext<VehicleSchema>();

  const { data: cuotas_page } = useQuery({
    queryKey: ["cuotas", "all-plans"],
    queryFn: () => cuotasService.findAll({ page: 1, limit: 100 }),
  });

  const cuotas = cuotas_page?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-lg font-semibold">Garantía y financiación</h2>

      {isEditMode ? (
        <VehiclePriceSelector
          vehicle_prices={vehicle_prices}
          isEditMode={isEditMode}
        />
      ) : null}

      <ControllerInput
        name="offer_financing"
        control={form.control}
        label="Ofrecer financiación"
        orientation="horizontal"
      >
        {({ field, fieldState }) => (
          <Switch
            checked={field.value as boolean}
            onCheckedChange={(checked) => field.onChange(checked as boolean)}
            aria-invalid={fieldState.invalid}
            aria-label="Ofrecer financiación"
          />
        )}
      </ControllerInput>

      <ControllerInput
        name="finance_price"
        control={form.control}
        label="Precio financiado (€)"
        optional
      >
        {({ field, fieldState }) => (
          <Input
            {...field}
            value={field.value == null ? "" : String(field.value)}
            type="number"
            min={0}
            max={9_999_999}
            aria-invalid={fieldState.invalid}
          />
        )}
      </ControllerInput>

      <ControllerInput
        name="show_first_cuota"
        control={form.control}
        label="Mostrar primera cuota"
        orientation="horizontal"
      >
        {({ field, fieldState }) => (
          <Switch
            checked={field.value as boolean}
            onCheckedChange={(checked) => field.onChange(checked as boolean)}
            aria-invalid={fieldState.invalid}
            aria-label="Mostrar primera cuota"
          />
        )}
      </ControllerInput>

      <Separator />

      <OptionalFieldLabel optional>Planes de financiación / cuotas</OptionalFieldLabel>
      <Controller
        name="cuota_ids"
        control={form.control}
        render={({ field, fieldState }) => {
          const ids = Array.isArray(field.value) ? field.value : [];

          return (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {cuotas.map((cuota) => {
                  const checkbox_id = `admin-vehicle-cuota-${cuota.id}`;
                  const is_checked = ids.includes(cuota.id);

                  return (
                    <Field
                      key={cuota.id}
                      orientation="horizontal"
                      className="flex-row-reverse items-center gap-3"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor={checkbox_id}>
                        {cuota.name} ({cuota.value})
                      </FieldLabel>
                      <Checkbox
                        id={checkbox_id}
                        checked={is_checked}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            toggleCuotaIdInList(ids, cuota.id, checked === true),
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
                  No hay planes configurados en el catálogo de cuotas.
                </p>
              ) : null}
              {fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </>
          );
        }}
      />

      <Separator />

      <div className="flex flex-col gap-4">
        <ControllerInput
          name="by_brand_warranty"
          control={form.control}
          label="Garantía de la marca"
          orientation="horizontal"
        >
          {({ field, fieldState }) => (
            <Switch
              checked={field.value as boolean}
              onCheckedChange={(checked) => field.onChange(checked as boolean)}
              aria-invalid={fieldState.invalid}
              aria-label="Garantía de la marca"
            />
          )}
        </ControllerInput>
        <ControllerInput
          name="warranty_type_id"
          control={form.control}
          label="Tipo de garantía"
          optional
        >
          {({ field, fieldState }) => (
            <WarrantyTypesSelector
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              ariaInvalid={fieldState.invalid}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
      </div>

      <Separator />
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
            <FieldDescription>
              Opcional. Máximo 3000 caracteres.
            </FieldDescription>
            <Textarea
              {...field}
              id={field.name}
              value={field.value ?? ""}
              maxLength={3000}
              rows={5}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        )}
      />
    </div>
  );
};
