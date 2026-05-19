import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** `table_id` → `accessorKey` → visible */
export type VisibilityByTable = Record<string, Record<string, boolean>>;

type ColumnVisibilityStore = {
  visibility_by_table: VisibilityByTable;
  set_column_visible: (
    table_id: string,
    accessor_key: string,
    visible: boolean,
  ) => void;
  clear_table_visibility: (table_id: string) => void;
};

export const useColumnVisibilityStore = create<ColumnVisibilityStore>()(
  persist(
    (set) => ({
      visibility_by_table: {},
      set_column_visible: (table_id, accessor_key, visible) =>
        set((state) => ({
          visibility_by_table: {
            ...state.visibility_by_table,
            [table_id]: {
              ...state.visibility_by_table[table_id],
              [accessor_key]: visible,
            },
          },
        })),
      clear_table_visibility: (table_id) =>
        set((state) => {
          const next = { ...state.visibility_by_table };
          delete next[table_id];
          return { visibility_by_table: next };
        }),
    }),
    {
      name: "wiauto-column-visibility",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
