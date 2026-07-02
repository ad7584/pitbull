import { create } from "zustand";

interface UIState {
  signInOpen: boolean;
  /** pen owner key we're filling (deposit/donation), or null. */
  fillTarget: string | null;
  /** pen owner key whose share sheet is open, or null. */
  shareTarget: string | null;
  /** pen owner key being smashed (break flow), or null. */
  smashTarget: string | null;
  soundOn: boolean;

  openSignIn: () => void;
  closeSignIn: () => void;
  openFill: (owner: string) => void;
  closeFill: () => void;
  openShare: (owner: string) => void;
  closeShare: () => void;
  openSmash: (owner: string) => void;
  closeSmash: () => void;
  toggleSound: () => void;
}

export const useUI = create<UIState>((set) => ({
  signInOpen: false,
  fillTarget: null,
  shareTarget: null,
  smashTarget: null,
  soundOn: false,

  openSignIn: () => set({ signInOpen: true }),
  closeSignIn: () => set({ signInOpen: false }),
  openFill: (owner) => set({ fillTarget: owner }),
  closeFill: () => set({ fillTarget: null }),
  openShare: (owner) => set({ shareTarget: owner }),
  closeShare: () => set({ shareTarget: null }),
  openSmash: (owner) => set({ smashTarget: owner }),
  closeSmash: () => set({ smashTarget: null }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
}));
