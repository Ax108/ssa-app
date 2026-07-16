import { useEffect } from "react";
import { useFonts } from "expo-font";
import { type FontLoadState } from "@appModules/types/appStartupTypes";
import { Freeman_400Regular } from "@expo-google-fonts/freeman";
import { logger } from "@shared/utils/logger";

/**
 * Custom hook for loading application fonts.
 * Ensures fonts are loaded before rendering the main application.
 *
 * @returns {FontLoadState} Font loading state.
 *
 * @remarks
 * - Uses `expo-font` to load custom fonts.
 * - Logs an error if font loading fails.
 * - Used in {@link AppEntryComponent} to determine when to hide the splash screen.
 *
 * @returns {FontLoadState} An object containing:
 * - `fontsLoaded` (`boolean`): `true` if fonts are loaded, `false` if still loading, `null` if an error occurs.
 * - `fontError` (`Error | null`): The error object if font loading fails, otherwise `null`.
 */
export const useLoadFonts = (): FontLoadState => {
  const [loaded, error] = useFonts({
    Freeman_400Regular,
  });

  useEffect(() => {
    if (loaded) {
      logger.debug("Fonts loaded successfully");
    }
    if (error) {
      logger.error("Font loading error: ", error);
    }
  }, [loaded, error]);

  return { fontsLoaded: loaded, fontError: error };
};
