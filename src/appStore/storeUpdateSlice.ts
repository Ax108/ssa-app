import { type StateCreator } from "zustand";
import { type AppState } from "@store/appStore";

export type StoreUpdateSliceState = {
  /** Snackbar visible above the nav stack (post-splash only in UI). */
  storeUpdateVisible: boolean;
  /**
   * User dismissed this session — do not show again until cold restart
   * while still on an older binary.
   */
  storeUpdateDismissedThisSession: boolean;
  setStoreUpdateVisible(visible: boolean): void;
  dismissStoreUpdate(): void;
  /** Test / session reset helper. */
  resetStoreUpdateSession(): void;
};

export const createStoreUpdateSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  StoreUpdateSliceState
> = (set) => ({
  storeUpdateVisible: false,
  storeUpdateDismissedThisSession: false,
  setStoreUpdateVisible: (visible) => {
    set((state) => {
      state.storeUpdateVisible = visible;
    });
  },
  dismissStoreUpdate: () => {
    set((state) => {
      state.storeUpdateVisible = false;
      state.storeUpdateDismissedThisSession = true;
    });
  },
  resetStoreUpdateSession: () => {
    set((state) => {
      state.storeUpdateVisible = false;
      state.storeUpdateDismissedThisSession = false;
    });
  },
});
