import { BottomStackScreens } from "./components/BottomStack";
import { AppBottomTabBar } from "./components/AppBottomTabBar";
import { AppTopNavbar } from "./components/AppTopNavbar";
import { MainStack, RouteNames, BottomTabs } from "./types/nav_types";
import { theme } from "@constants";
import { StyleSheet, View } from "react-native";

/**
 * Root main stack.
 * Tab shell is a thin BottomTabs with one nested stack (BottomStackScreens)
 * so Android/iOS back pops stack history instead of fighting tab state.
 */
export const NavStackMain: React.FC = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen
        name={RouteNames.bottomTab}
        component={BottomTabShell}
      />
    </MainStack.Navigator>
  );
};

/**
 * Persistent chrome around the tab shell:
 * AppTopNavbar stays mounted (does not animate with BottomStack pushes).
 * BottomStackScreens owns screen history; AppBottomTabBar is the tabBar.
 */
const BottomTabShell: React.FC = () => {
  return (
    <View style={styles.shell}>
      <AppTopNavbar />
      <View style={styles.body}>
        <BottomTabs.Navigator
          tabBar={(props) => <AppBottomTabBar {...props} />}
          detachInactiveScreens={true}
          screenOptions={{ headerShown: false }}
        >
          <BottomTabs.Screen
            name={RouteNames.bottomStack}
            component={BottomStackScreens}
          />
        </BottomTabs.Navigator>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: theme.bg.default,
  },
  body: {
    flex: 1,
  },
});
