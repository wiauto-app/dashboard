import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginatedResult } from "@/types/general.types";

export interface CatalogResourceSelectorProps<T> {
  queryKey: string[];
  fetchItems: () => Promise<PaginatedResult<T>>;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
  getItemValue: (item: T) => string;
  getItemLabel: (item: T) => string;
}

export const CatalogResourceSelector = <T,>({
  queryKey,
  fetchItems,
  value,
  onValueChange,
  placeholder,
  ariaInvalid,
  disabled = false,
  getItemValue,
  getItemLabel,
}: CatalogResourceSelectorProps<T>) => {
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: fetchItems,
  });

  const items = data?.data ?? [];
  const select_items = items.map((item) => ({
    value: getItemValue(item),
    label: getItemLabel(item),
  }));


  return (
    <Select
      value={value ?? ""}
      onValueChange={(next_value) => {
        if (next_value != null) {
          onValueChange(next_value);
        }
      }}
      disabled={disabled || isLoading}
      items={select_items}
    >
      <SelectTrigger className="w-full" aria-invalid={ariaInvalid}>
        <SelectValue placeholder={isLoading ? "Cargando..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.length === 0 ? (
          <SelectItem value="__empty__" disabled className="opacity-70">
            No hay opciones disponibles
          </SelectItem>
        ) : (
          items.map((item) => {
            const item_value = getItemValue(item);
            return (
              <SelectItem key={item_value} value={item_value}>
                {getItemLabel(item)}
              </SelectItem>
            );
          })
        )}
      </SelectContent>
    </Select>
  );
};
