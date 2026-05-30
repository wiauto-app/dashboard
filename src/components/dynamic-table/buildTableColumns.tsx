import { createColumnHelper } from "@tanstack/react-table";
import type { DynamicTableColumn } from "./types";
import { Checkbox } from "../ui/checkbox";
import { format_cell_display, get_value_at_path } from "./utils";
import { cn } from "@/lib/utils";
import { Image } from "../ui/image";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { ExternalLink } from "lucide-react";
import { resolve_column_sizing } from "./virtualized/columnSizing";
import { SELECT_COLUMN_WIDTH } from "./virtualized/constants";

export const build_table_columns = <TData extends object>(
  columns: DynamicTableColumn[],
) => {
  const column_helper = createColumnHelper<TData>();

  return columns.map((col) => {
    if (col.type === "checkbox" && col.accessorKey === "select") {
      return column_helper.display({
        id: "select",
        size: SELECT_COLUMN_WIDTH,
        minSize: SELECT_COLUMN_WIDTH,
        maxSize: SELECT_COLUMN_WIDTH,
        header: ({ table }) => (
          <Checkbox
            aria-label="Seleccionar todas las filas"
            checked={table.getIsAllRowsSelected()}
            indeterminate={
              table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
            onCheckedChange={(checked) =>
              table.toggleAllRowsSelected(Boolean(checked))
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Seleccionar fila ${row.index + 1}`}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    const sizing = resolve_column_sizing(col);

    return column_helper.accessor(
      (row) => get_value_at_path(row, col.accessorKey),
      {
        id: col.accessorKey,
        header: col.header,
        enableSorting: col.sortable,
        size: sizing.size,
        minSize: sizing.minSize,
        maxSize: sizing.maxSize,
        cell: ({ getValue }) => {
          const value = getValue();
          if (col.type === "badge") {
            return (
              <span
                className={cn(
                  "inline-flex max-w-48 truncate rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground capitalize",
                )}
              >
                {format_cell_display(value).replace("_", " ")}
              </span>
            );
          }
          if (col.type === "link") {
            return (
              <a
                target="_blank"
                href={value as string}
                className="text-primary underline-offset-4 hover:underline flex items-center gap-1 text-sm"
              >
                Link <ExternalLink className="size-4" />
              </a>
            );
          }
          if (col.type === "boolean") {
            return value ? "Sí" : "No";
          }
          if (col.type === "number") {
            const n =
              typeof value === "number" ? value : Number(value as unknown);
            if (!Number.isFinite(n)) return "—";
            return (
              <span className="tabular-nums">{Math.trunc(n)}</span>
            );
          }
          if (col.type === "date") {
            return value ? format(value as Date, "dd/MM/yyyy") : "—";
          }
          if (value === null || value === undefined) {
            return "—";
          }
          if (col.type === "array") {
            const arrayValue = value as unknown;
            if (!Array.isArray(arrayValue)) {
              return <Badge>—</Badge>;
            }

            if (arrayValue.length === 0) {
              return <Badge>—</Badge>;
            }

            const isPrimitive = typeof arrayValue[0] !== "object";

            if (isPrimitive) {
              return col.showArrayItems ? (
                arrayValue.join(", ")
              ) : (
                <Badge>{arrayValue.length}</Badge>
              );
            }

            const path = col.arrayDisplayKey;

            if (col.showArrayItems && path) {
              return arrayValue
                .map((item) => get_value_at_path(item, path))
                .join(", ");
            }

            return <Badge>{arrayValue.length}</Badge>;
          }
          /* 👇 ESTE VA DESPUÉS */
          if (value && typeof value === "object" && !Array.isArray(value)) {
            return <Badge>{format_cell_display(value)}</Badge>;
          }
          if (typeof value === "object") {
            return format_cell_display(value);
          }
          if (col.type === "textarea") {
            const text =
              value === null || value === undefined ? "" : String(value);
            return (
              <span className="line-clamp-2 max-w-xs whitespace-pre-wrap">
                {text || "—"}
              </span>
            );
          }
          if (col.type === "image") {
            return value ? (
              <Image
                src={value as string}
                alt="Avatar"
                className="min-w-10 max-w-10 h-10 rounded-full"
              />
            ) : (
              "—"
            );
          }

          return String(value);
        },
      },
    );
  });
};
