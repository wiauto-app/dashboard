import { create } from "zustand";

interface SelectedIdStore {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export const useSelectedIdStore = create<SelectedIdStore>((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}));