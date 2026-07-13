import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@shared/components/CustomText";
import { ExpoImage } from "@shared/components/ExpoImage";
import { ScreenScroll } from "@shared/components/ScreenScroll";
import { SSADivider } from "@shared/components/SSADivider";
import { AppFooterStrip } from "@shared/components/AppFooterStrip";
import {
  sectionsFromMarkdown,
  youtubePlaylistUrl,
  youtubeThumbUrl,
  youtubeWatchUrl,
} from "@shared/utils/assetUrl";
import { openExternalUrl } from "@shared/utils/openUrl";
import { useAppContent } from "@shared/hooks/useAppContent";
import { palette, theme } from "@constants";

const { width } = Dimensions.get("window");

/**
 * Web `/satsang` — hero video → Daily Satsang + playlists → Also Available At
 * → full CDN markdown (`texts.satsang`). Opens YouTube/Spotify externally (no WebView embeds).
 */
export const SatsangScreen: React.FC = () => {
  const content = useAppContent();

  if (!content) {
    return <View style={styles.fallback} />;
  }

  const { config, texts } = content;
  const { yt, CONSTS, socialLinks, contactDetails } = config;
  const headers = texts.headers;
  const sections = sectionsFromMarkdown(texts.satsang);
  const videoId = yt.satsangHeaderVid;
  const spotify = socialLinks.sp;
  const amazon = socialLinks.ap;
  const spotifyName = texts.socialNames.sp?.n ?? "Spotify";
  const amazonName = texts.socialNames.ap?.n ?? "Amazon Music";
  const podcastListId = yt.podcast.includes("list=")
    ? yt.podcast.split("list=")[1]
    : null;
  const podcastUrl = podcastListId
    ? youtubePlaylistUrl(CONSTS.ytPList, podcastListId)
    : (socialLinks.yt?.l ?? null);
  const channelUrl =
    socialLinks.yt?.l ?? `https://www.youtube.com/${yt.channel}`;
  const playlists = [...yt.playlists].reverse();

  return (
    <ScreenScroll>
      <CustomText freeman customStyle={styles.pageTitle}>
        {headers.satsang}
      </CustomText>

      <Pressable
        style={styles.hero}
        onPress={() => void openExternalUrl(youtubeWatchUrl(videoId))}
        accessibilityRole="link"
        accessibilityLabel={headers.listenYT}
      >
        <ExpoImage
          source={{ uri: youtubeThumbUrl(videoId) }}
          style={styles.heroThumb}
          contentFit="cover"
          priority="high"
        />
        <View style={styles.playBtn}>
          <Ionicons name="play" size={28} color={palette.white} />
        </View>
      </Pressable>

      <View style={styles.card}>
        <Pressable
          style={styles.ytHeader}
          onPress={() => void openExternalUrl(channelUrl)}
          accessibilityRole="link"
          accessibilityLabel={headers.subscribe}
        >
          <Ionicons name="logo-youtube" size={22} color="#FF0000" />
          <CustomText freeman customStyle={styles.ytHeaderTitle}>
            {headers.dailySatsang}
          </CustomText>
          <CustomText medium customStyle={styles.subscribe}>
            {headers.subscribe}
          </CustomText>
          <Ionicons name="open-outline" size={16} color={palette.default300} />
        </Pressable>

        {podcastUrl ? (
          <Pressable
            style={styles.podcastTeaser}
            onPress={() => void openExternalUrl(podcastUrl)}
            accessibilityRole="link"
            accessibilityLabel={headers.listenYT}
          >
            <Ionicons name="logo-youtube" size={40} color={palette.white} />
            <CustomText freeman customStyle={styles.podcastLabel}>
              {headers.listenYT}
            </CustomText>
            <View style={styles.playBtnSm}>
              <Ionicons name="play" size={20} color={palette.white} />
            </View>
          </Pressable>
        ) : null}

        <View style={styles.playlistList}>
          {playlists.map((pl) => (
            <Pressable
              key={pl.l}
              style={styles.playlistBtn}
              onPress={() =>
                void openExternalUrl(youtubePlaylistUrl(CONSTS.ytPList, pl.l))
              }
              accessibilityRole="link"
              accessibilityLabel={pl.t}
            >
              <CustomText freeman customStyle={styles.playlistBtnText}>
                {pl.st}
              </CustomText>
              <Ionicons name="open-outline" size={16} color={palette.white} />
            </Pressable>
          ))}
        </View>

        <CustomText freeman customStyle={styles.alsoTitle}>
          {headers.alsoAvailableAt}
        </CustomText>
        <View style={styles.platformGrid}>
          {spotify ? (
            <Pressable
              style={styles.platformCard}
              onPress={() => void openExternalUrl(spotify.l)}
              accessibilityRole="link"
              accessibilityLabel={spotifyName}
            >
              <Ionicons name="musical-notes" size={40} color="#1DB954" />
              <CustomText customStyle={styles.platformLabel}>
                {spotifyName}
              </CustomText>
            </Pressable>
          ) : null}
          {amazon ? (
            <Pressable
              style={styles.platformCard}
              onPress={() => void openExternalUrl(amazon.l)}
              accessibilityRole="link"
              accessibilityLabel={amazonName}
            >
              <Ionicons name="headset" size={40} color="#FF9900" />
              <CustomText customStyle={styles.platformLabel}>
                {amazonName}
              </CustomText>
            </Pressable>
          ) : null}
        </View>

        <SSADivider color={palette.default200} />
        <View style={styles.textBlock}>
          {sections.map((section, i) => (
            <View key={`satsang-sec-${i}`} style={styles.sectionBlock}>
              {section.heading ? (
                <CustomText freeman customStyle={styles.sectionHeading}>
                  {section.heading}
                </CustomText>
              ) : null}
              {section.body ? (
                <CustomText customStyle={styles.bodyText}>
                  {section.body}
                </CustomText>
              ) : null}
            </View>
          ))}
        </View>
        <SSADivider color={palette.default200} />
      </View>

      <View style={styles.bottomDivider}>
        <SSADivider />
      </View>

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
  pageTitle: {
    fontSize: 28,
    color: palette.default300,
    textAlign: "center",
    paddingVertical: 16,
    backgroundColor: palette.default200,
  },
  hero: {
    width: "100%",
    height: width * 0.56,
    backgroundColor: palette.blackSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  heroThumb: { ...StyleSheet.absoluteFill },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginTop: 20,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: palette.white,
    borderRadius: 8,
  },
  ytHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  ytHeaderTitle: {
    flex: 1,
    fontSize: 16,
    color: palette.default300,
  },
  subscribe: {
    fontSize: 13,
    color: palette.default300,
    opacity: 0.75,
  },
  podcastTeaser: {
    height: 152,
    borderRadius: 8,
    backgroundColor: palette.blackSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  podcastLabel: {
    fontSize: 14,
    color: palette.white,
    opacity: 0.9,
  },
  playBtnSm: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  playlistList: { gap: 5, marginBottom: 16 },
  playlistBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.default300,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  playlistBtnText: {
    fontSize: 15,
    color: palette.white,
  },
  alsoTitle: {
    fontSize: 22,
    color: palette.default300,
    textAlign: "center",
    marginBottom: 12,
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 8,
  },
  platformCard: {
    width: "48%",
    backgroundColor: palette.default100,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 10,
  },
  platformLabel: {
    fontSize: 14,
    color: palette.default300,
    textAlign: "center",
  },
  textBlock: { paddingVertical: 8 },
  sectionBlock: { marginBottom: 16 },
  sectionHeading: {
    fontSize: 17,
    color: palette.default300,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: palette.default300,
    opacity: 0.85,
    lineHeight: 24,
    textAlign: "left",
  },
  bottomDivider: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
});
