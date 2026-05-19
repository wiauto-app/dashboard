import { bodyTypesService } from "@/components/vehicles/services/bodyTypesService";
import type { CatalogBodyTypeItem } from "@/components/vehicles/types/catalog.types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Field, FieldLabel } from "../ui/field";
import { BaseSelector } from "./baseSelector";

type BodyTypeOption = CatalogBodyTypeItem & { label: string };

const formatBodyTypeLabel = (item: CatalogBodyTypeItem) =>
  item.doors > 0 ? `${item.name} (${item.doors} puertas)` : item.name;

export const BodyTypeSelector = ({
  value,
  onChange,
  modelId,
  ariaInvalid,
  disabled,
  placeholder = "Carrocería",
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
  modelId?: number;
  ariaInvalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["catalogBodyTypes", modelId],
    queryFn: () =>
      bodyTypesService.findAll({
        model_id: modelId,
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(modelId),
  });

  const items = useMemo<BodyTypeOption[]>(
    () =>
      (data?.data ?? []).map((item) => ({
        ...item,
        label: formatBodyTypeLabel(item),
      })),
    [data?.data],
  );

  return (
    <Field data-invalid={ariaInvalid}>
      <FieldLabel htmlFor="body-type-selector">Carrocería</FieldLabel>
      {isLoading ? (
        <div
          className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground"
          aria-live="polite"
        >
          Cargando carrocerías...
        </div>
      ) : (
        <BaseSelector
          items={items}
          value={value}
          onChange={(next_value) => onChange?.(next_value)}
          labelKey="label"
          valueKey="id"
          placeholder={placeholder}
          disabled={disabled || !modelId}
          emptyLabel={
            modelId
              ? "No hay carrocerías para este modelo"
              : "Selecciona un modelo primero"
          }
        />
      )}
    </Field>
  );
};
