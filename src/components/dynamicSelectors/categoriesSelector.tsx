import { categoriesService } from "@/components/vehicles/services/categoriesService";
import type { CategoryItem } from "@/components/vehicles/types/category.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const CategoriesSelector = ({
  onValueChange,
  value,
  ariaInvalid,
  disabled,
}: {
  onValueChange: (value: string | undefined) => void;
  value?: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
}) => (
  <CatalogResourceSelector<CategoryItem>
    queryKey={["categories"]}
    fetchItems={() => categoriesService.findAll({ page: 1, limit: 100 })}
    value={value}
    onValueChange={onValueChange}
    placeholder="Categoría"
    ariaInvalid={ariaInvalid}
    disabled={disabled}
    getItemValue={(item) => item.id}
    getItemLabel={(item) => item.name}
  />
);
