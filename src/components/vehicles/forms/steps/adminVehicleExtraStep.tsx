import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { BodyTypeSelector } from "@/components/dynamicSelectors/bodyTypeSelector";
import { CategoriesSelector } from "@/components/dynamicSelectors/categoriesSelector";
import { ColorsSelector } from "@/components/dynamicSelectors/colorsSelector";
import { DgtLabelsSelector } from "@/components/dynamicSelectors/dgtLabelsSelector";
import { FuelTypeSelector } from "@/components/dynamicSelectors/fuelTypeSelector";
import { TractionsSelector } from "@/components/dynamicSelectors/tractionsSelector";
import { VehicleTransmissionTypeSelector } from "@/components/dynamicSelectors/vehicleTransmissionTypeSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { ControllerInput } from "@/components/ui/controllerInput";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import type { VehicleSchema } from "../../types/vehicles.types";
import { featuresService } from "../../services/featuresService";
import { fuelTypesService } from "../../services/fuelTypesService";
import { OptionalFieldLabel } from "../optionalFieldLabel";
import { VehicleServicesSelector } from "../vehicleServicesSelector";
import { toggleCatalogIdInList } from "../../utils/toggleCatalogIdInList";

export const AdminVehicleExtraStep = () => {
  const form = useFormContext<VehicleSchema>();

  const catalogModelId = useWatch({
    control: form.control,
    name: "catalog_model_id",
  });
  const catalogBodyTypeId = useWatch({
    control: form.control,
    name: "catalog_body_type_id",
  });
  const catalogFuelTypeId = useWatch({
    control: form.control,
    name: "catalog_fuel_type_id",
  });

  const modelId =
    catalogModelId !== undefined ? Number(catalogModelId) : undefined;
  const bodyTypeId =
    catalogBodyTypeId !== undefined ? Number(catalogBodyTypeId) : undefined;

  const { data: fuel_types_page } = useQuery({
    queryKey: ["catalogFuelTypes", modelId, bodyTypeId, "can-charge"],
    queryFn: () =>
      fuelTypesService.findAll({
        model_id: modelId,
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(modelId && bodyTypeId),
  });

  useEffect(() => {
    if (!catalogFuelTypeId || !fuel_types_page?.data) {
      form.setValue("catalog_fuel_can_charge", false, { shouldDirty: false });
      return;
    }
    const fuel = fuel_types_page.data.find(
      (item) => item.id === Number(catalogFuelTypeId),
    );
    form.setValue("catalog_fuel_can_charge", Boolean(fuel?.can_charge), {
      shouldDirty: false,
    });
  }, [catalogFuelTypeId, fuel_types_page?.data, form]);

  const catalog_fuel_can_charge = useWatch({
    control: form.control,
    name: "catalog_fuel_can_charge",
  });

  const { data: features } = useQuery({
    queryKey: ["features"],
    queryFn: () => featuresService.findAll({ page: 1, limit: 100 }),
  });

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Combustible y carrocería (se rellenan al elegir la versión; revísalos si
        hace falta).
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BodyTypeSelector
          modelId={modelId}
          value={
            catalogBodyTypeId !== undefined
              ? String(catalogBodyTypeId)
              : undefined
          }
          onChange={(value) => {
            form.setValue(
              "catalog_body_type_id",
              value ? Number(value) : undefined,
              { shouldDirty: true, shouldValidate: true },
            );
          }}
          disabled={!modelId}
        />
        <FuelTypeSelector
          modelId={modelId}
          bodyTypeId={bodyTypeId}
          value={
            catalogFuelTypeId !== undefined
              ? String(catalogFuelTypeId)
              : undefined
          }
          onChange={(value) => {
            form.setValue(
              "catalog_fuel_type_id",
              value ? Number(value) : undefined,
              { shouldDirty: true, shouldValidate: true },
            );
          }}
          disabled={!modelId || !bodyTypeId}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ControllerInput name="color_id" control={form.control} label="Color" optional>
          {({ field, fieldState }) => (
            <ColorsSelector
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              ariaInvalid={fieldState.invalid}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
        <ControllerInput
          name="category_id"
          control={form.control}
          label="Categoría"
          optional
        >
          {({ field, fieldState }) => (
            <CategoriesSelector
              onValueChange={(next) => field.onChange(next ?? null)}
              value={
                field.value === null || field.value === undefined
                  ? undefined
                  : String(field.value)
              }
              ariaInvalid={fieldState.invalid}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
        <ControllerInput
          name="dgt_label_id"
          control={form.control}
          label="Etiqueta DGT"
          optional
        >
          {({ field, fieldState }) => (
            <DgtLabelsSelector
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              ariaInvalid={fieldState.invalid}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
      </div>

      <Separator />
      <h2 className="text-lg font-semibold">Ficha técnica</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ControllerInput
          name="transmission_type"
          control={form.control}
          label="Transmisión"
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
          optional
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
          name="power"
          control={form.control}
          label="Potencia (CV)"
          optional
        >
          {({ field, fieldState }) => (
            <Input
              {...field}
              value={field.value == null ? "" : String(field.value)}
              type="number"
              inputMode="numeric"
              min={1}
              max={9999}
              aria-invalid={fieldState.invalid}
            />
          )}
        </ControllerInput>
        <ControllerInput
          name="displacement"
          control={form.control}
          label="Cilindrada (cc)"
          optional
        >
          {({ field, fieldState }) => (
            <Input
              {...field}
              value={field.value == null ? "" : String(field.value)}
              type="number"
              inputMode="numeric"
              min={0}
              max={20000}
              aria-invalid={fieldState.invalid}
            />
          )}
        </ControllerInput>
      </div>

      {catalog_fuel_can_charge ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ControllerInput
            name="autonomy"
            control={form.control}
            label="Autonomía (km)"
            optional
          >
            {({ field, fieldState }) => (
              <Input
                {...field}
                value={field.value == null ? "" : String(field.value)}
                type="number"
                min={0}
                max={2000}
                aria-invalid={fieldState.invalid}
              />
            )}
          </ControllerInput>
          <ControllerInput
            name="battery_capacity"
            control={form.control}
            label="Capacidad batería (kWh)"
            optional
          >
            {({ field, fieldState }) => (
              <Input
                {...field}
                value={field.value == null ? "" : String(field.value)}
                type="number"
                min={0}
                max={500}
                aria-invalid={fieldState.invalid}
              />
            )}
          </ControllerInput>
          <ControllerInput
            name="time_to_charge"
            control={form.control}
            label="Tiempo de carga (h)"
            optional
          >
            {({ field, fieldState }) => (
              <Input
                {...field}
                value={field.value == null ? "" : String(field.value)}
                type="number"
                min={0}
                max={100}
                step="0.1"
                aria-invalid={fieldState.invalid}
              />
            )}
          </ControllerInput>
        </div>
      ) : null}

      <Separator />
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
                  const checkbox_id = `admin-vehicle-feature-${feature.id}`;
                  const is_checked = ids.includes(feature.id);

                  return (
                    <Field
                      key={feature.id}
                      orientation="horizontal"
                      className="flex-row-reverse items-center gap-3"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor={checkbox_id}>{feature.name}</FieldLabel>
                      <Checkbox
                        id={checkbox_id}
                        checked={is_checked}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            toggleCatalogIdInList(
                              ids,
                              feature.id,
                              checked === true,
                            ),
                          );
                        }}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  );
                })}
              </div>
              {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
            </>
          );
        }}
      />
      <VehicleServicesSelector />
    </div>
  );
};
