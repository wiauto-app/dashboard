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
  /** Cambia `limit` y reinicia `page` a 1 en una sola navegación. */
  handleLimitChange: (limit: string) => void;
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
    //@ts-expect-error TODO: fix this
    navigate({ search: (prev) => ({ ...prev, [key]: value }) });
  };

  const handleRemove = (key: string) => {
    //@ts-expect-error TODO: fix this
    navigate({ search: (prev) => ({ ...prev, [key]: undefined }) });
  };

  const handleLimitChange = (limit: string) => {
    navigate({
      //@ts-expect-error TODO: fix this
      search: (prev) => ({
        ...prev,
        limit,
        page: 1,
      }),
    });
  };

  const handleSort = (column: string, direction: "ASC" | "DESC") => {
    navigate({
      //@ts-expect-error TODO: fix this
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
      //@ts-expect-error TODO: fix this
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
    handleLimitChange,
    handleSort,
    handleDateRangeChange,
  };
};
