import { Controller, useFormContext } from "react-hook-form";
import type { VehicleSchema } from "../types/vehicles.types";
import { ControllerInput } from "@/components/ui/controllerInput";
import { PhoneInput } from "@/components/ui/phoneInput";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { VehiclePublisherTypeSelector } from "@/components/dynamicSelectors/vehiclePublisherTypeSelector";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const VehicleSummaryForm = () => {
  const form = useFormContext<VehicleSchema>();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Resumen y contacto</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ControllerInput
          name="publisher_type"
          control={form.control}
          label="Tipo de publicador"
        >
          {({ field }) => (
            <VehiclePublisherTypeSelector
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              disabled={field.disabled}
              placeholder="Seleccionar tipo"
            />
          )}
        </ControllerInput>
        <ControllerInput name="email" control={form.control} label="Correo electrónico" />
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <PhoneInput
                value={{
                  phone_code: field.value.phone_code,
                  phone: field.value.phone,
                }}
                onChange={field.onChange}
                ariaInvalid={fieldState.invalid}
              />
              {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <Label>Ubicación (coordenadas)</Label>
        <p className="text-sm text-muted-foreground">
          Introduce latitud y longitud manualmente. Más adelante podrás elegir el punto en un
          mapa.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ControllerInput name="lat" control={form.control} label="Latitud">
          {({ field, fieldState }) => (
            <Input
                {...field}
                value={field.value == null ? "" : String(field.value)}
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="Ej. 40.4168"
                aria-invalid={fieldState.invalid}
              />
            )}
          </ControllerInput>
          <ControllerInput name="lng" control={form.control} label="Longitud">
          {({ field, fieldState }) => (
            <Input
                {...field}
                value={field.value == null ? "" : String(field.value)}
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="Ej. -3.7038"
                aria-invalid={fieldState.invalid}
              />
            )}
          </ControllerInput>
        </div>
      </div>
    </div>
  );
};
