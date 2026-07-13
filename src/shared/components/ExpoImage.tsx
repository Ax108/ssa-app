import { Image, type ImageProps } from "expo-image";
import { StyleSheet, type StyleProp, type ImageStyle } from "react-native";
import { theme } from "@constants";

export type ExpoImageProps = Omit<ImageProps, "style"> & {
  style?: StyleProp<ImageStyle>;
};

/**
 * App-wide remote/local image via expo-image.
 * Prefer this over react-native `Image` for CDN assets.
 */
export const ExpoImage: React.FC<ExpoImageProps> = ({
  style,
  contentFit = "cover",
  transition = 200,
  ...rest
}) => {
  return (
    <Image
      {...rest}
      contentFit={contentFit}
      transition={transition}
      style={[styles.base, style]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.bg.default,
  },
});
