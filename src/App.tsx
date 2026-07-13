import * as SplashScreen from "expo-splash-screen";
import { enableScreens } from "react-native-screens";
import { useLoadFonts } from "@features/app/hooks/useLoadFonts";
import { CustomSplashScreen } from "@features/app/components/CustomSplashScreen";
import { AppRoot } from "@features/app/AppRoot";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { contentController } from "@store/contentController";
import { logger } from "@shared/utils/logger";

enableScreens();

SplashScreen.hideAsync().catch((err) =>
  logger.error("Failed to HideAsync native splash screen: ", err),
);

const App = () => {
  const { fontsLoaded, fontError } = useLoadFonts();
  const [contentReady, setContentReady] = useState(false);
  const [splashMinElapsed, setSplashMinElapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await contentController.init();
      } finally {
        if (!cancelled) {
          setContentReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    const t = setTimeout(() => setSplashMinElapsed(true), 600);
    return () => clearTimeout(t);
  }, [fontsLoaded, fontError]);

  // Stay on custom splash until fonts, min time, AND content init finish
  // (local cache and/or CDN fetch + version sync).
  const ready = fontsLoaded && contentReady && splashMinElapsed;

  return (
    <SafeAreaProvider>
      {ready ? <AppRoot /> : <CustomSplashScreen />}
    </SafeAreaProvider>
  );
};

export default App;
