import SsaLogoSvg from "@/assets/ssaLogo.svg";
import { theme } from "@constants";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type SSALogoIconProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Web navbar logo (`ssaLogo.svg`) with `.variant-brown` colors.
 * Web CSS: `.variant-brown svg #ssa-body { fill: #796b5d }`
 * Circular wrap matches `.logo-wrap`.
 */
export const SSALogoIcon: React.FC<SSALogoIconProps> = ({
  size = 48,
  style,
}) => {
  const logoSize = Math.round(size * 0.85);

  return (
    <View
      style={[
        styles.wrap,
        { height: size, width: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <SsaLogoSvg
        width={logoSize}
        height={logoSize}
        accessibilityLabel="Sadhan Sangha Ashram Logo"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginRight: 10,
    backgroundColor: theme.topNav.logoWrap,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});
