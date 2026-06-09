import { create } from "zustand";

import { SignInDialog } from "@/components/auth/signInDialog";

interface SignInDialogStore {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openSignIn: () => void;
  closeSignIn: () => void;
}

export const useSignInDialogStore = create<SignInDialogStore>((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
  openSignIn: () => set({ isOpen: true }),
  closeSignIn: () => set({ isOpen: false }),
}));

export const GlobalSignInDialog = () => {
  const isOpen = useSignInDialogStore((state) => state.isOpen);
  const setIsOpen = useSignInDialogStore((state) => state.setIsOpen);

  return <SignInDialog open={isOpen} onOpenChange={setIsOpen} />;
};
