import type { VirtualItem, Virtualizer } from "@tanstack/react-virtual";

interface VirtualColumnSlice {
  virtual_columns: VirtualItem[];
  virtual_padding_left?: number;
  virtual_padding_right?: number;
}

export const resolve_virtual_column_slice = (
  column_virtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>,
  item_count: number,
): VirtualColumnSlice => {
  const virtual_columns = column_virtualizer.getVirtualItems();

  if (virtual_columns.length > 0) {
    return {
      virtual_columns,
      virtual_padding_left: virtual_columns[0]?.start ?? 0,
      virtual_padding_right:
        column_virtualizer.getTotalSize() -
        (virtual_columns[virtual_columns.length - 1]?.end ?? 0),
    };
  }

  if (item_count === 0) {
    return { virtual_columns: [] };
  }

  // Antes de que el virtualizador mida el viewport, renderiza todas las columnas.
  const fallback_columns: VirtualItem[] = Array.from(
    { length: item_count },
    (_, index) => ({
      index,
      start: 0,
      end: 0,
      size: 0,
      key: index,
      lane: 0,
    }),
  );

  return {
    virtual_columns: fallback_columns,
    virtual_padding_left: undefined,
    virtual_padding_right: undefined,
  };
};
