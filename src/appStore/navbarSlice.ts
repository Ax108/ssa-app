import { type StateCreator } from "zustand";
import { type AppState } from "@store/appStore";
import {
  RouteTitles,
  type RouteTitleType,
} from "@features/navigation/types/nav_types";

export type NavbarSliceState = {
  title: RouteTitleType;
  setTitle(title: RouteTitleType): void;
  resetTitle(): void;
};

export const createNavbarSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  NavbarSliceState
> = (set) => ({
  title: RouteTitles.home,
  setTitle: (title: RouteTitleType) => {
    set((state) => {
      state.title = title;
    });
  },
  resetTitle: () => {
    set((state) => {
      state.title = null;
    });
  },
});
