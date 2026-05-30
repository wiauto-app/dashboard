import { type HeaderGroup, type Table } from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";
import {
  get_virtualizable_headers,
  VirtualizedActionsHead,
  VirtualizedHeadCell,
  VirtualizedSelectCell,
  virtual_table_head_class,
  virtual_table_row_class,
} from "./virtualizedTableParts";
import { SELECT_COLUMN_ID } from "./constants";

type VirtualizedTableHeadProps<TData> = {
  table: Table<TData>;
  path: string;
  column_virtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  virtual_padding_left?: number;
  virtual_padding_right?: number;
  has_select_column: boolean;
  show_actions_column: boolean;
};

export const VirtualizedTableHead = <TData,>({
  table,
  path,
  column_virtualizer,
  virtual_padding_left,
  virtual_padding_right,
  has_select_column,
  show_actions_column,
}: VirtualizedTableHeadProps<TData>) => {
  const virtual_columns = column_virtualizer.getVirtualItems();

  return (
    <thead className="sticky top-0 z-30 grid border-y bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {table.getHeaderGroups().map((header_group) => (
        <VirtualizedTableHeadRow
          key={header_group.id}
          header_group={header_group}
          path={path}
          virtual_columns={virtual_columns}
          virtual_padding_left={virtual_padding_left}
          virtual_padding_right={virtual_padding_right}
          has_select_column={has_select_column}
          show_actions_column={show_actions_column}
        />
      ))}
    </thead>
  );
};

type VirtualizedTableHeadRowProps<TData> = {
  header_group: HeaderGroup<TData>;
  path: string;
  virtual_columns: ReturnType<
    Virtualizer<HTMLDivElement, HTMLTableCellElement>["getVirtualItems"]
  >;
  virtual_padding_left?: number;
  virtual_padding_right?: number;
  has_select_column: boolean;
  show_actions_column: boolean;
};

const VirtualizedTableHeadRow = <TData,>({
  header_group,
  path,
  virtual_columns,
  virtual_padding_left,
  virtual_padding_right,
  has_select_column,
  show_actions_column,
}: VirtualizedTableHeadRowProps<TData>) => {
  const virtualizable_headers = get_virtualizable_headers(header_group.headers);
  const select_header = header_group.headers.find(
    (header) => header.column.id === SELECT_COLUMN_ID,
  );

  return (
    <tr className={cn(virtual_table_row_class, "flex w-full min-w-max")}>
      {has_select_column && select_header ? (
        <VirtualizedSelectCell header_or_cell={select_header} as="th" />
      ) : null}

      {virtual_padding_left ? (
        <th
          aria-hidden
          className={cn(virtual_table_head_class, "flex shrink-0 p-0")}
          style={{ width: virtual_padding_left }}
        />
      ) : null}

      {virtual_columns.map((virtual_column) => {
        const header = virtualizable_headers[virtual_column.index];
        if (!header) return null;

        return (
          <VirtualizedHeadCell key={header.id} header={header} path={path} />
        );
      })}

      {virtual_padding_right ? (
        <th
          aria-hidden
          className={cn(virtual_table_head_class, "flex shrink-0 p-0")}
          style={{ width: virtual_padding_right }}
        />
      ) : null}

      {show_actions_column ? <VirtualizedActionsHead /> : null}
    </tr>
  );
};
