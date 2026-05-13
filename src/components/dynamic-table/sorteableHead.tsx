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

  return (
    <button
      onClick={() => handleSort(header.column.id)}
      className="flex items-center gap-1 cursor-pointer"
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      {values[ORDER_DIRECTION_KEY] === "DESC" &&
      values[ORDER_BY_KEY] === header.column.id ? (
        <ArrowUp className="size-4" />

      ) : (
        <ArrowDown className="size-4" />
      )}
    </button>
  );
};
