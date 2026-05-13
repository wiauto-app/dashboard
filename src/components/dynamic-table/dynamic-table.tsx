import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";

import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DynamicTableLayout } from "./dynamic-table-layout";
import type { DynamicTableColumn } from "./types";
import { cn } from "@/lib/utils";
import type { AnyRoute } from "@tanstack/react-router";
import { SorteableHead } from "./sorteableHead";
import { PencilIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useFormDialogStore } from "@/stores/useFormDialogStore";

const get_row_id_value = (original_row: object, index: number) => {
  const id = (original_row as Record<string, unknown>)["id"];
  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }
  return `row_${index}`;
};

const get_role_label = (value: unknown) => {
  if (value && typeof value === "object" && "name" in value) {
    return String((value as { name: string }).name);
  }
  if (value === null || value === undefined) {
    return "—";
  }
  return String(value);
};

const build_table_columns = <TData extends object>(
  columns: DynamicTableColumn[],
) => {
  const column_helper = createColumnHelper<TData>();

  return columns.map((col) => {
    if (col.type === "checkbox" && col.accessorKey === "select") {
      return column_helper.display({
        id: "select",
        size: 48,
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

    return column_helper.accessor(
      (row) => (row as Record<string, unknown>)[col.accessorKey],
      {
        id: col.accessorKey,
        header: col.header,
        cell: ({ getValue }) => {
          const value = getValue();
          if (col.type === "badge") {
            return (
              <span
                className={cn(
                  "inline-flex max-w-48 truncate rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground",
                )}
              >
                {get_role_label(value)}
              </span>
            );
          }
          if (value === null || value === undefined) {
            return "—";
          }
          if (typeof value === "object") {
            return get_role_label(value);
          }
          return String(value);
        },
      },
    );
  });
};

export type DynamicTableProps<TData extends object = object> = {
  columns: DynamicTableColumn[];
  data: TData[];
  title: string;
  total: number;
  filters: React.ReactNode;
  form: React.ReactNode;
  on_row_selection_change?: (selected_rows: TData[]) => void;
  route: AnyRoute;
};

export function DynamicTable<TData extends object>({
  columns,
  data,
  title,
  total,
  filters,
  form,
  route,
  on_row_selection_change,
}: DynamicTableProps<TData>) {
  const [row_selection, set_row_selection] = useState<RowSelectionState>({});
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const has_selection_column = useMemo(
    () =>
      columns.some((c) => c.type === "checkbox" && c.accessorKey === "select"),
    [columns],
  );

  const table_columns = useMemo(
    () => build_table_columns<TData>(columns),
    [columns],
  );

  const get_row_id = useMemo(
    () => (original_row: TData, index: number) =>
      get_row_id_value(original_row, index),
    [],
  );

  const table = useReactTable<TData>({
    data,
    columns: table_columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: get_row_id,
    enableRowSelection: has_selection_column,
    onRowSelectionChange: (updater) => {
      set_row_selection(updater);
    },
    state: has_selection_column
      ? {
          rowSelection: row_selection,
        }
      : {},
  });

  useEffect(() => {
    if (!has_selection_column || !on_row_selection_change) {
      return;
    }
    const selected_ids = new Set(
      Object.entries(row_selection)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    );
    const selected_rows = data.filter((row, index) =>
      selected_ids.has(get_row_id(row, index)),
    );
    on_row_selection_change(selected_rows);
  }, [
    data,
    get_row_id,
    has_selection_column,
    on_row_selection_change,
    row_selection,
  ]);

  return (
    <DynamicTableLayout
      title={title}
      total={total}
      filters={filters}
      form={form}
    >
      <Table>
        <TableHeader className="border-y bg-background/50">
          {table.getHeaderGroups().map((header_group) => (
            <TableRow key={header_group.id}>
              {header_group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-muted-foreground first:w-12 text-xs"
                >
                  {header.column.getCanSort() ? (
                    <SorteableHead header={header} path={route.fullPath} />
                  ) : (
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </div>
                  )}
                </TableHead>
              ))}
              <TableHead className="text-muted-foreground first:w-12 text-xs">
                Acciones
              </TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={table_columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No hay datos
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className="data-[state=selected]:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-muted-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectedId(row.id);
                      setIsOpen(true);
                    }}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DynamicTableLayout>
  );
}
