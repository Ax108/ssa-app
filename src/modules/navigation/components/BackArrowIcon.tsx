import { Ionicons } from "@expo/vector-icons";
import { theme } from "@constants";
import { Platform, type StyleProp, type TextStyle } from "react-native";

type BackArrowIconProps = {
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

const BACK_ICON_NAME = Platform.OS === "ios" ? "chevron-back" : "arrow-back";

/**
 * Platform-native back arrow for AppTopNavbar.
 * iOS: chevron-back · Android: arrow-back
 */
export const BackArrowIcon = ({
  size = 24,
  color = theme.topNav.foreground,
  style,
}: BackArrowIconProps) => (
  <Ionicons name={BACK_ICON_NAME} size={size} color={color} style={[style]} />
);
