import { flexRender, type Cell, type Header, type Row } from "@tanstack/react-table";
import { PencilIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { DynamicTableAction } from "../types";
import { SorteableHead } from "../sorteableHead";
import {
  ACTIONS_COLUMN_WIDTH,
  SELECT_COLUMN_ID,
  SELECT_COLUMN_WIDTH,
} from "./constants";

export const virtual_table_head_class =
  "h-10 px-2 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0";

export const virtual_table_cell_class =
  "p-2 align-middle whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0";

export const virtual_table_row_class =
  "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted/50";

export const is_select_column = (column_id: string) => column_id === SELECT_COLUMN_ID;

export const get_virtualizable_headers = <TData,>(
  headers: Header<TData, unknown>[],
) => headers.filter((header) => !is_select_column(header.column.id));

export const get_virtualizable_cells = <TData,>(cells: Cell<TData, unknown>[]) =>
  cells.filter((cell) => !is_select_column(cell.column.id));

type VirtualizedHeadCellProps<TData> = {
  header: Header<TData, unknown>;
  path: string;
};

export const VirtualizedHeadCell = <TData,>({
  header,
  path,
}: VirtualizedHeadCellProps<TData>) => (
  <th
    className={cn(virtual_table_head_class, "flex shrink-0 items-center")}
    style={{ width: header.getSize() }}
  >
    {header.column.getCanSort() ? (
      <SorteableHead header={header} path={path} />
    ) : (
      <div className="flex items-center gap-1">
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    )}
  </th>
);

type VirtualizedBodyCellProps<TData> = {
  cell: Cell<TData, unknown>;
};

export const VirtualizedBodyCell = <TData,>({
  cell,
}: VirtualizedBodyCellProps<TData>) => (
  <td
    className={cn(virtual_table_cell_class, "flex shrink-0 items-center")}
    style={{ width: cell.column.getSize() }}
  >
    {flexRender(cell.column.columnDef.cell, cell.getContext())}
  </td>
);

export const VirtualizedActionsHead = () => (
  <th
    className={cn(
      virtual_table_head_class,
      "sticky right-0 z-20 flex shrink-0 items-center border-l bg-background",
    )}
    style={{ width: ACTIONS_COLUMN_WIDTH, minWidth: ACTIONS_COLUMN_WIDTH }}
  >
    Acciones
  </th>
);

type VirtualizedActionsCellProps<TData> = {
  row: Row<TData>;
  form?: React.ReactNode;
  actions?: (row: TData) => DynamicTableAction[];
  on_edit: (row_id: string) => void;
};

export const VirtualizedActionsCell = <TData,>({
  row,
  form,
  actions,
  on_edit,
}: VirtualizedActionsCellProps<TData>) => (
  <td
    className={cn(
      virtual_table_cell_class,
      "sticky right-0 z-20 flex shrink-0 items-center border-l bg-background",
    )}
    style={{ width: ACTIONS_COLUMN_WIDTH, minWidth: ACTIONS_COLUMN_WIDTH }}
  >
    <div className="flex items-center gap-2">
      {form ? (
        <Button
          variant="outline"
          size="icon-sm"
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => on_edit(row.id)}
          aria-label="Editar fila"
        >
          <PencilIcon className="size-4" />
        </Button>
      ) : null}
      {actions?.(row.original).map((action) => (
        <span key={action.key}>{action.component}</span>
      ))}
    </div>
  </td>
);

type VirtualizedSelectCellProps<TData> = {
  header_or_cell: Header<TData, unknown> | Cell<TData, unknown>;
  as: "th" | "td";
};

export const VirtualizedSelectCell = <TData,>({
  header_or_cell,
  as,
}: VirtualizedSelectCellProps<TData>) => {
  const Tag = as;

  return (
    <Tag
      className={cn(
        as === "th" ? virtual_table_head_class : virtual_table_cell_class,
        "sticky left-0 z-20 flex shrink-0 items-center bg-background",
      )}
      style={{ width: SELECT_COLUMN_WIDTH, minWidth: SELECT_COLUMN_WIDTH }}
    >
      {as === "th"
        ? flexRender(
            (header_or_cell as Header<TData, unknown>).column.columnDef.header,
            (header_or_cell as Header<TData, unknown>).getContext(),
          )
        : flexRender(
            (header_or_cell as Cell<TData, unknown>).column.columnDef.cell,
            (header_or_cell as Cell<TData, unknown>).getContext(),
          )}
    </Tag>
  );
};
