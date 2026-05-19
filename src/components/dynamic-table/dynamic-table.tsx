import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DynamicTableLayout } from "./dynamic-table-layout";
import type { DynamicTableAction, DynamicTableColumn } from "./types";
import type { AnyRoute } from "@tanstack/react-router";
import { SorteableHead } from "./sorteableHead";
import { PencilIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useColumnVisibilityStore } from "@/stores/useColumnVisibilityStore";
import { ColumnVisibilityPopover } from "./columnVisibilityPopover";
import { build_table_columns } from "./buildTableColumns";
import { get_row_id_value } from "./utils";
import type { FormSize } from "@/types/form.types";

export type DynamicTableProps<TData extends object = object> = {
  columns: DynamicTableColumn[];
  actions?: (row: TData) => DynamicTableAction[];
  /** Clave estable para persistir visibilidad de columnas (localStorage). */
  table_id?: string;
  data: TData[];
  title: string;
  total: number;
  filters?: React.ReactNode;
  form?: React.ReactNode;
  on_row_selection_change?: (selected_rows: TData[]) => void;
  route: AnyRoute;
  form_size?: FormSize;
};

export function DynamicTable<TData extends object>({
  columns,
  table_id,
  data,
  title,
  total,
  filters,
  form,
  route,
  on_row_selection_change,
  actions,
  form_size = "md",
}: DynamicTableProps<TData>) {
  const [row_selection, set_row_selection] = useState<RowSelectionState>({});
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const visibility_overrides = useColumnVisibilityStore((s) =>
    table_id ? s.visibility_by_table[table_id] : undefined,
  );

  const visible_columns = useMemo(() => {
    if (!table_id) {
      return columns;
    }
    return columns.filter((col) => {
      if (col.type === "checkbox" && col.accessorKey === "select") {
        return true;
      }
      const stored = visibility_overrides?.[col.accessorKey];
      if (stored !== undefined) {
        return stored;
      }
      return true;
    });
  }, [columns, table_id, visibility_overrides]);

  const has_selection_column = useMemo(
    () =>
      columns.some((c) => c.type === "checkbox" && c.accessorKey === "select"),
    [columns],
  );

  const table_toolbar =
    table_id !== undefined && table_id.length > 0 ? (
      <ColumnVisibilityPopover table_id={table_id} columns={columns} />
    ) : null;

  const table_columns = useMemo(
    () => build_table_columns<TData>(visible_columns),
    [visible_columns],
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
      path={route.fullPath}
      title={title}
      total={total}
      filters={filters}
      form={form}
      table_toolbar={table_toolbar}
      form_size={form_size}
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
                colSpan={table_columns.length + 1}
                className="h-24 text-center text-muted-foreground"
              >
                No hay datos
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="data-[state=selected]:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-muted-foreground">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {form && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSelectedId(row.id);
                            setIsOpen(true);
                          }}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                      )}
                      {actions?.(row.original).map(
                        (action) => action.component,
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </DynamicTableLayout>
  );
}
