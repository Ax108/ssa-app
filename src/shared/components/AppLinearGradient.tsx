import { requireOptionalNativeModule } from "expo-modules-core";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

type AppLinearGradientProps = ViewProps & {
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: readonly number[] | null;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const hasNativeGradient =
  requireOptionalNativeModule("ExpoLinearGradient") != null;

/**
 * Linear gradient with solid-color fallback when the native module is not in
 * the current binary (e.g. before `expo run:android` after adding the package).
 */
export const AppLinearGradient: React.FC<AppLinearGradientProps> = ({
  colors,
  start,
  end,
  locations,
  style,
  children,
  ...rest
}) => {
  if (hasNativeGradient) {
    return (
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={start}
        end={end}
        locations={
          locations ? (locations as [number, number, ...number[]]) : undefined
        }
        style={style}
        {...rest}
      >
        {children}
      </LinearGradient>
    );
  }

  const bottom = colors[colors.length - 1] ?? "#000000";
  const top = colors[0] ?? bottom;

  return (
    <View
      style={[styles.fallback, { backgroundColor: bottom }, style]}
      {...rest}
    >
      <View
        pointerEvents="none"
        style={[styles.topWash, { backgroundColor: top }]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    overflow: "hidden",
  },
  topWash: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
});
