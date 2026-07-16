import { CustomText } from "@shared/components/CustomText";
import { theme, siteTitle, siteUrl } from "@constants";
import { openExternalUrl } from "@shared/utils/openUrl";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ContactDetails, SocialLink } from "@shared/types/config";
import type { Footer, SocialName } from "@shared/types/texts";

type AppFooterStripProps = {
  contact: ContactDetails;
  footer: Footer;
  socialLinks: Record<string, SocialLink>;
  socialNames: Record<string, SocialName>;
  /** When false, omit social row (Home/Ashram use shared FollowUsSection). */
  showSocial?: boolean;
  /** Localized Donate label + press (stack navigation). */
  donateLabel?: string;
  onDonatePress?: () => void;
};

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

/** Mobile app developer credit (overrides CDN/web `footer.devName`). */
const APP_DEV_NAME = "AstraX";

/** Compact dark footer strip; data from web config/texts. */
export const AppFooterStrip: React.FC<AppFooterStripProps> = ({
  contact,
  footer,
  socialLinks,
  socialNames,
  showSocial = true,
  donateLabel,
  onDonatePress,
}) => {
  const year = new Date().getFullYear();
  const devName = APP_DEV_NAME;

  return (
    <View style={styles.footer}>
      <CustomText freeman customStyle={styles.name}>
        {siteTitle}
      </CustomText>
      <Pressable
        onPress={() => void openExternalUrl(contact.gmap)}
        accessibilityRole="link"
        accessibilityLabel="Open map"
      >
        <CustomText customStyle={styles.address}>{contact.location}</CustomText>
      </Pressable>
      {showSocial ? (
        <View style={styles.socialRow}>
          {Object.entries(socialLinks).map(([key, link]) => (
            <Pressable
              key={key}
              style={styles.socialBtn}
              onPress={() => void openExternalUrl(link.l)}
              accessibilityRole="link"
              accessibilityLabel={socialNames[key]?.n ?? key}
            >
              <Ionicons
                name={SOCIAL_ICONS[key] ?? "link"}
                size={20}
                color={SOCIAL_COLORS[key] ?? theme.tabBar.active}
              />
              <CustomText customStyle={styles.socialLabel}>
                {socialNames[key]?.n2 ?? key}
              </CustomText>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.divider} />
      <View style={styles.metaRow}>
        {donateLabel && onDonatePress ? (
          <>
            <Pressable
              onPress={onDonatePress}
              accessibilityRole="button"
              accessibilityLabel={donateLabel}
            >
              <CustomText customStyle={styles.metaLink}>
                {donateLabel}
              </CustomText>
            </Pressable>
            <CustomText customStyle={styles.metaSep}>·</CustomText>
          </>
        ) : null}
        <Pressable
          onPress={() => void openExternalUrl(`${siteUrl}/privacy`)}
          accessibilityRole="link"
          accessibilityLabel={footer.privacy}
        >
          <CustomText customStyle={styles.metaLink}>
            {footer.privacy}
          </CustomText>
        </Pressable>
        <CustomText customStyle={styles.metaSep}>·</CustomText>
        <Pressable
          onPress={() => void openExternalUrl(footer.devLink)}
          accessibilityRole="link"
          accessibilityLabel={`${footer.dev} ${devName}`}
        >
          <CustomText customStyle={styles.metaLink}>
            {footer.dev} {devName}
          </CustomText>
        </Pressable>
      </View>
      <CustomText customStyle={styles.copy}>
        © {footer.startYear}–{year} {footer.cc}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: theme.footer.background,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
    marginTop: 8,
  },
  name: {
    fontSize: 18,
    color: theme.text.light,
    letterSpacing: 1,
    marginBottom: 10,
  },
  address: {
    fontSize: 12,
    color: theme.footer.muted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  socialBtn: {
    alignItems: "center",
    gap: 4,
    minWidth: 64,
  },
  socialLabel: {
    fontSize: 10,
    color: theme.footer.text,
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.footer.bar,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  metaLink: {
    fontSize: 11,
    color: theme.tabBar.active,
  },
  metaSep: {
    fontSize: 11,
    color: theme.footer.muted,
  },
  copy: {
    fontSize: 11,
    color: theme.footer.muted,
    textAlign: "center",
  },
});
