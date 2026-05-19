import { catalogVersionsService } from "@/components/vehicles/services/catalogVersionsService";
import type { CatalogVersionItem } from "@/components/vehicles/types/catalog.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const CatalogVersionsSelector = ({
  onValueChange,
  value,
  ariaInvalid,
  disabled,
  model_id,
  fuel_type_id,
  year_id,
}: {
  onValueChange: (value: number) => void;
  value?: number;
  ariaInvalid?: boolean;
  disabled?: boolean;
  /** Si se envían los tres, el listado queda filtrado como en el catálogo. */
  model_id?: number;
  fuel_type_id?: number;
  year_id?: number;
}) => {
  const filtered =
    model_id != null && fuel_type_id != null && year_id != null
      ? { model_id, fuel_type_id, year_id }
      : undefined;

  const catalog_versions_query_suffix = filtered
    ? `${filtered.model_id}-${filtered.fuel_type_id}-${filtered.year_id}`
    : "unfiltered";

  return (
    <CatalogResourceSelector<CatalogVersionItem>
      queryKey={["catalog-versions", catalog_versions_query_suffix]}
      fetchItems={() =>
        catalogVersionsService.findAll({
          page: 1,
          limit: 100,
          ...(filtered ?? {}),
        })
      }
      value={value != null ? String(value) : undefined}
      onValueChange={(next_value) => onValueChange(Number(next_value))}
      placeholder="Versión del catálogo"
      ariaInvalid={ariaInvalid}
      disabled={disabled}
      getItemValue={(item) => String(item.id)}
      getItemLabel={(item) => item.name}
    />
  );
};
