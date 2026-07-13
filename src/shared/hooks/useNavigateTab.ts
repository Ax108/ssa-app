import { StackActions, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  RouteNames,
  RouteTitles,
  type BottomStackParamList,
  type TabRouteName,
} from "@navigation/types/nav_types";
import { appStore } from "@store/appStore";

/**
 * Navigate within BottomStack (called from tab screens).
 * Uses stack `push` / `popToTop` so the top back arrow has real history.
 */
export const useNavigateTab = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<BottomStackParamList>>();

  return (route: TabRouteName) => {
    appStore.getState().setTitle(RouteTitles[route]);

    if (route === RouteNames.home) {
      navigation.dispatch(StackActions.popToTop());
      return;
    }

    const state = navigation.getState();
    const current = state.routes[state.index]?.name;
    if (current === route) {
      return;
    }

    navigation.dispatch(StackActions.push(route));
  };
};
