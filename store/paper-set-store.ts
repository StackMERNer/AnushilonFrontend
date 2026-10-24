import { create } from "zustand";

interface PaperSetStore {
  setCount: number; // 0 = off, else 2–6
  activeSetIndex: number; // 0 = ক, 1 = খ, ...
  setSetCount: (count: number) => void;
  setActiveSet: (index: number) => void;
}

export const usePaperSetStore = create<PaperSetStore>((set) => ({
  setCount: 0,
  activeSetIndex: 0,
  setSetCount: (count) => set({ setCount: count, activeSetIndex: 0 }),
  setActiveSet: (index) => set({ activeSetIndex: index }),
}));
