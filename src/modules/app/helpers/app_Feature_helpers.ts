import { Appearance, type ColorSchemeName } from "react-native";

export const getDeviceColorScheme = (): "light" | "dark" => {
  const scheme: ColorSchemeName = Appearance.getColorScheme() || "light";
  return scheme === "dark" ? "dark" : "light";
};
