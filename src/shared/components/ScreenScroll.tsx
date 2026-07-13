import { theme } from "@constants";
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type ScreenScrollProps = ScrollViewProps & {
  contentStyle?: StyleProp<ViewStyle>;
};

/** Page scroll surface with ashram page background. */
export const ScreenScroll: React.FC<ScreenScrollProps> = ({
  children,
  style,
  contentStyle,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  ...rest
}) => {
  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[
        styles.content,
        contentContainerStyle,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...rest}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.bg.default,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});
