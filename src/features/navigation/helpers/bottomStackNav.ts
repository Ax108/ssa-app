import {
  StackActions,
  CommonActions,
  type NavigationState,
  type PartialState,
} from "@react-navigation/native";
import { RouteNames } from "../types/nav_types";

type NavState = NavigationState | PartialState<NavigationState> | undefined;

export type BottomStackInfo = {
  key?: string;
  index: number;
  routeName?: string;
};

const readStackInfo = (stackState: NavState): BottomStackInfo | null => {
  if (
    !stackState ||
    !("routes" in stackState) ||
    !stackState.routes ||
    stackState.type !== "stack"
  ) {
    return null;
  }
  const hasHome = stackState.routes.some(
    (route) => route.name === RouteNames.home,
  );
  if (!hasHome) {
    return null;
  }
  const index = stackState.index ?? 0;
  const current = stackState.routes[index];
  return {
    key:
      "key" in stackState && typeof stackState.key === "string"
        ? stackState.key
        : undefined,
    index,
    routeName:
      current && typeof current.name === "string" ? current.name : undefined,
  };
};

/** Bottom stack info from the tab navigator `state` prop. */
export const readStackInfoFromTabState = (
  tabState: NavigationState,
): BottomStackInfo => {
  const focused = tabState.routes[tabState.index];
  if (focused?.name === RouteNames.bottomStack && focused.state) {
    return readStackInfo(focused.state) ?? { index: 0 };
  }
  return findBottomStack(tabState);
};

/** Locate BottomStack in the tree (route `bottomStack` or a stack that owns `home`). */
export const findBottomStack = (state: NavState): BottomStackInfo => {
  if (!state || !("routes" in state) || !state.routes) {
    return { index: 0 };
  }

  const direct = readStackInfo(state);
  if (direct?.key) {
    return direct;
  }

  for (const route of state.routes) {
    if (route.name === RouteNames.bottomStack && route.state) {
      const fromRoute = readStackInfo(route.state);
      if (fromRoute) {
        return fromRoute;
      }
    }
    const nested = findBottomStack(route.state);
    if (nested.key || nested.routeName) {
      return nested;
    }
  }

  return direct ?? { index: 0 };
};

export const popBottomStack = (key: string) => ({
  ...StackActions.pop(),
  target: key,
});

export const popToTopBottomStack = (key: string) => ({
  ...StackActions.popToTop(),
  target: key,
});

export const pushBottomStack = (key: string, route: string) => ({
  ...StackActions.push(route),
  target: key,
});

/** When the stack was replaced (no history), reset to Home. */
export const resetBottomStackToHome = (key: string) => ({
  ...CommonActions.reset({
    index: 0,
    routes: [{ name: RouteNames.home }],
  }),
  target: key,
});
