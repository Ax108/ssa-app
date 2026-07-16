import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@shared/components/CustomText";
import { SSADivider } from "@shared/components/SSADivider";
import { stripBasicMarkdown } from "@shared/utils/assetUrl";
import { palette, theme } from "@constants";

type DonateTeaserSectionProps = {
  title: string;
  note: string;
  ctaLabel: string;
  onPress: () => void;
  /** Skip top Om divider when the previous block already ends with one. */
  removeTopDivider?: boolean;
};

/**
 * Donate teaser — SSA dividers + card, same framing as FollowUsSection.
 * Sits outside Find Us / contact cream blocks on Home, Ashram, and Contact.
 */
export const DonateTeaserSection: React.FC<DonateTeaserSectionProps> = ({
  title,
  note,
  ctaLabel,
  onPress,
  removeTopDivider = false,
}) => (
  <View style={styles.section}>
    {!removeTopDivider ? <SSADivider /> : null}
    <CustomText freeman extraBold customStyle={styles.title}>
      {title}
    </CustomText>
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="heart" size={22} color={theme.tabBar.active} />
      </View>
      <View style={styles.copy}>
        <CustomText freeman medium customStyle={styles.cardTitle}>
          {ctaLabel}
        </CustomText>
        <CustomText customStyle={styles.note} numberOfLines={3}>
          {stripBasicMarkdown(note)}
        </CustomText>
        <View style={styles.cta}>
          <CustomText medium customStyle={styles.ctaText}>
            {ctaLabel}
          </CustomText>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={theme.tabBar.active}
          />
        </View>
      </View>
    </Pressable>
    <View style={styles.bottomDivider}>
      <SSADivider />
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: palette.default200,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    color: palette.default300,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: palette.white,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(212,160,23,0.35)",
    shadowColor: palette.default300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,160,23,0.12)",
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    color: palette.brownDeep,
  },
  note: {
    fontSize: 13,
    color: palette.brownDeep,
    opacity: 0.75,
    lineHeight: 20,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ctaText: {
    fontSize: 13,
    color: theme.tabBar.active,
  },
  bottomDivider: {
    marginTop: 16,
    marginBottom: 4,
  },
});
