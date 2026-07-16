import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createNavbarSlice, type NavbarSliceState } from "./navbarSlice";
import { createContentSlice, type ContentSliceState } from "./contentSlice";
import {
  createStoreUpdateSlice,
  type StoreUpdateSliceState,
} from "./storeUpdateSlice";

export type AppState = NavbarSliceState &
  ContentSliceState &
  StoreUpdateSliceState;

export const appStore = create<AppState>()(
  immer((...store) => ({
    ...createNavbarSlice(...store),
    ...createContentSlice(...store),
    ...createStoreUpdateSlice(...store),
  })),
);
