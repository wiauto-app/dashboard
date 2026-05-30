import { useRef } from "react";
import type { Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { AnyRoute } from "@tanstack/react-router";
import type { DynamicTableAction } from "../types";
import {
  COLUMN_OVERSCAN,
  SELECT_COLUMN_ID,
} from "./constants";
import { get_virtualizable_headers } from "./virtualizedTableParts";
import { VirtualizedTableBody } from "./virtualizedTableBody";
import { VirtualizedTableHead } from "./virtualizedTableHead";

type VirtualizedTableContainerProps<TData extends object> = {
  table: Table<TData>;
  route: AnyRoute;
  height: number;
  form?: React.ReactNode;
  actions?: (row: TData) => DynamicTableAction[];
  on_edit: (row_id: string) => void;
};

export const VirtualizedTableContainer = <TData extends object>({
  table,
  route,
  height,
  form,
  actions,
  on_edit,
}: VirtualizedTableContainerProps<TData>) => {
  const table_container_ref = useRef<HTMLDivElement>(null);

  const header_group = table.getHeaderGroups()[0];
  const virtualizable_headers = header_group
    ? get_virtualizable_headers(header_group.headers)
    : [];

  const has_select_column = table
    .getAllLeafColumns()
    .some((column) => column.id === SELECT_COLUMN_ID);

  const show_actions_column = Boolean(form || actions);

  const column_virtualizer = useVirtualizer<
    HTMLDivElement,
    HTMLTableCellElement
  >({
    count: virtualizable_headers.length,
    estimateSize: (index) => virtualizable_headers[index]?.getSize() ?? 180,
    getScrollElement: () => table_container_ref.current,
    horizontal: true,
    overscan: COLUMN_OVERSCAN,
  });

  const virtual_columns = column_virtualizer.getVirtualItems();

  let virtual_padding_left: number | undefined;
  let virtual_padding_right: number | undefined;

  if (virtual_columns.length > 0) {
    virtual_padding_left = virtual_columns[0]?.start ?? 0;
    virtual_padding_right =
      column_virtualizer.getTotalSize() -
      (virtual_columns[virtual_columns.length - 1]?.end ?? 0);
  }

  const column_count_with_actions =
    table.getVisibleLeafColumns().length + (show_actions_column ? 1 : 0);

  return (
    <div
      ref={table_container_ref}
      className="relative w-full overflow-auto rounded-md border text-sm"
      style={{ height }}
    >
      <table className="grid w-full min-w-max caption-bottom">
        <VirtualizedTableHead
          table={table}
          path={route.fullPath}
          column_virtualizer={column_virtualizer}
          virtual_padding_left={virtual_padding_left}
          virtual_padding_right={virtual_padding_right}
          has_select_column={has_select_column}
          show_actions_column={show_actions_column}
        />
        <VirtualizedTableBody
          table={table}
          table_container_ref={table_container_ref}
          column_virtualizer={column_virtualizer}
          virtual_padding_left={virtual_padding_left}
          virtual_padding_right={virtual_padding_right}
          has_select_column={has_select_column}
          show_actions_column={show_actions_column}
          form={form}
          actions={actions}
          on_edit={on_edit}
          column_count_with_actions={column_count_with_actions}
        />
      </table>
    </div>
  );
};
