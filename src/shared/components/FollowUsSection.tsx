import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@shared/components/CustomText";
import { SSADivider } from "@shared/components/SSADivider";
import { openExternalUrl } from "@shared/utils/openUrl";
import { palette, theme } from "@constants";
import type { SocialLink } from "@shared/types/config";
import type { SocialName } from "@shared/types/texts";

type FollowUsSectionProps = {
  title: string;
  socialLinks: Record<string, SocialLink>;
  socialNames: Record<string, SocialName>;
  removeTopDivider?: boolean;
};

const SOCIAL_ORDER = ["fb", "yt", "sp", "ap"] as const;

const SOCIAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  fb: "logo-facebook",
  yt: "logo-youtube",
  sp: "musical-notes",
  ap: "headset",
};

const SOCIAL_COLORS: Record<string, string> = {
  fb: "#1877F2",
  yt: "#FF0000",
  sp: "#1DB954",
  ap: "#FF9900",
};

/**
 * Web `FollowUsSection` — cream block + SSA dividers + social cards.
 * Used on Home and Ashram (and anywhere else that mirrors the site).
 */
export const FollowUsSection: React.FC<FollowUsSectionProps> = ({
  title,
  socialLinks,
  socialNames,
  removeTopDivider = false,
}) => {
  const entries = SOCIAL_ORDER.filter((key) => socialLinks[key]);

  return (
    <View style={styles.section}>
      {!removeTopDivider && <SSADivider />}
      <CustomText freeman extraBold customStyle={styles.title}>
        {title}
      </CustomText>
      <View style={styles.grid}>
        {entries.map((key) => {
          const link = socialLinks[key];
          const name = socialNames[key]?.n ?? key;
          return (
            <Pressable
              key={key}
              style={styles.card}
              onPress={() => void openExternalUrl(link.l)}
              accessibilityRole="link"
              accessibilityLabel={name}
            >
              <Ionicons
                name={SOCIAL_ICONS[key] ?? "link"}
                size={36}
                color={SOCIAL_COLORS[key] ?? theme.tabBar.active}
              />
              <CustomText customStyle={styles.cardLabel}>{name}</CustomText>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.bottomDivider}>
        <SSADivider />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: palette.default200,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  title: {
    fontSize: 24,
    color: palette.default300,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 8,
  },
  bottomDivider: {
    marginVertical: 12,
  },
  card: {
    width: "48%",
    backgroundColor: palette.white,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 10,
    shadowColor: palette.default300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 13,
    color: palette.default300,
    textAlign: "center",
  },
});
