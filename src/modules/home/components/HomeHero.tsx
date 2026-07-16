import { CustomText } from "@shared/components/CustomText";
import { ExpoImage } from "@shared/components/ExpoImage";
import { AppLinearGradient } from "@shared/components/AppLinearGradient";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HOME_SURFACE } from "../data/homeMeta";
import type { PrimaryImg } from "@shared/types/config";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = width * 0.75 + 140;

type HomeHeroProps = {
  ashramImg?: PrimaryImg;
  shivaImg?: PrimaryImg;
  title: string;
  ctaLabel: string;
  onExplore: () => void;
};

/** Mobile ashram hero — full-bleed image + gradient overlay + Explore CTA. */
export const HomeHero: React.FC<HomeHeroProps> = ({
  ashramImg,
  title,
  ctaLabel,
  onExplore,
}) => {
  return (
    <View style={styles.heroContainer}>
      {ashramImg ? (
        <ExpoImage
          source={{ uri: ashramImg.src }}
          style={styles.heroImage}
          contentFit="cover"
          priority="high"
          accessibilityLabel={ashramImg.alt}
        />
      ) : null}
      <AppLinearGradient
        colors={["transparent", "rgba(42,31,22,0.85)", HOME_SURFACE.footerBg]}
        style={styles.heroOverlay}
      >
        <CustomText freeman customStyle={styles.heroTitle}>
          {title}
        </CustomText>
        <Pressable
          style={styles.heroBtn}
          onPress={onExplore}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          <CustomText medium customStyle={styles.heroBtnText}>
            {ctaLabel}
          </CustomText>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={HOME_SURFACE.textLight}
          />
        </Pressable>
      </AppLinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    width: "100%",
    height: HERO_HEIGHT,
    position: "relative",
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 80,
    alignItems: "center",
  },
  heroShiva: { width: 60, height: 60, opacity: 0.7, marginBottom: 8 },
  heroTitle: {
    fontSize: 26,
    color: HOME_SURFACE.textLight,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 20,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: HOME_SURFACE.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: HOME_SURFACE.primaryLight,
  },
  heroBtnText: {
    fontSize: 14,
    color: HOME_SURFACE.textLight,
  },
});
