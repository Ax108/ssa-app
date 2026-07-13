import { Pressable, StyleSheet, View } from "react-native";
import { AppLinearGradient } from "@shared/components/AppLinearGradient";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@shared/components/CustomText";
import { ExpoImage } from "@shared/components/ExpoImage";
import { ScreenScroll } from "@shared/components/ScreenScroll";
import { SSADivider } from "@shared/components/SSADivider";
import { FollowUsSection } from "@shared/components/FollowUsSection";
import { AppFooterStrip } from "@shared/components/AppFooterStrip";
import { openExternalUrl } from "@shared/utils/openUrl";
import { useAppContent } from "@shared/hooks/useAppContent";
import { palette, theme } from "@constants";
import { HOME_SURFACE } from "@home/data/homeMeta";

export const ContactScreen: React.FC = () => {
  const content = useAppContent();

  if (!content) {
    return <View style={styles.fallback} />;
  }

  const { config, texts } = content;
  const { contactDetails, socialLinks, primaryImgs } = config;
  const headers = texts.headers;
  const shiva = primaryImgs.shiva;

  const contactItems = [
    {
      key: "address",
      icon: "location" as const,
      color: HOME_SURFACE.gold,
      bg: "rgba(212,160,23,0.1)",
      label: "Address",
      value: contactDetails.location,
      action: () => void openExternalUrl(contactDetails.gmap),
    },
    {
      key: "phone",
      icon: "call" as const,
      color: HOME_SURFACE.primary,
      bg: "rgba(80,69,59,0.1)",
      label: "Phone",
      value: contactDetails.phone,
      action: () =>
        void openExternalUrl(`tel:${contactDetails.phone.replace(/\s/g, "")}`),
    },
    {
      key: "email",
      icon: "mail" as const,
      color: "#c8393d",
      bg: "rgba(200,57,61,0.1)",
      label: "Email",
      value: contactDetails.email,
      action: () => void openExternalUrl(`mailto:${contactDetails.email}`),
    },
  ];

  return (
    <ScreenScroll>
      <View style={styles.section}>
        <CustomText freeman customStyle={styles.sectionLabel}>
          {headers.reachUs}
        </CustomText>
        <CustomText freeman customStyle={styles.sectionTitle}>
          Get in Touch
        </CustomText>
        {contactItems.map((item) => (
          <Pressable
            key={item.key}
            style={styles.contactCard}
            onPress={item.action}
          >
            <View
              style={[styles.contactIconWrap, { backgroundColor: item.bg }]}
            >
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.contactInfo}>
              <CustomText customStyle={styles.contactLabel}>
                {item.label}
              </CustomText>
              <CustomText customStyle={styles.contactValue}>
                {item.value}
              </CustomText>
            </View>
            <Ionicons
              name="open-outline"
              size={16}
              color={HOME_SURFACE.primary}
              style={{ opacity: 0.4 }}
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.mapSection}>
        <Pressable
          style={styles.mapCard}
          onPress={() => void openExternalUrl(contactDetails.gmap)}
        >
          <AppLinearGradient
            colors={[HOME_SURFACE.bgDark, HOME_SURFACE.primary]}
            style={styles.mapGradient}
          >
            <Ionicons name="location" size={40} color={HOME_SURFACE.gold} />
            <CustomText freeman customStyle={styles.mapTitle}>
              View on Google Maps
            </CustomText>
            <CustomText customStyle={styles.mapSub}>
              {contactDetails.gmapEmbedTitle}
            </CustomText>
            <View style={styles.mapBtn}>
              <CustomText medium customStyle={styles.mapBtnText}>
                Open Maps
              </CustomText>
              <Ionicons
                name="open-outline"
                size={14}
                color={HOME_SURFACE.gold}
              />
            </View>
          </AppLinearGradient>
        </Pressable>
      </View>

      {/* Web Contact: ReachUs → SSADivider → centered `primaryImgs.shiva`. */}
      {shiva?.src ? (
        <View style={styles.shivaBlock}>
          <SSADivider />
          <ExpoImage
            source={{ uri: shiva.src }}
            style={styles.shivaImage}
            contentFit="contain"
            accessibilityLabel={shiva.alt}
          />
          <SSADivider />
        </View>
      ) : null}

      <FollowUsSection
        title={headers.followUs}
        socialLinks={socialLinks}
        socialNames={texts.socialNames}
        removeTopDivider
      />

      <AppFooterStrip
        contact={contactDetails}
        footer={texts.footer}
        socialLinks={socialLinks}
        socialNames={texts.socialNames}
      />
    </ScreenScroll>
  );
};

const styles = StyleSheet.create({
  fallback: { flex: 1, backgroundColor: theme.bg.default },
  section: { padding: 20, backgroundColor: palette.white, marginBottom: 2 },
  sectionLabel: {
    fontSize: 11,
    color: HOME_SURFACE.accent,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    color: HOME_SURFACE.primary,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(70,64,56,0.15)",
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: { flex: 1 },
  contactLabel: {
    fontSize: 11,
    color: HOME_SURFACE.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 13,
    color: HOME_SURFACE.primary,
    lineHeight: 20,
  },
  mapSection: { padding: 16 },
  mapCard: { borderRadius: 16, overflow: "hidden" },
  mapGradient: {
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  mapTitle: { fontSize: 18, color: HOME_SURFACE.textLight },
  mapSub: {
    fontSize: 12,
    color: HOME_SURFACE.textMutedOnDark,
    textAlign: "center",
    lineHeight: 18,
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HOME_SURFACE.gold,
  },
  mapBtnText: { fontSize: 13, color: HOME_SURFACE.gold },
  /** Mirrors web `.shiva-footer` under ReachUs (~35% width, centered). */
  shivaBlock: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: "trasparent",
    borderRadius: 8,
    alignItems: "center",
  },
  shivaImage: {
    width: "42%",
    aspectRatio: 0.75,
    marginVertical: 12,
    backgroundColor: "transparent",
    tintColor: palette.brownDeep,
  },
});
