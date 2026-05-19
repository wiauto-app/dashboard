import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DynamicTableColumn } from "./types";
import { useColumnVisibilityStore } from "@/stores/useColumnVisibilityStore";
import { Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";

const is_selection_column = (col: DynamicTableColumn) =>
  col.type === "checkbox" && col.accessorKey === "select";

export const ColumnVisibilityPopover = ({
  table_id,
  columns,
}: {
  table_id: string;
  columns: DynamicTableColumn[];
}) => {
  const [open, setOpen] = useState(false);
  const overrides = useColumnVisibilityStore(
    (s) => s.visibility_by_table[table_id],
  );
  const set_column_visible = useColumnVisibilityStore(
    (s) => s.set_column_visible,
  );
  const clear_table_visibility = useColumnVisibilityStore(
    (s) => s.clear_table_visibility,
  );

  const togglable_columns = useMemo(
    () => columns.filter((c) => !is_selection_column(c)),
    [columns],
  );

  const resolve_visible = (col: DynamicTableColumn) => {
    const stored = overrides?.[col.accessorKey];
    if (stored !== undefined) {
      return stored;
    }
    return true;
  };

  const visible_togglable = useMemo(
    () =>
      togglable_columns.filter((col) => {
        const stored = overrides?.[col.accessorKey];
        if (stored !== undefined) {
          return stored;
        }
        return true;
      }),
    [togglable_columns, overrides],
  );

  const handle_checked_change = (
    col: DynamicTableColumn,
    checked: boolean | "indeterminate",
  ) => {
    if (checked === "indeterminate") {
      return;
    }
    const is_only_visible =
      visible_togglable.length === 1 && resolve_visible(col);
    if (!checked && is_only_visible) {
      return;
    }
    set_column_visible(table_id, col.accessorKey, checked);
  };

  const handle_reset = () => {
    clear_table_visibility(table_id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button variant="outline" type="button" aria-label="Columnas visibles">
          <Columns3 className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Columnas</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <PopoverHeader>
          <PopoverTitle>Columnas visibles</PopoverTitle>
        </PopoverHeader>
        <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
          {togglable_columns.map((col) => {
            const checked = resolve_visible(col);
            const is_last_visible =
              visible_togglable.length === 1 && checked;
            return (
              <li key={col.accessorKey} className="flex items-center gap-2">
                <Checkbox
                  id={`column-${table_id}-${col.accessorKey}`}
                  checked={checked}
                  disabled={is_last_visible}
                  aria-label={`Mostrar columna ${col.header}`}
                  onCheckedChange={(value) =>
                    handle_checked_change(col, value)
                  }
                />
                <label
                  htmlFor={`column-${table_id}-${col.accessorKey}`}
                  className={cn(
                    "text-sm leading-none",
                    is_last_visible
                      ? "cursor-default text-muted-foreground"
                      : "cursor-pointer",
                  )}
                >
                  {col.header}
                </label>
              </li>
            );
          })}
        </ul>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={handle_reset}
        >
          Restaurar predeterminadas
        </Button>
      </PopoverContent>
    </Popover>
  );
};
