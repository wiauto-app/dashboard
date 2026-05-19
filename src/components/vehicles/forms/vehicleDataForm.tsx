import { ControllerInput } from "@/components/ui/controllerInput";
import { VehicleTypesSelector } from "@/components/dynamicSelectors/vehicleTypesSelector";
import { VersionForm } from "./versionForm";
import { useFormContext } from "react-hook-form";
import type { VehicleSchema } from "../types/vehicles.types";

export const VehicleDataForm = () => {
  const form = useFormContext<VehicleSchema>();
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ControllerInput
          name="license_plate"
          control={form.control}
          label="Matrícula"
        />
        <ControllerInput name="vin_code" control={form.control} label="VIN" />
        <ControllerInput name="title" control={form.control} label="Título" />
        <ControllerInput
          name="vehicle_type_id"
          control={form.control}
          label="Tipo de vehículo"
        >
          {({ field, fieldState }) => (
            <VehicleTypesSelector
              onValueChange={field.onChange}
              value={field.value as string}
              ariaInvalid={fieldState.invalid}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
        <div className="md:col-span-2">
          <ControllerInput
            name="version_id"
            control={form.control}
            label="Versión del catálogo"
          >
            {({ field, fieldState }) => (
              <div className="grid grid-cols-2 gap-3">
                <VersionForm
                  ariaInvalid={fieldState.invalid}
                  versionId={
                    field.value === "" ||
                    field.value === undefined ||
                    field.value === null
                      ? undefined
                      : String(field.value)
                  }
                  onVersionIdChange={(next) =>
                    field.onChange(
                      next === undefined || next === "" ? "" : Number(next),
                    )
                  }
                />
              </div>
            )}
          </ControllerInput>
        </div>
   
    
      </div>
    </div>
  );
};
