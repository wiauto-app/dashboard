import {
  DEFAULT_MIN_COLUMNS_FOR_VIRTUALIZATION,
  DEFAULT_TABLE_HEIGHT,
} from "./constants";

export type DynamicTableVirtualization =
  | boolean
  | {
      enabled?: boolean;
      min_columns?: number;
      height?: number;
    };

export const resolve_virtualization = (
  virtualization: DynamicTableVirtualization | undefined,
  column_count: number,
): { enabled: boolean; height: number } => {
  const default_min_columns = DEFAULT_MIN_COLUMNS_FOR_VIRTUALIZATION;
  const default_height = DEFAULT_TABLE_HEIGHT;

  if (!virtualization) {
    return { enabled: false, height: default_height };
  }

  if (virtualization === true) {
    return {
      enabled: column_count >= default_min_columns,
      height: default_height,
    };
  }

  const min_columns = virtualization.min_columns ?? default_min_columns;
  const height = virtualization.height ?? default_height;

  if (virtualization.enabled === false) {
    return { enabled: false, height };
  }

  if (virtualization.enabled === true) {
    return { enabled: true, height };
  }

  return {
    enabled: column_count >= min_columns,
    height,
  };
};
