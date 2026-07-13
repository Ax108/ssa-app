import { CustomText } from "@shared/components/CustomText";
import { theme } from "@constants";
import { appStore } from "@store/appStore";
import { useShallow } from "zustand/react/shallow";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  RouteNames,
  RouteTitles,
  TAB_ROUTES,
  type TabRouteName,
} from "../types/nav_types";
import {
  popToTopBottomStack,
  readStackInfoFromTabState,
} from "../helpers/bottomStackNav";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

/** Match web nav icons from `sadhan-sangha` store.tsx (MUI Material Icons). */
const TAB_ICONS: Record<TabRouteName, keyof typeof MaterialIcons.glyphMap> = {
  home: "home",
  ashram: "temple-hindu",
  satsang: "self-improvement",
  gallery: "collections",
  contact: "alternate-email",
};

/**
 * Custom tab bar — must use `BottomTabBarProps.navigation` (tab navigator),
 * not `useNavigation()` from a parent stack (that caused NAVIGATE bottomStack errors).
 */
export const AppBottomTabBar: React.FC<BottomTabBarProps> = ({
  navigation,
  state,
}) => {
  const insets = useSafeAreaInsets();
  const stackInfo = readStackInfoFromTabState(state);
  const activeTitle = appStore(useShallow((s) => s.title));

  const navigateToTab = (route: TabRouteName) => {
    appStore.getState().setTitle(RouteTitles[route]);

    if (route === RouteNames.home) {
      if (stackInfo.key) {
        navigation.dispatch(popToTopBottomStack(stackInfo.key));
      } else {
        navigation.navigate(RouteNames.bottomStack, {
          screen: RouteNames.home,
        });
      }
      return;
    }

    if (stackInfo.routeName === route) {
      return;
    }

    navigation.navigate(RouteNames.bottomStack, { screen: route });
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TAB_ROUTES.map((route) => {
        const label = RouteTitles[route];
        const isActive = activeTitle === label;
        const color = isActive ? theme.tabBar.active : theme.tabBar.inactive;
        const icon = TAB_ICONS[route];

        return (
          <Pressable
            key={route}
            onPress={() => navigateToTab(route)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
            style={styles.slot}
          >
            <View style={[styles.item, isActive && styles.itemFocused]}>
              <MaterialIcons name={icon} size={22} color={color} />
              <CustomText
                regular={!isActive}
                medium={isActive}
                customStyle={[styles.label, { color }]}
              >
                {label}
              </CustomText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.tabBar.background,
    borderTopWidth: 1,
    borderTopColor: theme.tabBar.border,
    minHeight: 72,
    paddingTop: 10,
  },
  slot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  itemFocused: {
    backgroundColor: theme.tabBar.activeBg,
  },
  label: {
    fontSize: 10,
    textAlign: "center",
  },
});
