import { HomeScreen } from "@modules/home/HomeScreen";
import { AshramScreen } from "@modules/ashram/AshramScreen";
import { ContactScreen } from "@modules/contact/ContactScreen";
import { GalleryScreen } from "@modules/gallery/GalleryScreen";
import { SatsangScreen } from "@modules/satsang/SatsangScreen";
import { DonationScreen } from "@modules/donation/DonationScreen";
import {
  BottomStack,
  RouteNames,
  RouteTitles,
  type BottomStackParamList,
} from "@navigation/types/nav_types";
import { appStore } from "@store/appStore";
import { theme } from "@constants";

const trackScreenTitle =
  (title: (typeof RouteTitles)[keyof typeof RouteTitles]) => () => {
    appStore.getState().setTitle(title);
  };

/**
 * Owns all primary screens shown with the bottom tab bar.
 * No header here — AppTopNavbar is static chrome on BottomTabShell.
 * Donation is stack-only (footer entry), not a bottom tab.
 */
export const BottomStackScreens: React.FC = () => {
  return (
    <BottomStack.Navigator
      initialRouteName={RouteNames.home}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg.default },
        animation: "slide_from_right",
      }}
    >
      <BottomStack.Screen
        name={RouteNames.home}
        component={HomeScreen}
        listeners={{ focus: trackScreenTitle(RouteTitles.home) }}
        options={{ animation: "fade", gestureEnabled: false }}
      />
      <BottomStack.Screen
        name={RouteNames.ashram}
        component={AshramScreen}
        listeners={{ focus: trackScreenTitle(RouteTitles.ashram) }}
      />
      <BottomStack.Screen
        name={RouteNames.satsang}
        component={SatsangScreen}
        listeners={{ focus: trackScreenTitle(RouteTitles.satsang) }}
      />
      <BottomStack.Screen
        name={RouteNames.gallery}
        component={GalleryScreen}
        listeners={{ focus: trackScreenTitle(RouteTitles.gallery) }}
      />
      <BottomStack.Screen
        name={RouteNames.contact}
        component={ContactScreen}
        listeners={{ focus: trackScreenTitle(RouteTitles.contact) }}
      />
      <BottomStack.Screen
        name={RouteNames.donation}
        component={DonationScreen}
        listeners={{ focus: trackScreenTitle(RouteTitles.donation) }}
      />
    </BottomStack.Navigator>
  );
};

export type { BottomStackParamList };
