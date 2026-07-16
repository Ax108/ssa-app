import { useCallback, useMemo, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@shared/components/CustomText";
import { ExpoImage } from "@shared/components/ExpoImage";
import { AppFooterStrip } from "@shared/components/AppFooterStrip";
import {
  albumImageUrl,
  albumThumbUrl,
  stripBasicMarkdown,
} from "@shared/utils/assetUrl";
import { useAppContent } from "@shared/hooks/useAppContent";
import { useNavigateDonation } from "@shared/hooks/useNavigateTab";
import type { GalleryImage } from "@shared/types/config";
import { palette, theme } from "@constants";
import { HOME_SURFACE } from "@home/data/homeMeta";

const { width, height } = Dimensions.get("window");
const COLS = 3;
const GAP = 8;
const H_PAD = 16;
const THUMB = (width - H_PAD * 2 - GAP * (COLS - 1)) / COLS;

export const GalleryScreen: React.FC = () => {
  const navigateDonation = useNavigateDonation();
  const content = useAppContent();
  const config = content?.config;
  const texts = content?.texts;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const albums = useMemo(() => {
    if (!config) return [] as { key: string; value: string; path: string }[];
    return Object.entries(config.gallery.albums).map(([key, album]) => ({
      key: album.key ?? key,
      value: album.value,
      path: album.path,
    }));
  }, [config]);

  /** Same default as web Gallery: `albums.guruji`. */
  const selectedKey =
    activeKey ??
    (config?.gallery.albums.guruji
      ? (config.gallery.albums.guruji.key ?? "guruji")
      : (albums[0]?.key ?? null));

  const images: GalleryImage[] = useMemo(() => {
    if (!config || !selectedKey) return [];
    const list = config.gallery[selectedKey];
    return Array.isArray(list) ? list : [];
  }, [config, selectedKey]);

  const albumPath = selectedKey
    ? (config?.gallery.albums[selectedKey]?.path ?? "")
    : "";

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i != null && i > 0 ? i - 1 : i));
  }, []);
  const next = useCallback(() => {
    setLightboxIndex((i) => (i != null && i < images.length - 1 ? i + 1 : i));
  }, [images.length]);

  const listHeader = useMemo(() => {
    if (!config || !texts) return null;
    return (
      <View>
        <View style={styles.descSection}>
          <CustomText customStyle={styles.bodyText}>
            {stripBasicMarkdown(texts.gallery)}
          </CustomText>
        </View>
        <View style={styles.albumSelector}>
          <CustomText semiBold customStyle={styles.albumSelectLabel}>
            {texts.headers.albumSelect}
          </CustomText>
          <View style={styles.albumTabs}>
            {albums.map((al) => {
              const active = al.key === selectedKey;
              return (
                <Pressable
                  key={al.key}
                  style={[styles.albumTab, active && styles.albumTabActive]}
                  onPress={() => {
                    setActiveKey(al.key);
                    setLightboxIndex(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={al.value}
                >
                  <CustomText
                    semiBold
                    customStyle={[
                      styles.albumTabText,
                      active && styles.albumTabTextActive,
                    ]}
                  >
                    {al.value}
                  </CustomText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  }, [albums, config, selectedKey, texts]);

  const listFooter = useMemo(() => {
    if (!config || !texts) return null;
    return (
      <AppFooterStrip
        contact={config.contactDetails}
        footer={texts.footer}
        socialLinks={config.socialLinks}
        socialNames={texts.socialNames}
        donateLabel={texts.pages.donation ?? texts.headers.donate}
        onDonatePress={navigateDonation}
      />
    );
  }, [config, texts, navigateDonation]);

  if (!content) {
    return <View style={styles.fallback} />;
  }

  return (
    <View style={styles.root}>
      <FlashList
        data={images}
        numColumns={COLS}
        key={selectedKey ?? "gallery"}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        keyExtractor={(item, index) => `${selectedKey}-${item.i}-${index}`}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => setLightboxIndex(index)}
            style={[
              styles.thumbWrapper,
              {
                marginLeft: index % COLS === 0 ? H_PAD : GAP / 2,
                marginRight: (index + 1) % COLS === 0 ? H_PAD : GAP / 2,
              },
            ]}
          >
            <ExpoImage
              source={{ uri: albumThumbUrl(albumPath, item.i) }}
              style={styles.thumb}
              contentFit="cover"
              recyclingKey={`${selectedKey}-${item.i}`}
              accessibilityLabel={`${selectedKey} ${item.i}`}
            />
          </Pressable>
        )}
      />

      <Modal
        visible={lightboxIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closeLightbox}
      >
        <View style={styles.lightbox}>
          <Pressable style={styles.lightboxBg} onPress={closeLightbox} />
          {lightboxIndex !== null && images[lightboxIndex] ? (
            <>
              <ExpoImage
                source={{
                  uri: albumImageUrl(albumPath, images[lightboxIndex].i),
                }}
                style={styles.lightboxImage}
                contentFit="contain"
                priority="high"
              />
              <Pressable style={styles.closeBtn} onPress={closeLightbox}>
                <Ionicons name="close" size={24} color={palette.white} />
              </Pressable>
              {lightboxIndex > 0 ? (
                <Pressable
                  style={[styles.navBtn, styles.prevBtn]}
                  onPress={prev}
                >
                  <Ionicons
                    name="chevron-back"
                    size={28}
                    color={palette.white}
                  />
                </Pressable>
              ) : null}
              {lightboxIndex < images.length - 1 ? (
                <Pressable
                  style={[styles.navBtn, styles.nextBtn]}
                  onPress={next}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={28}
                    color={palette.white}
                  />
                </Pressable>
              ) : null}
              <View style={styles.lightboxCounter}>
                <CustomText customStyle={styles.lightboxCounterText}>
                  {lightboxIndex + 1} / {images.length}
                </CustomText>
              </View>
            </>
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.default },
  fallback: { flex: 1, backgroundColor: theme.bg.default },
  listContent: { paddingBottom: 8 },
  descSection: { padding: 20, backgroundColor: palette.white },
  bodyText: {
    fontSize: 13,
    color: HOME_SURFACE.primary,
    opacity: 0.8,
    lineHeight: 22,
  },
  albumSelector: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  albumSelectLabel: {
    fontSize: 14,
    color: HOME_SURFACE.primary,
    paddingHorizontal: 4,
  },
  albumTabs: {
    flexDirection: "row",
    gap: 12,
  },
  albumTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,241,228,0.7)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  albumTabActive: {
    backgroundColor: HOME_SURFACE.primary,
    borderColor: HOME_SURFACE.primaryLight,
  },
  albumTabText: { fontSize: 15, color: HOME_SURFACE.primary },
  albumTabTextActive: { color: HOME_SURFACE.textLight },
  thumbWrapper: {
    width: THUMB,
    height: THUMB,
    marginBottom: GAP,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumb: { width: "100%", height: "100%" },
  lightbox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxBg: { ...StyleSheet.absoluteFill },
  lightboxImage: {
    width,
    height: height * 0.7,
    backgroundColor: "transparent",
  },
  closeBtn: {
    position: "absolute",
    top: 48,
    right: 20,
    padding: 8,
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -24,
    padding: 8,
  },
  prevBtn: { left: 8 },
  nextBtn: { right: 8 },
  lightboxCounter: {
    position: "absolute",
    bottom: 48,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lightboxCounterText: { color: palette.white, fontSize: 13 },
});
