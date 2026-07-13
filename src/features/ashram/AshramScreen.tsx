import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@shared/components/CustomText";
import { ExpoImage } from "@shared/components/ExpoImage";
import { ScreenScroll } from "@shared/components/ScreenScroll";
import { SSADivider } from "@shared/components/SSADivider";
import { FollowUsSection } from "@shared/components/FollowUsSection";
import { AppFooterStrip } from "@shared/components/AppFooterStrip";
import { albumThumbUrl, paragraphsFromMarkdown } from "@shared/utils/assetUrl";
import { useAppContent } from "@shared/hooks/useAppContent";
import { useNavigateTab } from "@shared/hooks/useNavigateTab";
import { RouteNames } from "@navigation/types/nav_types";
import { palette, theme } from "@constants";
import type { GalleryImage } from "@shared/types/config";

const { width } = Dimensions.get("window");
/** Web small-screen `DynamicGallery` uses `maxRows={2}`; 3-col grid → 6 thumbs. */
const PREVIEW_COLS = 3;
const PREVIEW_ROWS = 2;
const PREVIEW_MAX = PREVIEW_COLS * PREVIEW_ROWS;
const GAP = 6;
const H_PAD = 16;
const THUMB = (width - H_PAD * 2 - GAP * (PREVIEW_COLS - 1)) / PREVIEW_COLS;

/**
 * Ashram page aligned with web `Ashram.tsx` / `AshramSection`:
 * hero image → CDN markdown → ashram album preview → View Gallery → Follow Us.
 */
export const AshramScreen: React.FC = () => {
  const navigateTab = useNavigateTab();
  const content = useAppContent();

  if (!content) {
    return <View style={styles.fallback} />;
  }

  const { config, texts } = content;
  const { gallery, primaryImgs, contactDetails, socialLinks } = config;
  const headers = texts.headers;
  const ashramImg = primaryImgs.ashram;
  const paragraphs = paragraphsFromMarkdown(texts.ashram);
  const album = gallery.albums.ashram;
  const albumKey = album?.key ?? "ashram";
  const albumPath = album?.path ?? "";
  const allImages = Array.isArray(gallery[albumKey])
    ? (gallery[albumKey] as GalleryImage[])
    : [];
  const preview = allImages.slice(0, PREVIEW_MAX);
  const aspect =
    ashramImg?.width && ashramImg?.height
      ? ashramImg.width / ashramImg.height
      : 16 / 9;

  return (
    <ScreenScroll>
      {ashramImg ? (
        <View style={[styles.hero, { aspectRatio: aspect }]}>
          <ExpoImage
            source={{ uri: ashramImg.src }}
            style={styles.heroImage}
            contentFit="cover"
            priority="high"
            accessibilityLabel={ashramImg.alt}
          />
        </View>
      ) : null}

      <View style={styles.bodyCard}>
        <SSADivider color={palette.default200} />
        <View style={styles.textBlock}>
          {paragraphs.map((p, i) => (
            <CustomText key={i} customStyle={styles.bodyText}>
              {p}
            </CustomText>
          ))}
        </View>
        <SSADivider color={palette.default200} />

        {preview.length > 0 ? (
          <View style={styles.galleryGrid}>
            {preview.map((item, index) => (
              <Pressable
                key={`${item.i}-${index}`}
                style={styles.thumbWrap}
                onPress={() => navigateTab(RouteNames.gallery)}
                accessibilityRole="button"
                accessibilityLabel={headers.gallery}
              >
                <ExpoImage
                  source={{ uri: albumThumbUrl(albumPath, item.i) }}
                  style={styles.thumb}
                  contentFit="cover"
                  recyclingKey={`ashram-preview-${item.i}`}
                />
              </Pressable>
            ))}
          </View>
        ) : null}

        <Pressable
          style={styles.galleryCta}
          onPress={() => navigateTab(RouteNames.gallery)}
          accessibilityRole="button"
          accessibilityLabel={`View ${headers.gallery}`}
        >
          <CustomText medium customStyle={styles.galleryCtaText}>
            View {headers.gallery}
          </CustomText>
          <Ionicons name="chevron-forward" size={18} color={palette.white} />
        </Pressable>
      </View>

      <FollowUsSection
        title={headers.followUs}
        socialLinks={socialLinks}
        socialNames={texts.socialNames}
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
  hero: {
    width: "100%",
    backgroundColor: palette.brownDeep,
  },
  heroImage: { width: "100%", height: "100%" },
  bodyCard: {
    marginTop: 28,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: palette.white,
    borderRadius: 8,
  },
  textBlock: { paddingVertical: 8 },
  bodyText: {
    fontSize: 14,
    color: palette.default300,
    opacity: 0.85,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: "left",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    gap: GAP,
    marginTop: 8,
    marginBottom: 12,
  },
  thumbWrap: {
    width: THUMB,
    height: THUMB,
    borderRadius: 4,
    overflow: "hidden",
  },
  thumb: { width: "100%", height: "100%" },
  galleryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: palette.brownDeep,
    paddingVertical: 14,
    borderRadius: 4,
  },
  galleryCtaText: {
    fontSize: 15,
    color: palette.white,
  },
});
