import { fuelTypesService } from "@/components/vehicles/services/fuelTypesService";
import type { CatalogFuelTypeItem } from "@/components/vehicles/types/catalog.types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Field, FieldLabel } from "../ui/field";
import { BaseSelector } from "./baseSelector";

type FuelTypeOption = CatalogFuelTypeItem & { label: string };

const formatFuelTypeLabel = (item: CatalogFuelTypeItem) =>
  item.can_charge ? `${item.name} (recargable)` : item.name;

export const FuelTypeSelector = ({
  value,
  onChange,
  modelId,
  bodyTypeId,
  ariaInvalid,
  disabled,
  placeholder = "Combustible",
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
  modelId?: number;
  /** Paso previo en UI; la consulta sigue filtrando por `model_id` en el backend. */
  bodyTypeId?: number;
  ariaInvalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const canFetch = Boolean(modelId && bodyTypeId);

  const { data, isLoading } = useQuery({
    queryKey: ["catalogFuelTypes", modelId, bodyTypeId],
    queryFn: () =>
      fuelTypesService.findAll({
        model_id: modelId,
        page: 1,
        limit: 100,
      }),
    enabled: canFetch,
  });

  const items = useMemo<FuelTypeOption[]>(
    () =>
      (data?.data ?? []).map((item) => ({
        ...item,
        label: formatFuelTypeLabel(item),
      })),
    [data?.data],
  );

  return (
    <Field data-invalid={ariaInvalid}>
      <FieldLabel htmlFor="fuel-type-selector">Combustible</FieldLabel>
      {isLoading ? (
        <div
          className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground"
          aria-live="polite"
        >
          Cargando combustibles...
        </div>
      ) : (
        <BaseSelector
          items={items}
          value={value}
          onChange={(next_value) => onChange?.(next_value)}
          labelKey="label"
          valueKey="id"
          placeholder={placeholder}
          disabled={disabled || !canFetch}
          emptyLabel={
            !modelId
              ? "Selecciona un modelo primero"
              : !bodyTypeId
                ? "Selecciona una carrocería primero"
                : "No hay combustibles para este modelo"
          }
        />
      )}
    </Field>
  );
};
