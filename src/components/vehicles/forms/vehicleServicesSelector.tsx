import { Controller, useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { VehicleSchema } from "../types/vehicles.types";
import { catalogServicesService } from "../services/catalogServicesService";
import { toggleCatalogIdInList } from "../utils/toggleCatalogIdInList";
import { OptionalFieldLabel } from "./optionalFieldLabel";

export const VehicleServicesSelector = () => {
  const form = useFormContext<VehicleSchema>();
  const { data: services } = useQuery({
    queryKey: ["catalog-services"],
    queryFn: () => catalogServicesService.findAll({ page: 1, limit: 100 }),
  });

  const serviceItems = services?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <OptionalFieldLabel optional>Servicios</OptionalFieldLabel>
      <Controller
        name="services_ids"
        control={form.control}
        render={({ field, fieldState }) => {
          const ids = Array.isArray(field.value) ? field.value : [];

          return (
            <>
              {serviceItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay servicios en el catálogo
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {serviceItems.map((service) => {
                    const checkboxId = `vehicle-service-${service.id}`;
                    const isChecked = ids.includes(service.id);

                    return (
                      <Field
                        key={service.id}
                        orientation="horizontal"
                        className="flex-row-reverse items-center gap-3"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor={checkboxId} className="flex flex-col gap-0.5">
                          <span>{service.name}</span>
                          {service.description ? (
                            <span className="text-muted-foreground text-xs font-normal">
                              {service.description}
                            </span>
                          ) : null}
                        </FieldLabel>
                        <Checkbox
                          id={checkboxId}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const isOn = checked === true;
                            field.onChange(
                              toggleCatalogIdInList(ids, service.id, isOn),
                            );
                          }}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    );
                  })}
                </div>
              )}
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </>
          );
        }}
      />
    </div>
  );
};
