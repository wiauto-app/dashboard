import type { DynamicTableColumn } from "../types";
import { DEFAULT_COLUMN_SIZE_BY_TYPE } from "./constants";

export const resolve_column_sizing = (col: DynamicTableColumn) => {
  const default_size = DEFAULT_COLUMN_SIZE_BY_TYPE[col.type] ?? 180;

  return {
    size: col.size ?? default_size,
    minSize: col.minSize ?? 80,
    maxSize: col.maxSize ?? 400,
  };
};
