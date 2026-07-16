import { useCallback } from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@shared/components/CustomText";
import { ScreenScroll } from "@shared/components/ScreenScroll";
import { SectionDivider } from "@shared/components/SectionDivider";
import { SSADivider } from "@shared/components/SSADivider";
import { AppFooterStrip } from "@shared/components/AppFooterStrip";
import { ExpoImage } from "@shared/components/ExpoImage";
import { AppLinearGradient } from "@shared/components/AppLinearGradient";
import { useAppContent } from "@shared/hooks/useAppContent";
import {
  useNavigateTab,
  useNavigateDonation,
} from "@shared/hooks/useNavigateTab";
import { openExternalUrl } from "@shared/utils/openUrl";
import { stripBasicMarkdown } from "@shared/utils/assetUrl";
import { RouteNames } from "@navigation/types/nav_types";
import { GurujiRow } from "./components/GurujiRow";
import { HomeHero } from "./components/HomeHero";
import { FollowUsSection } from "@shared/components/FollowUsSection";
import { DonateTeaserSection } from "@shared/components/DonateTeaserSection";
import { HOME_SURFACE } from "./data/homeMeta";
import { palette, theme } from "@constants";

/**
 * Root tab screen. Hardware/system back is not intercepted here so Android
 * uses the default behavior (send app to background / tray).
 *
 * Guru portraits sit at the top (web-like row); hero + welcome keep the
 * previous mobile design.
 */
export const HomeScreen: React.FC = () => {
  const navigateTab = useNavigateTab();
  const navigateDonation = useNavigateDonation();
  const content = useAppContent();

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => false;
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onHardwareBack,
      );
      return () => sub.remove();
    }, []),
  );

  if (!content) {
    return <View style={styles.fallback} />;
  }

  const { config, texts } = content;
  const { primaryImgs, contactDetails, socialLinks } = config;
  const headers = texts.headers;
  const goAshram = () => navigateTab(RouteNames.ashram);
  const goSatsang = () => navigateTab(RouteNames.satsang);
  const goContact = () => navigateTab(RouteNames.contact);

  return (
    <ScreenScroll>
      <GurujiRow
        primaryImgs={primaryImgs}
        labels={{
          guruji: headers.guruji,
          boroGuruji: headers.boroGuruji,
          mataji: headers.mataji,
        }}
      />

      <View style={styles.guruHeroGap}>
        <SSADivider />
      </View>

      <HomeHero
        ashramImg={primaryImgs.ashram}
        shivaImg={primaryImgs.shiva}
        title={headers.title}
        ctaLabel={`Explore ${headers.ashram}`}
        onExplore={goAshram}
      />

      <View style={styles.welcomeSection}>
        <CustomText freeman customStyle={styles.sectionLabel}>
          Welcome
        </CustomText>
        <CustomText customStyle={styles.welcomeText}>
          {stripBasicMarkdown(texts.ashramShort)}
        </CustomText>
        <Pressable style={styles.readMoreBtn} onPress={goAshram}>
          <CustomText medium customStyle={styles.readMoreText}>
            {headers.readMore}
          </CustomText>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={HOME_SURFACE.accent}
          />
        </Pressable>
      </View>

      <CustomText freeman extraBold customStyle={styles.satsangHeader}>
        {headers.satsang}
      </CustomText>

      <Pressable style={styles.satsangTeaser} onPress={goSatsang}>
        <AppLinearGradient
          colors={[HOME_SURFACE.primary, HOME_SURFACE.bgDark]}
          style={styles.satsangGradient}
        >
          {primaryImgs.bwGuruji ? (
            <ExpoImage
              source={{ uri: primaryImgs.bwGuruji.src }}
              style={styles.satsangBg}
              contentFit="contain"
            />
          ) : null}
          <CustomText freeman customStyle={styles.satsangLabel}>
            {headers.dailySatsang}
          </CustomText>
          <CustomText freeman customStyle={styles.satsangTitle}>
            Guruji&apos;s Teachings
          </CustomText>
          <CustomText customStyle={styles.satsangText}>
            {stripBasicMarkdown(texts.satsangShort)}
          </CustomText>
          <View style={styles.satsangBtn}>
            <CustomText medium customStyle={styles.satsangBtnText}>
              Listen Now
            </CustomText>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={HOME_SURFACE.gold}
            />
          </View>
        </AppLinearGradient>
      </Pressable>

      <FollowUsSection
        title={headers.followUs}
        socialLinks={socialLinks}
        socialNames={texts.socialNames}
        removeBottomDivider
      />

      <DonateTeaserSection
        title={texts.pages.donation ?? headers.donate}
        note={texts.donationNote}
        ctaLabel={headers.donate}
        onPress={navigateDonation}
      />

      <View style={styles.contactSection}>
        <SectionDivider label="Find Us" />
        <Pressable
          style={styles.contactRow}
          onPress={() => void openExternalUrl(contactDetails.gmap)}
        >
          <View
            style={[
              styles.contactIcon,
              { backgroundColor: "rgba(212,160,23,0.12)" },
            ]}
          >
            <Ionicons name="location" size={20} color={HOME_SURFACE.gold} />
          </View>
          <CustomText customStyle={styles.contactText}>
            {contactDetails.location}
          </CustomText>
        </Pressable>
        <Pressable
          style={styles.contactRow}
          onPress={() =>
            void openExternalUrl(
              `tel:${contactDetails.phone.replace(/\s/g, "")}`,
            )
          }
        >
          <View
            style={[
              styles.contactIcon,
              { backgroundColor: "rgba(80,69,59,0.12)" },
            ]}
          >
            <Ionicons name="call" size={20} color={HOME_SURFACE.primary} />
          </View>
          <CustomText customStyle={styles.contactText}>
            {contactDetails.phone}
          </CustomText>
        </Pressable>
        <Pressable
          style={styles.contactRow}
          onPress={() => void openExternalUrl(`mailto:${contactDetails.email}`)}
        >
          <View
            style={[
              styles.contactIcon,
              { backgroundColor: "rgba(200,57,61,0.1)" },
            ]}
          >
            <Ionicons name="mail" size={20} color="#c8393d" />
          </View>
          <CustomText customStyle={styles.contactText}>
            {contactDetails.email}
          </CustomText>
        </Pressable>
        <Pressable style={styles.readMoreBtn} onPress={goContact}>
          <CustomText
            bold
            customStyle={[
              styles.readMoreText,
              { color: palette.gold, fontSize: 14 },
            ]}
          >
            {headers.contact}
          </CustomText>
          <Ionicons name="chevron-forward" size={16} color={palette.gold} />
        </Pressable>
      </View>

      <AppFooterStrip
        contact={contactDetails}
        footer={texts.footer}
        socialLinks={socialLinks}
        socialNames={texts.socialNames}
        donateLabel={texts.pages.donation ?? texts.headers.donate}
        onDonatePress={navigateDonation}
      />
    </ScreenScroll>
  );
};

const styles = StyleSheet.create({
  fallback: { flex: 1, backgroundColor: HOME_SURFACE.cream },
  guruHeroGap: {
    // Slightly tighter than web’s ~35px divider breathing room.
    paddingVertical: 6,
  },
  welcomeSection: {
    padding: 24,
    backgroundColor: HOME_SURFACE.white,
  },
  sectionLabel: {
    fontSize: 11,
    color: HOME_SURFACE.accent,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: HOME_SURFACE.primary,
    opacity: 0.75,
    lineHeight: 22,
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  readMoreText: {
    fontSize: 13,
    color: HOME_SURFACE.accent,
  },

  satsangHeader: {
    fontSize: 24,
    color: palette.default300,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
    marginTop: 16,
  },
  satsangTeaser: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  satsangGradient: {
    padding: 24,
    minHeight: 180,
    overflow: "hidden",
  },
  satsangBg: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 160,
    height: 160,
    opacity: 0.08,
    backgroundColor: "transparent",
  },
  satsangLabel: {
    fontSize: 11,
    color: HOME_SURFACE.gold,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  satsangTitle: {
    fontSize: 22,
    color: HOME_SURFACE.textLight,
    marginBottom: 10,
  },
  satsangText: {
    fontSize: 13,
    color: HOME_SURFACE.textMutedOnDark,
    lineHeight: 20,
    marginBottom: 16,
  },
  satsangBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  satsangBtnText: {
    fontSize: 13,
    color: HOME_SURFACE.gold,
  },
  contactSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.bg.light,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(70,64,56,0.15)",
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    fontSize: 13,
    color: HOME_SURFACE.primary,
    flex: 1,
    lineHeight: 20,
    paddingTop: 2,
    opacity: 0.85,
  },
});
