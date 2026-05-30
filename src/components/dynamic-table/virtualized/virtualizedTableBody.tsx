import type { Row, Table } from "@tanstack/react-table";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";
import type { DynamicTableAction } from "../types";
import { DEFAULT_ROW_HEIGHT, ROW_OVERSCAN } from "./constants";
import { virtual_table_cell_class, virtual_table_row_class } from "./virtualizedTableParts";
import { VirtualizedTableRow } from "./virtualizedTableRow";

const is_firefox =
  typeof window !== "undefined" &&
  navigator.userAgent.indexOf("Firefox") !== -1;

type VirtualizedTableBodyProps<TData> = {
  table: Table<TData>;
  table_container_ref: React.RefObject<HTMLDivElement | null>;
  column_virtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  virtual_padding_left?: number;
  virtual_padding_right?: number;
  has_select_column: boolean;
  show_actions_column: boolean;
  form?: React.ReactNode;
  actions?: (row: TData) => DynamicTableAction[];
  on_edit: (row_id: string) => void;
  column_count_with_actions: number;
};

export const VirtualizedTableBody = <TData,>({
  table,
  table_container_ref,
  column_virtualizer,
  virtual_padding_left,
  virtual_padding_right,
  has_select_column,
  show_actions_column,
  form,
  actions,
  on_edit,
  column_count_with_actions,
}: VirtualizedTableBodyProps<TData>) => {
  const rows = table.getRowModel().rows;

  const row_virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => DEFAULT_ROW_HEIGHT,
    getScrollElement: () => table_container_ref.current,
    overscan: ROW_OVERSCAN,
    measureElement: is_firefox
      ? undefined
      : (element) => element?.getBoundingClientRect().height,
  });

  const virtual_rows = row_virtualizer.getVirtualItems();

  if (rows.length === 0) {
    return (
      <tbody className="grid">
        <tr className={cn(virtual_table_row_class, "flex w-full")}>
          <td
            colSpan={column_count_with_actions}
            className={cn(
              virtual_table_cell_class,
              "flex h-24 w-full items-center justify-center",
            )}
          >
            No hay datos
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody
      className="relative grid"
      style={{ height: `${row_virtualizer.getTotalSize()}px` }}
    >
      {virtual_rows.map((virtual_row) => {
        const row = rows[virtual_row.index] as Row<TData>;

        return (
          <VirtualizedTableRow
            key={row.id}
            row={row}
            row_virtualizer={row_virtualizer}
            column_virtualizer={column_virtualizer}
            virtual_row={virtual_row}
            virtual_padding_left={virtual_padding_left}
            virtual_padding_right={virtual_padding_right}
            has_select_column={has_select_column}
            show_actions_column={show_actions_column}
            form={form}
            actions={actions}
            on_edit={on_edit}
          />
        );
      })}
    </tbody>
  );
};
