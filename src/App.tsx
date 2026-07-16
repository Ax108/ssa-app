import * as SplashScreen from "expo-splash-screen";
import { enableScreens } from "react-native-screens";
import { useLoadFonts } from "@modules/app/hooks/useLoadFonts";
import { CustomSplashScreen } from "@modules/app/components/CustomSplashScreen";
import { AppRoot } from "@modules/app/AppRoot";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { contentController } from "@store/contentController";
import { syncOtaUpdate } from "@shared/ota/updatesController";
import { logger } from "@shared/utils/logger";

enableScreens();

SplashScreen.hideAsync().catch((err) =>
  logger.error("Failed to HideAsync native splash screen: ", err),
);

const SPLASH_MIN_MS = 500;

const App = () => {
  const { fontsLoaded, fontError } = useLoadFonts();
  const [bootReady, setBootReady] = useState(false);
  const [splashMinElapsed, setSplashMinElapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await contentController.init();
        // Keep custom splash up while OTA check/fetch runs (apply on next cold start).
        await syncOtaUpdate();
      } finally {
        if (!cancelled) {
          setBootReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    const t = setTimeout(() => setSplashMinElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, [fontsLoaded, fontError]);

  // Stay on custom splash until fonts, min time, content init, AND OTA sync finish.
  const ready = fontsLoaded && bootReady && splashMinElapsed;

  return (
    <SafeAreaProvider>
      {ready ? <AppRoot /> : <CustomSplashScreen />}
    </SafeAreaProvider>
  );
};

export default App;
