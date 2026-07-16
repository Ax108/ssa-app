import { StackActions, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  RouteNames,
  RouteTitles,
  type BottomStackParamList,
  type TabRouteName,
} from "@navigation/types/nav_types";
import { decideBottomStackNav } from "@navigation/helpers/bottomStackNav";
import { appStore } from "@store/appStore";

const dispatchStackDecision = (
  navigation: NativeStackNavigationProp<BottomStackParamList>,
  target: keyof BottomStackParamList,
) => {
  const state = navigation.getState();
  const decision = decideBottomStackNav(state.routes, state.index, target);

  switch (decision.action) {
    case "noop":
      return;
    case "popToTop":
      navigation.dispatch(StackActions.popToTop());
      return;
    case "pop":
      navigation.dispatch(StackActions.pop(decision.count));
      return;
    case "push":
      navigation.dispatch(StackActions.push(decision.route));
      return;
  }
};

/**
 * Navigate within BottomStack (called from tab screens / in-screen CTAs).
 * Reuses an existing stack entry when possible so CTAs do not duplicate tabs.
 */
export const useNavigateTab = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<BottomStackParamList>>();

  return (route: TabRouteName) => {
    appStore.getState().setTitle(RouteTitles[route]);
    dispatchStackDecision(navigation, route);
  };
};

/** Open Donation without stacking a second copy if it is already in history. */
export const useNavigateDonation = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<BottomStackParamList>>();

  return () => {
    appStore.getState().setTitle(RouteTitles.donation);
    dispatchStackDecision(navigation, RouteNames.donation);
  };
};
