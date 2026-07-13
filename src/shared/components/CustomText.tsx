import {
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
} from "react-native";

export type CustomTextProps = Omit<TextProps, "style" | "children"> & {
  children: React.ReactNode;
  customStyle?: StyleProp<TextStyle>;
  regular?: boolean;
  medium?: boolean;
  semiBold?: boolean;
  bold?: boolean;
  extraBold?: boolean;
  freeman?: boolean;
};

/**
 * A custom text component with various font weight options.
 */
export const CustomText: React.FC<CustomTextProps> = ({
  children,
  customStyle,
  regular = true,
  medium = false,
  semiBold = false,
  bold = false,
  extraBold = false,
  freeman = false,
  ...restProps
}) => {
  const styles = createStyles(
    regular,
    medium,
    semiBold,
    bold,
    extraBold,
    freeman,
  );
  return (
    <Text {...restProps} style={[styles.defaultStyles, customStyle]}>
      {children}
    </Text>
  );
};

const createStyles = (
  regular: boolean,
  medium: boolean,
  semiBold: boolean,
  bold: boolean,
  extraBold: boolean,
  freeman: boolean,
) =>
  StyleSheet.create({
    defaultStyles: {
      fontWeight: regular
        ? "400"
        : medium
          ? "500"
          : semiBold
            ? "600"
            : bold
              ? "700"
              : extraBold
                ? "800"
                : "400",
      fontFamily: freeman ? "Freeman_400Regular" : undefined,
    },
  });
