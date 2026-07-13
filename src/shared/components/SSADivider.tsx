import { StyleSheet, View } from "react-native";
import SsaDividerSvg from "@/assets/ssaDivider.svg";
import { palette } from "@constants";

type SSADividerProps = {
  /**
   * Path fill — web default `.svg-divider` uses `--text-light` (`default100`);
   * pass `palette.default200` for `.dark-varient` (`--text-dark`).
   */
  color?: string;
  height?: number;
};

/**
 * Web `SSADivider` / `ssaDivider.svg` — ornate rule with Om flourishes.
 */
export const SSADivider: React.FC<SSADividerProps> = ({
  color = palette.default100,
  height = 35,
}) => (
  <View style={[styles.wrap, { height }]} accessibilityRole="none">
    <SsaDividerSvg width="100%" height={height} fill={color} color={color} />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 8,
  },
});
