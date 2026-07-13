import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  type SharedValue,
} from "react-native-reanimated";

const DOT_COLOR = "rgb(243, 217, 195)";
const DOT_COUNT = 3;
/** Matches site `l21` — .5s alternate so a full left→right→left cycle is 1s */
const CYCLE_MS = 500;

type BubbleLoaderProps = {
  color?: string;
};

const BubbleDot = ({
  index,
  progress,
  color,
}: {
  index: number;
  progress: SharedValue<number>;
  color: string;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Site keyframes: 0% → [7,3,0], 50% → [3,7,3], 100% → [0,3,7]
    // Map spread (0 / 3 / 7) onto scale (~0.35 / 0.7 / 1.15)
    const peaks = [
      [1.15, 0.7, 0.35],
      [0.7, 1.15, 0.7],
      [0.35, 0.7, 1.15],
    ] as const;
    const [s0, s50, s100] = peaks[index];
    const scale = interpolate(progress.value, [0, 0.5, 1], [s0, s50, s100]);
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color }, animatedStyle]}
    />
  );
};

export const BubbleLoader = ({ color = DOT_COLOR }: BubbleLoaderProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }),
      -1,
      true, // alternate — same as CSS `animation-direction: alternate`
    );
  }, [progress]);

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <BubbleDot key={i} index={i} progress={progress} color={color} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
    height: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
