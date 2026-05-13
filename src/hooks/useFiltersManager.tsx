import {
  ORDER_BY_KEY,
  ORDER_DIRECTION_KEY,
} from "@/constants/search-keys.constants";
import {
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { format } from "date-fns";

export type FiltersDateRangeValue = {
  from: Date | undefined;
  to: Date | undefined;
};

interface UseFiltersManagerProps {
  path: string;
}

interface UseFiltersManagerReturn {
  values: Record<string, string | undefined>;
  handleChange: (key: string, value?: string) => void;
  handleRemove: (key: string) => void;
  /** Aplica `order_by` y `order_direction` en un solo `setSearchParams` (evita perder un valor por cierre obsoleto). */
  handleSort: (column: string, direction: "ASC" | "DESC") => void;
  /**
   * Actualiza dos query params de fechas en un solo `setSearchParams` (`yyyy-MM-dd` en zona local).
   * Si `from` o `to` vienen vacíos, borra la clave correspondiente.
   */
  handleDateRangeChange: (
    fromKey: string,
    toKey: string,
    range: FiltersDateRangeValue,
  ) => void;
}

export const useFiltersManager = ({
  path,
}: UseFiltersManagerProps): UseFiltersManagerReturn => {
  const search = useSearch({
    strict: false,
  });

  const navigate = useNavigate({ from: path  });

  const handleChange = (key: string, value?: string) => {
    navigate({ search: (prev) => ({ ...prev, [key]: value }) });
  };

  const handleRemove = (key: string) => {
    navigate({ search: (prev) => ({ ...prev, [key]: undefined }) });
  };

  const handleSort = (column: string, direction: "ASC" | "DESC") => {
    navigate({
      search: (prev) => ({
        ...prev,
        [ORDER_BY_KEY]: column,
        [ORDER_DIRECTION_KEY]: direction,
      }),
    });
  };

  const handleDateRangeChange = (
    fromKey: string,
    toKey: string,
    range: FiltersDateRangeValue,
  ) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [fromKey]: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
        [toKey]: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
      }),
    });
  };

  return {
    values: search,
    handleChange,
    handleRemove,
    handleSort,
    handleDateRangeChange,
  };
};
