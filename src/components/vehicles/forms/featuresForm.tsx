import { Controller, useFormContext } from "react-hook-form";
import type { VehicleSchema } from "../types/vehicles.types";
import { featuresService } from "../services/featuresService";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ControllerInput } from "@/components/ui/controllerInput";
import { TractionsSelector } from "@/components/dynamicSelectors/tractionsSelector";
import { VehicleConditionSelector } from "@/components/dynamicSelectors/vehicleConditionSelector";
import { VehicleTransmissionTypeSelector } from "@/components/dynamicSelectors/vehicleTransmissionTypeSelector";
import { Separator } from "@/components/ui/separator";
import { OptionalFieldLabel } from "./optionalFieldLabel";

const toggle_feature_id_in_list = (
  current_ids: string[],
  feature_id: string,
  checked: boolean,
): string[] => {
  if (checked) {
    if (current_ids.includes(feature_id)) {
      return current_ids;
    }
    return [...current_ids, feature_id];
  }
  return current_ids.filter((id) => id !== feature_id);
};

export const FeaturesForm = () => {
  const form = useFormContext<VehicleSchema>();
  const { data: features } = useQuery({
    queryKey: ["features"],
    queryFn: () => featuresService.findAll({ page: 1, limit: 100 }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ControllerInput
          name="mileage"
          control={form.control}
          label="Kilometraje"
        />
        <ControllerInput
          name="condition"
          control={form.control}
          label="Condición"
        >
          {({ field }) => (
            <VehicleConditionSelector
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>

        <ControllerInput
          name="transmission_type"
          control={form.control}
          label="Tipo de transmisión"
          optional
        >
          {({ field }) => (
            <VehicleTransmissionTypeSelector
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
        <ControllerInput
          name="traction_id"
          control={form.control}
          label="Tracción"
        >
          {({ field, fieldState }) => (
            <TractionsSelector
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              ariaInvalid={fieldState.invalid}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
        <ControllerInput
          name="displacement"
          control={form.control}
          label="Cilindrada (cc)"
        />
        <ControllerInput
          name="power"
          control={form.control}
          label="Potencia CV o kW"
          optional
        />
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <OptionalFieldLabel optional>Características</OptionalFieldLabel>
        <Controller
          name="features_ids"
          control={form.control}
          render={({ field, fieldState }) => {
            const ids = Array.isArray(field.value) ? field.value : [];

            return (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {features?.data.map((feature) => {
                    const checkbox_id = `vehicle-feature-${feature.id}`;
                    const is_checked = ids.includes(feature.id);

                    return (
                      <Field
                        key={feature.id}
                        orientation="horizontal"
                        className="flex-row-reverse items-center gap-3"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor={checkbox_id}>
                          {feature.name}
                        </FieldLabel>
                        <Checkbox
                          id={checkbox_id}
                          checked={is_checked}
                          onCheckedChange={(checked) => {
                            const is_on = checked === true;
                            field.onChange(
                              toggle_feature_id_in_list(ids, feature.id, is_on),
                            );
                          }}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    );
                  })}
                </div>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </>
            );
          }}
        />
      </div>
    </div>
  );
};
