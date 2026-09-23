import * as SplashScreen from "expo-splash-screen";
import { enableScreens } from "react-native-screens";
import { useLoadFonts } from "@modules/app/hooks/useLoadFonts";
import { CustomSplashScreen } from "@modules/app/components/CustomSplashScreen";
import { AppRoot } from "@modules/app/AppRoot";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { contentController } from "@store/contentController";
import { logger } from "@shared/utils/logger";

enableScreens();

SplashScreen.hideAsync().catch((err) =>
  logger.error("Failed to HideAsync native splash screen: ", err),
);

const SPLASH_MIN_MS = 3000;

const App = () => {
  const { fontsLoaded, fontError } = useLoadFonts();
  const [bootReady, setBootReady] = useState(false);
  const [splashMinElapsed, setSplashMinElapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // Content (incl. CDN storeApp) must load before JS OTA / store prompt.
        await contentController.init();
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

  // Splash gates fonts, min time, and content — never JS-bundle OTA.
  const ready = fontsLoaded && bootReady && splashMinElapsed;

  return (
    <SafeAreaProvider>
      {ready ? <AppRoot /> : <CustomSplashScreen />}
    </SafeAreaProvider>
  );
};

export default App;
