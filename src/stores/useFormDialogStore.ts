import { create } from "zustand";

interface FormDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useFormDialogStore = create<FormDialogStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));  