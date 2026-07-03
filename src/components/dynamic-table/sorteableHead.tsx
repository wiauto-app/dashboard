import {
  ORDER_BY_KEY,
  ORDER_DIRECTION_KEY,
} from "@/constants/search-keys.constants";
import { useFiltersManager } from "@/hooks/useFiltersManager";
import { flexRender, type Header } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

export const SorteableHead = ({
  header,
  path,
}: {
  header: Header<any, unknown>;
  path: string;
}) => {
  const { handleChange, values } = useFiltersManager({ path });
  const handleSort = (column: string) => {
    const currentDirection = values[ORDER_DIRECTION_KEY];
    if (currentDirection === "ASC") {
      handleChange(ORDER_DIRECTION_KEY, "DESC");
    } else {
      handleChange(ORDER_DIRECTION_KEY, "ASC");
    }
    handleChange(ORDER_BY_KEY, column);
  };

  const is_active_column = values[ORDER_BY_KEY] === header.column.id;
  const sort_direction = values[ORDER_DIRECTION_KEY];

  return (
    <button
      type="button"
      onClick={() => handleSort(header.column.id)}
      className="flex items-center gap-1 cursor-pointer"
      aria-label={
        is_active_column
          ? `Ordenar por ${header.column.id}, actualmente ${sort_direction === "DESC" ? "descendente" : "ascendente"}`
          : `Ordenar por ${header.column.id}`
      }
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      {is_active_column && sort_direction === "DESC" ? (
        <ArrowUp className="size-4" aria-hidden />
      ) : null}
      {is_active_column && sort_direction === "ASC" ? (
        <ArrowDown className="size-4" aria-hidden />
      ) : null}
    </button>
  );
};
