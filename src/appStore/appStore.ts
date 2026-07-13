import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createNavbarSlice, type NavbarSliceState } from "./navbarSlice";
import { createContentSlice, type ContentSliceState } from "./contentSlice";

export type AppState = NavbarSliceState & ContentSliceState;

export const appStore = create<AppState>()(
  immer((...store) => ({
    ...createNavbarSlice(...store),
    ...createContentSlice(...store),
  })),
);
