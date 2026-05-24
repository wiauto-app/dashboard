import { BodyTypeSelector } from "@/components/dynamicSelectors/bodyTypeSelector";
import { FuelTypeSelector } from "@/components/dynamicSelectors/fuelTypeSelector";
import { MakeSelector } from "@/components/dynamicSelectors/makeSelector";
import { ModelSelector } from "@/components/dynamicSelectors/modelSelector";
import { VersionSelector } from "@/components/dynamicSelectors/versionSelector";
import { YearSelector } from "@/components/dynamicSelectors/yearSelector";
import { useEffect, useMemo, useState } from "react";

/** IDs del asistente de catálogo (la versión elegida vive en el formulario padre vía `versionId`). */
export type CatalogCascadeIds = {
  makeId?: string;
  modelId?: string;
  bodyTypeId?: string;
  fuelTypeId?: string;
  yearId?: string;
};

export type VersionFormProps = {
  /** Valor controlado desde react-hook-form (`version_id`). */
  versionId?: string;
  /** Notifica cambios de versión al padre (string id del catálogo). */
  onVersionIdChange?: (value: string | undefined) => void;
  /** Precarga marca → año al editar un vehículo existente. */
  initialCatalogIds?: CatalogCascadeIds;
  ariaInvalid?: boolean;
  /** Oculta la etiqueta del último selector si el padre ya muestra label (p. ej. `ControllerInput`). */
  hideVersionLabel?: boolean;
};

const toNumericId = (value?: string) => (value ? Number(value) : undefined);

const patchIds = (
  prev: CatalogCascadeIds,
  field: keyof CatalogCascadeIds,
  value: string | undefined,
  resetKeys: (keyof CatalogCascadeIds)[],
): CatalogCascadeIds => {
  const next: CatalogCascadeIds = { ...prev, [field]: value };
  for (const key of resetKeys) {
    next[key] = undefined;
  }
  return next;
};

const catalog_ids_signature = (ids?: CatalogCascadeIds) =>
  [
    ids?.makeId ?? "",
    ids?.modelId ?? "",
    ids?.bodyTypeId ?? "",
    ids?.fuelTypeId ?? "",
    ids?.yearId ?? "",
  ].join(":");

export const VersionForm = ({
  versionId,
  onVersionIdChange,
  initialCatalogIds,
  ariaInvalid,
  hideVersionLabel = false,
}: VersionFormProps) => {
  const [ids, setIds] = useState<CatalogCascadeIds>(
    () => initialCatalogIds ?? {},
  );

  const initialCatalogSignature = useMemo(
    () => catalog_ids_signature(initialCatalogIds),
    [initialCatalogIds],
  );

  useEffect(() => {
    if (!initialCatalogIds) {
      return;
    }
    setIds(initialCatalogIds);
  }, [initialCatalogSignature, initialCatalogIds]);

  const updateIds = (
    field: keyof CatalogCascadeIds,
    value: string | undefined,
    resetKeys: (keyof CatalogCascadeIds)[] = [],
  ) => {
    setIds((prev) => patchIds(prev, field, value, resetKeys));
    onVersionIdChange?.(undefined);
  };

  const resolvedModelId = toNumericId(ids.modelId);
  const resolvedBodyTypeId = toNumericId(ids.bodyTypeId);
  const resolvedFuelTypeId = toNumericId(ids.fuelTypeId);
  const resolvedYearId = toNumericId(ids.yearId);

  return (
    <>
      <MakeSelector
        value={ids.makeId}
        onChange={(value) =>
          updateIds("makeId", value, ["modelId", "bodyTypeId", "fuelTypeId", "yearId"])
        }
      />
      <ModelSelector
        makeId={toNumericId(ids.makeId)}
        value={ids.modelId}
        onChange={(value) =>
          updateIds("modelId", value, ["bodyTypeId", "fuelTypeId", "yearId"])
        }
      />
      <BodyTypeSelector
        modelId={resolvedModelId}
        value={ids.bodyTypeId}
        onChange={(value) => updateIds("bodyTypeId", value, ["fuelTypeId", "yearId"])}
      />
      <FuelTypeSelector
        modelId={resolvedModelId}
        bodyTypeId={resolvedBodyTypeId}
        value={ids.fuelTypeId}
        onChange={(value) => updateIds("fuelTypeId", value, ["yearId"])}
      />
      <YearSelector
        modelId={resolvedModelId}
        bodyTypeId={resolvedBodyTypeId}
        fuelTypeId={resolvedFuelTypeId}
        value={ids.yearId}
        onChange={(value) => updateIds("yearId", value, [])}
      />
      <VersionSelector
        modelId={resolvedModelId}
        fuelTypeId={resolvedFuelTypeId}
        yearId={resolvedYearId}
        value={versionId}
        hideLabel={hideVersionLabel}
        ariaInvalid={ariaInvalid}
        onChange={(value) => onVersionIdChange?.(value)}
      />
    </>
  );
};
