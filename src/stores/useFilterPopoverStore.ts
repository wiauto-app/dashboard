import { create } from "zustand";

interface FilterPopoverStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useFilterPopoverStore = create<FilterPopoverStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));  