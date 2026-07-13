import { type StateCreator } from "zustand";
import { type AppState } from "@store/appStore";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";

export type ContentSliceState = {
  loaded: boolean;
  version: number | null;
  config: Config | null;
  texts: Texts | null;
  setContent(payload: { config: Config; texts: Texts; version: number }): void;
  setLoaded(loaded: boolean): void;
};

export const createContentSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  ContentSliceState
> = (set) => ({
  loaded: false,
  version: null,
  config: null,
  texts: null,
  setContent: ({ config, texts, version }) => {
    set((state) => {
      state.config = config;
      state.texts = texts;
      state.version = version;
      state.loaded = true;
    });
  },
  setLoaded: (loaded) => {
    set((state) => {
      state.loaded = loaded;
    });
  },
});
