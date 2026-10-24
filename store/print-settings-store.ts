import { create } from "zustand";
import { PrintSettings, defaultPrintSettings } from "@/types/print-settings";

interface PrintSettingsStore {
  settings: PrintSettings;
  availableSectionTypes: string[];
  sectionOrder: string[] | null;
  update: <K extends keyof PrintSettings>(
    key: K,
    value: PrintSettings[K],
  ) => void;
  updateContent: (key: keyof PrintSettings["content"], value: boolean) => void;
  updateQuestionFormat: <K extends keyof PrintSettings["questionFormat"]>(
    key: K,
    value: PrintSettings["questionFormat"][K],
  ) => void;
  updateFont: <K extends keyof PrintSettings["font"]>(
    key: K,
    value: PrintSettings["font"][K],
  ) => void;
  updateBranding: <K extends keyof PrintSettings["branding"]>(
    key: K,
    value: PrintSettings["branding"][K],
  ) => void;
  updateHeaderImage: <K extends keyof PrintSettings["headerImage"]>(
    key: K,
    value: PrintSettings["headerImage"][K],
  ) => void;
  resetSettings: () => void;
  resetStore: () => void;
  setAvailableSectionTypes: (types: string[]) => void;
  setSectionOrder: (order: string[]) => void;
  updateSheet: <K extends keyof PrintSettings["sheet"]>(
    key: K,
    value: PrintSettings["sheet"][K],
  ) => void;
}

export const usePrintSettingsStore = create<PrintSettingsStore>((set) => ({
  settings: defaultPrintSettings,
  availableSectionTypes: [],
  sectionOrder: null,
  update: (key, value) =>
    set((s) => ({ settings: { ...s.settings, [key]: value } })),
  updateContent: (key, value) =>
    set((s) => ({
      settings: {
        ...s.settings,
        content: { ...s.settings.content, [key]: value },
      },
    })),
  updateQuestionFormat: (key, value) =>
    set((s) => ({
      settings: {
        ...s.settings,
        questionFormat: { ...s.settings.questionFormat, [key]: value },
      },
    })),
  updateFont: (key, value) =>
    set((s) => ({
      settings: { ...s.settings, font: { ...s.settings.font, [key]: value } },
    })),
  updateBranding: (key, value) =>
    set((s) => ({
      settings: {
        ...s.settings,
        branding: { ...s.settings.branding, [key]: value },
      },
    })),
  updateHeaderImage: (key, value) =>
    set((s) => ({
      settings: {
        ...s.settings,
        headerImage: { ...s.settings.headerImage, [key]: value },
      },
    })),
  resetSettings: () => set({ settings: defaultPrintSettings }),
  resetStore: () =>
    set({
      settings: defaultPrintSettings,
      availableSectionTypes: [],
      sectionOrder: null,
    }),
  setAvailableSectionTypes: (types) =>
    set((state) => {
      const sameSet =
        state.availableSectionTypes.length === types.length &&
        state.availableSectionTypes.every((t) => types.includes(t));
      return {
        availableSectionTypes: types,
        sectionOrder: sameSet ? state.sectionOrder : null,
      };
    }),
  setSectionOrder: (order) => set({ sectionOrder: order }),
  updateSheet: (key, value) =>
    set((s) => ({
      settings: {
        ...s.settings,
        sheet: { ...s.settings.sheet, [key]: value },
      },
    })),
}));
