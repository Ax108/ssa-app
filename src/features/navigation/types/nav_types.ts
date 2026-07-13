import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";

/** Screens that live under the tab shell (show bottom tab bar). */
export type BottomStackParamList = {
  home: undefined;
  ashram: undefined;
  satsang: undefined;
  gallery: undefined;
  contact: undefined;
};

/** Single-tab shell — only hosts BottomStackScreens (Mobeet pattern). */
export type BottomTabParamList = {
  bottomStack: NavigatorScreenParams<BottomStackParamList> | undefined;
};

/** Root authenticated stack. */
export type MainStackParamList = {
  bottomTab: NavigatorScreenParams<BottomTabParamList> | undefined;
};

export const MainStack = createNativeStackNavigator<MainStackParamList>();
export const BottomTabs = createBottomTabNavigator<BottomTabParamList>();
export const BottomStack = createNativeStackNavigator<BottomStackParamList>();

export const RouteNames = {
  bottomTab: "bottomTab",
  bottomStack: "bottomStack",
  home: "home",
  ashram: "ashram",
  satsang: "satsang",
  gallery: "gallery",
  contact: "contact",
} as const;

export type AppRouteName = (typeof RouteNames)[keyof typeof RouteNames];

export const RouteTitles = {
  [RouteNames.home]: "Home",
  [RouteNames.ashram]: "Ashram",
  [RouteNames.satsang]: "Satsang",
  [RouteNames.gallery]: "Gallery",
  [RouteNames.contact]: "Contact",
} as const;

export type RouteTitleType =
  | (typeof RouteTitles)[keyof typeof RouteTitles]
  | null;

/** Tab destinations (exclude shell route names). */
export type TabRouteName = keyof BottomStackParamList;

export const TAB_ROUTES: TabRouteName[] = [
  RouteNames.home,
  RouteNames.ashram,
  RouteNames.satsang,
  RouteNames.gallery,
  RouteNames.contact,
];
