import { createNavigationContainerRef } from "@react-navigation/native";
import type { MainStackParamList } from "./types/nav_types";

/** Root ref — used by chrome outside BottomStack (e.g. AppTopNavbar back). */
export const navigationRef = createNavigationContainerRef<MainStackParamList>();
