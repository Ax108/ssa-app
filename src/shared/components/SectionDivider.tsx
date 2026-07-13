import { CustomText } from "@shared/components/CustomText";
import { palette, theme } from "@constants";
import { StyleSheet, View } from "react-native";

type SectionDividerProps = {
  label?: string;
};

export const SectionDivider: React.FC<SectionDividerProps> = ({ label }) => {
  if (!label) {
    return <View style={styles.line} />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.lineHalf} />
      <CustomText freeman bold customStyle={styles.label}>
        {label}
      </CustomText>
      <View style={styles.lineHalf} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
    gap: 8,
  },
  lineHalf: {
    flex: 1,
    height: 1,
    backgroundColor: theme.tabBar.active,
    opacity: 0.4,
  },
  label: {
    fontSize: 20,
    color: palette.goldLight,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  line: {
    height: 1,
    backgroundColor: theme.text.mid,
    marginHorizontal: 16,
    marginVertical: 12,
    opacity: 0.5,
  },
});
