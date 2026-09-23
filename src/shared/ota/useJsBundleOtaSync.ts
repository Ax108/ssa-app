import { useEffect } from "react";
import { AppState } from "react-native";
import { jsBundleOtaController } from "@shared/ota/updatesController";

/**
 * Background JS OTA: never participates in splash readiness.
 * Skipped in `__DEV__`. Activates a finished download on background→active only.
 */
export const useJsBundleOtaSync = (): void => {
  useEffect(() => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      return;
    }
    let previous = AppState.currentState;
    void jsBundleOtaController.onOpening(false);
    const subscription = AppState.addEventListener("change", (next) => {
      const opening = next === "active" && previous === "background";
      // Inactive can be a notification shade or permission dialog, not an opening.
      if (next !== "inactive") previous = next;
      if (opening) void jsBundleOtaController.onOpening(true);
    });
    return () => subscription.remove();
  }, []);
};
