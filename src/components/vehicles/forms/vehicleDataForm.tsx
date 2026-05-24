import { ControllerInput } from "@/components/ui/controllerInput";
import { VehicleTypesSelector } from "@/components/dynamicSelectors/vehicleTypesSelector";
import { VersionForm } from "./versionForm";
import { useFormContext, useWatch } from "react-hook-form";
import type { VehicleSchema } from "../types/vehicles.types";
import { useMemo } from "react";

export const VehicleDataForm = () => {
  const form = useFormContext<VehicleSchema>();

  const [
    catalog_make_id,
    catalog_model_id,
    catalog_body_type_id,
    catalog_fuel_type_id,
    catalog_year_id,
  ] = useWatch({
    control: form.control,
    name: [
      "catalog_make_id",
      "catalog_model_id",
      "catalog_body_type_id",
      "catalog_fuel_type_id",
      "catalog_year_id",
    ],
  });

  const initialCatalogIds = useMemo(() => {
    if (!catalog_make_id) {
      return undefined;
    }

    return {
      makeId: String(catalog_make_id),
      modelId: catalog_model_id ? String(catalog_model_id) : undefined,
      bodyTypeId: catalog_body_type_id
        ? String(catalog_body_type_id)
        : undefined,
      fuelTypeId: catalog_fuel_type_id
        ? String(catalog_fuel_type_id)
        : undefined,
      yearId: catalog_year_id ? String(catalog_year_id) : undefined,
    };
  }, [
    catalog_make_id,
    catalog_model_id,
    catalog_body_type_id,
    catalog_fuel_type_id,
    catalog_year_id,
  ]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ControllerInput
          name="license_plate"
          control={form.control}
          label="Matrícula"
          optional
        />
        <ControllerInput
          name="vin_code"
          control={form.control}
          label="VIN"
          optional
        />
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
                  initialCatalogIds={initialCatalogIds}
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
