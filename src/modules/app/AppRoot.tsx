import { useEffect, useState } from "react";
import { Appearance, StyleSheet, View } from "react-native";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getDeviceColorScheme } from "./helpers/app_Feature_helpers";
import { NavigationContainer } from "@react-navigation/native";
import { NavStackMain } from "@navigation/NavStackMain";
import { navigationRef } from "@navigation/navigationRef";
import { StoreUpdateSnackbar } from "@shared/components/StoreUpdateSnackbar";

/** expo-status-bar: `light` = light icons (dark bg), `dark` = dark icons (light bg). */
const schemeToBarStyle = (scheme: "light" | "dark"): StatusBarStyle =>
  scheme === "dark" ? "light" : "dark";

export const AppRoot = () => {
  const [statusBarStyle, setStatusBarStyle] = useState<StatusBarStyle>(() =>
    schemeToBarStyle(getDeviceColorScheme()),
  );

  useEffect(() => {
    const syncStatusBar = () => {
      setStatusBarStyle(schemeToBarStyle(getDeviceColorScheme()));
    };

    syncStatusBar();

    const subscription = Appearance.addChangeListener(() => {
      syncStatusBar();
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style={statusBarStyle} />
      <GestureHandlerRootView style={styles.flex}>
        <NavigationContainer ref={navigationRef}>
          <NavStackMain />
        </NavigationContainer>
        <StoreUpdateSnackbar />
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});
