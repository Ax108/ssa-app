import { CustomText } from "@shared/components/CustomText";
import { SSALogoIcon } from "@shared/components/SSALogoIcon";
import { theme } from "@constants";
import { BackArrowIcon } from "./BackArrowIcon";
import { RouteNames, RouteTitles } from "../types/nav_types";
import { appStore } from "@store/appStore";
import {
  findBottomStack,
  resetBottomStackToHome,
} from "../helpers/bottomStackNav";
import { navigationRef } from "../navigationRef";
import { useNavigationState } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Matches web `texts.headers.title` (en.json). */
const SITE_BRAND_TITLE = "Sadhan Sangha Ashram";

/**
 * Static top app navbar (web AppBar equivalent).
 * Back uses the root navigation ref — same path as device back — because this
 * chrome sits outside BottomStack (MainStack context cannot pop the child alone).
 */
export const AppTopNavbar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { routeName, key: bottomStackKey } = useNavigationState((state) =>
    findBottomStack(state),
  );

  const showBack = routeName != null && routeName !== RouteNames.home;

  const handleBack = () => {
    if (!showBack) {
      return;
    }

    // Prefer container goBack — mirrors emulator/device back on the focused stack.
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
      return;
    }

    // No history exposed to the container — force Home.
    if (bottomStackKey && navigationRef.isReady()) {
      navigationRef.dispatch(resetBottomStackToHome(bottomStackKey));
      appStore.getState().setTitle(RouteTitles.home);
    }
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.toolbar}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={styles.backButton}
          >
            <BackArrowIcon size={24} color={theme.topNav.foreground} />
          </Pressable>
        ) : null}

        <View style={styles.brand}>
          <SSALogoIcon size={60} />
          <CustomText
            freeman
            bold
            regular={false}
            customStyle={styles.brandTitle}
            numberOfLines={1}
          >
            {SITE_BRAND_TITLE}
          </CustomText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.topNav.background,
    shadowColor: theme.topNav.shadowColor,
    shadowOpacity: theme.topNav.shadowOpacity,
    shadowRadius: theme.topNav.shadowRadius,
    shadowOffset: theme.topNav.shadowOffset,
    elevation: theme.topNav.elevation,
    zIndex: 100,
  },
  toolbar: {
    minHeight: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  brand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  brandTitle: {
    flexShrink: 1,
    color: theme.topNav.foreground,
    fontSize: 18,
    textAlign: "left",
  },
});
