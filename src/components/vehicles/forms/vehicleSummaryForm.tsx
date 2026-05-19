import { Controller, useFormContext } from "react-hook-form";
import type { VehicleSchema } from "../types/vehicles.types";
import { ControllerInput } from "@/components/ui/controllerInput";
import { PhoneInput } from "@/components/ui/phoneInput";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
// import { CustomMap } from "@/components/layout/CustomMap";
export const VehicleSummaryForm = () => {
  const form = useFormContext<VehicleSchema>();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Resumen del vehículo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ControllerInput name="email" control={form.control} label="Email" />
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
              <PhoneInput
                value={{
                  phone_code: field.value.phone_code,
                  phone: field.value.phone,
                }}
                onChange={field.onChange}
                ariaInvalid={fieldState.invalid}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      {/* <CustomMap/> */}
    </div>
  );
};
