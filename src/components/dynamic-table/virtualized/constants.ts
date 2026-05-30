export const DEFAULT_TABLE_HEIGHT = 560;
export const DEFAULT_MIN_COLUMNS_FOR_VIRTUALIZATION = 8;
export const COLUMN_OVERSCAN = 3;
export const ROW_OVERSCAN = 8;
export const ACTIONS_COLUMN_WIDTH = 120;
export const SELECT_COLUMN_WIDTH = 48;
export const DEFAULT_ROW_HEIGHT = 48;

export const DEFAULT_COLUMN_SIZE_BY_TYPE: Record<
  import("../types").DynamicTableColumnType,
  number
> = {
  checkbox: 48,
  image: 80,
  number: 96,
  date: 120,
  badge: 140,
  link: 160,
  boolean: 100,
  array: 120,
  textarea: 240,
  text: 180,
};

export const SELECT_COLUMN_ID = "select";
