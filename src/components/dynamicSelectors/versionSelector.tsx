import { catalogVersionsService } from "@/components/vehicles/services/catalogVersionsService";
import type { CatalogVersionItem } from "@/components/vehicles/types/catalog.types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Field, FieldLabel } from "../ui/field";
import { BaseSelector } from "./baseSelector";

type VersionOption = CatalogVersionItem & { label: string };

/**
 * Lista versiones filtradas por modelo + combustible + año (backend `GET /v1/catalog/versions`).
 * La consulta solo se hace cuando hay los tres IDs; el paso del año es el disparador en UI.
 */
export const VersionSelector = ({
  value,
  onChange,
  modelId,
  fuelTypeId,
  yearId,
  ariaInvalid,
  disabled,
  placeholder = "Versión",
  hideLabel = false,
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
  modelId?: number;
  fuelTypeId?: number;
  yearId?: number;
  ariaInvalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Si true, no se muestra `FieldLabel` (útil cuando el padre ya tiene label, p. ej. react-hook-form). */
  hideLabel?: boolean;
}) => {
  const canFetch = Boolean(modelId && fuelTypeId && yearId);
  const { data, isLoading } = useQuery({
    queryKey: ["catalogVersions", modelId, fuelTypeId, yearId],
    queryFn: () =>
      catalogVersionsService.findAll({
        model_id: modelId,
        fuel_type_id: fuelTypeId,
        year_id: yearId,
        page: 1,
        limit: 100,
      }),
    enabled: canFetch,
  });


  const items = useMemo<VersionOption[]>(
    () =>
      (data?.data ?? []).map((item) => ({
        ...item,
        label: item.name,
      })),
    [data?.data],
  );

  const content = isLoading ? (
    <div
      className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground"
      aria-live="polite"
    >
      Cargando versiones...
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
          : !fuelTypeId
            ? "Selecciona un combustible primero"
            : !yearId
              ? "Selecciona un año primero"
              : "No hay versiones para esta combinación"
      }
    />
  );

  if (hideLabel) {
    return (
      <div data-invalid={ariaInvalid} className="w-full">
        {content}
      </div>
    );
  }

  return (
    <Field data-invalid={ariaInvalid}>
      <FieldLabel htmlFor="version-selector">Versión</FieldLabel>
      {content}
    </Field>
  );
};
