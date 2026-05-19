export const get_value_at_path = (row: unknown, path: string): unknown => {
  if (row === null || row === undefined || path === "") {
    return undefined;
  }
  const segments = path.split(".");
  let current: unknown = row;
  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
};

export const get_row_id_value = (original_row: object, index: number) => {
  const id = (original_row as Record<string, unknown>)["id"];
  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }
  return `row_${index}`;
};

/** Texto legible para celdas: objetos con `name` (p. ej. rol) o primitivos. */
export const format_cell_display = (value: unknown) => {
  if (value && typeof value === "object" && "name" in value) {
    return String((value as { name: string }).name);
  }
  if (value === null || value === undefined) {
    return "—";
  }
  return String(value);
};
