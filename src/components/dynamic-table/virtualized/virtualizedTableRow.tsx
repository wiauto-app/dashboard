import type { Row } from "@tanstack/react-table";
import type { VirtualItem, Virtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";
import type { DynamicTableAction } from "../types";
import { SELECT_COLUMN_ID } from "./constants";
import {
  get_virtualizable_cells,
  VirtualizedActionsCell,
  VirtualizedBodyCell,
  VirtualizedSelectCell,
  virtual_table_cell_class,
  virtual_table_row_class,
} from "./virtualizedTableParts";

type VirtualizedTableRowProps<TData> = {
  row: Row<TData>;
  row_virtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
  column_virtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  virtual_row: VirtualItem;
  virtual_padding_left?: number;
  virtual_padding_right?: number;
  has_select_column: boolean;
  show_actions_column: boolean;
  form?: React.ReactNode;
  actions?: (row: TData) => DynamicTableAction[];
  on_edit: (row_id: string) => void;
};

export const VirtualizedTableRow = <TData,>({
  row,
  row_virtualizer,
  column_virtualizer,
  virtual_row,
  virtual_padding_left,
  virtual_padding_right,
  has_select_column,
  show_actions_column,
  form,
  actions,
  on_edit,
}: VirtualizedTableRowProps<TData>) => {
  const visible_cells = row.getVisibleCells();
  const virtualizable_cells = get_virtualizable_cells(visible_cells);
  const virtual_columns = column_virtualizer.getVirtualItems();
  const select_cell = visible_cells.find(
    (cell) => cell.column.id === SELECT_COLUMN_ID,
  );

  return (
    <tr
      data-index={virtual_row.index}
      ref={(node) => row_virtualizer.measureElement(node)}
      data-state={row.getIsSelected() ? "selected" : undefined}
      className={cn(virtual_table_row_class, "absolute flex w-full min-w-max")}
      style={{
        transform: `translateY(${virtual_row.start}px)`,
      }}
    >
      {has_select_column && select_cell ? (
        <VirtualizedSelectCell header_or_cell={select_cell} as="td" />
      ) : null}

      {virtual_padding_left ? (
        <td
          aria-hidden
          className={cn(virtual_table_cell_class, "flex shrink-0 p-0")}
          style={{ width: virtual_padding_left }}
        />
      ) : null}

      {virtual_columns.map((virtual_column) => {
        const cell = virtualizable_cells[virtual_column.index];
        if (!cell) return null;

        return <VirtualizedBodyCell key={cell.id} cell={cell} />;
      })}

      {virtual_padding_right ? (
        <td
          aria-hidden
          className={cn(virtual_table_cell_class, "flex shrink-0 p-0")}
          style={{ width: virtual_padding_right }}
        />
      ) : null}

      {show_actions_column ? (
        <VirtualizedActionsCell
          row={row}
          form={form}
          actions={actions}
          on_edit={on_edit}
        />
      ) : null}
    </tr>
  );
};
