import { type StateCreator } from "zustand";
import { type AppState } from "@store/appStore";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";
import { DEFAULT_LOCALE, type Locale } from "@constants/cdn";

export type ContentSliceState = {
  loaded: boolean;
  version: number | string | null;
  locale: Locale;
  config: Config | null;
  texts: Texts | null;
  setContent(payload: {
    config: Config;
    texts: Texts;
    version: number | string;
    locale?: Locale;
  }): void;
  setLocaleState(locale: Locale): void;
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
  locale: DEFAULT_LOCALE,
  config: null,
  texts: null,
  setContent: ({ config, texts, version, locale }) => {
    set((state) => {
      state.config = config;
      state.texts = texts;
      state.version = version;
      if (locale) state.locale = locale;
      state.loaded = true;
    });
  },
  setLocaleState: (locale) => {
    set((state) => {
      state.locale = locale;
    });
  },
  setLoaded: (loaded) => {
    set((state) => {
      state.loaded = loaded;
    });
  },
});
