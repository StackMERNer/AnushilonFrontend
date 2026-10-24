// store/editing-toolbar-store.ts
import { create } from "zustand";

interface ToolbarState {
  visible: boolean;
  rect: DOMRect | null;
  show: (rect: DOMRect) => void;
  hide: () => void;
}

export const useEditingToolbarStore = create<ToolbarState>((set) => ({
  visible: false,
  rect: null,
  show: (rect) => set({ visible: true, rect }),
  hide: () => set({ visible: false, rect: null }),
}));
