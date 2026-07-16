import { useCallback, useEffect, useId, useState } from "react";
import { CustomText } from "@shared/components/CustomText";
import { ExpoImage } from "@shared/components/ExpoImage";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Defs,
  FeGaussianBlur,
  Filter,
  Path,
  Rect,
} from "react-native-svg";
import { palette } from "@constants";
import { GURU_ORDER } from "../data/homeMeta";
import type { PrimaryImg } from "@shared/types/config";

type GurujiRowProps = {
  primaryImgs: Record<string, PrimaryImg>;
  labels: Record<(typeof GURU_ORDER)[number], string>;
};

const SCREEN_W = Dimensions.get("window").width;
/** Web Home `wFactor = winWidth / 1000` (portrait widths sum to 1000). */
const W_FACTOR = SCREEN_W / 1000;
const CLIP_H = 48;
const SCALE_MS = 300;
const SCALE_ACTIVE = 1.3;
const EASE = Easing.inOut(Easing.ease);

/**
 * Web `box-shadow: #fbe0ca 0px 0px 10px 6px`
 * — spread 6px, blur 10px. Extra pad so the blur is not clipped.
 */
const GLOW_SPREAD = 6;
const GLOW_BLUR = 5; // SVG stdDeviation ≈ half CSS blur for similar look
const GLOW_PAD = GLOW_SPREAD + GLOW_BLUR * 2 + 4;

type PortraitProps = {
  img: PrimaryImg;
  label: string;
  index: number;
  portraitKey: string;
  /** Sticky “hover” — matches mobile-web `:hover` that stays after tap. */
  active: boolean;
  onToggle: (key: string) => void;
};

type CreamGlowProps = {
  width: number;
  height: number;
  filterId: string;
};

/**
 * Diffused cream halo matching web figure box-shadow via SVG blur
 * (hard-edged Views cannot reproduce CSS blur+spread).
 */
const CreamGlow: React.FC<CreamGlowProps> = ({ width, height, filterId }) => {
  const svgW = width + GLOW_PAD * 2;
  const svgH = height + GLOW_PAD * 2;
  const rectX = GLOW_PAD - GLOW_SPREAD;
  const rectY = GLOW_PAD - GLOW_SPREAD;
  const rectW = width + GLOW_SPREAD * 2;
  const rectH = height + GLOW_SPREAD * 2;

  return (
    <Svg
      pointerEvents="none"
      width={svgW}
      height={svgH}
      style={[styles.glowSvg, { top: -GLOW_PAD, left: -GLOW_PAD }]}
    >
      <Defs>
        <Filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <FeGaussianBlur in="SourceGraphic" stdDeviation={GLOW_BLUR} />
        </Filter>
      </Defs>
      <Rect
        width={rectW}
        height={rectH}
        fill={palette.brownShadow}
        filter={`url(#${filterId})`}
        transform={`translate(${rectX}, ${rectY})`}
      />
    </Svg>
  );
};

/**
 * One web `GurujiSection` cell — CDN size, cream glow, sticky tap zoom
 * (web `.hover01 figure:hover img { scale(1.3) }` — on phones hover sticks).
 */
const GurujiPortrait: React.FC<PortraitProps> = ({
  img,
  label,
  index,
  portraitKey,
  active,
  onToggle,
}) => {
  const filterId = useId().replace(/:/g, "");
  const scale = useSharedValue(active ? SCALE_ACTIVE : 1);
  const width = Math.round((img.width ?? 333) * W_FACTOR);
  const height = Math.round(
    img.height ? img.height * W_FACTOR : width * (img.ratio ?? 1.29),
  );
  const reverse = index % 2 === 0;

  useEffect(() => {
    scale.value = withTiming(active ? SCALE_ACTIVE : 1, {
      duration: SCALE_MS,
      easing: EASE,
    });
  }, [active, scale]);

  const imgAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const clipPath = reverse
    ? `M0 ${CLIP_H * 0.2} L${width} 0 L${width} ${CLIP_H} L0 ${CLIP_H} Z`
    : `M0 0 L${width} ${CLIP_H * 0.3} L${width} ${CLIP_H} L0 ${CLIP_H} Z`;

  return (
    <Pressable
      style={[
        styles.cell,
        { width, height, zIndex: active ? 3 : index === 1 ? 2 : 1 },
      ]}
      onPress={() => onToggle(portraitKey)}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <CreamGlow width={width} height={height} filterId={`glow${filterId}`} />
      <View style={[styles.figure, { width, height }]}>
        <Animated.View style={[styles.imageWrap, imgAnimStyle]}>
          <ExpoImage
            source={{ uri: img.src }}
            style={styles.image}
            contentFit="cover"
            priority={img.key === "boroGuruji" ? "high" : "normal"}
            accessibilityLabel={img.alt}
          />
        </Animated.View>
        <View style={[styles.clipWrap, { width, height: CLIP_H }]}>
          <Svg width={width} height={CLIP_H} style={StyleSheet.absoluteFill}>
            <Path d={clipPath} fill={palette.brownDeepAlpha} />
          </Svg>
          <CustomText freeman customStyle={styles.label}>
            {label}
          </CustomText>
        </View>
      </View>
    </Pressable>
  );
};

/**
 * Web `GurujiSection` — sticky tap zoom like mobile-browser `:hover`.
 */
export const GurujiRow: React.FC<GurujiRowProps> = ({
  primaryImgs,
  labels,
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const onToggle = useCallback((key: string) => {
    setActiveKey((prev) => (prev === key ? null : key));
  }, []);

  const portraits = GURU_ORDER.map((key) => primaryImgs[key]).filter(
    Boolean,
  ) as PrimaryImg[];
  if (portraits.length === 0) return null;

  return (
    <View style={styles.row}>
      {portraits.map((img, i) => {
        const key = (img.key ?? GURU_ORDER[i]) as (typeof GURU_ORDER)[number];
        return (
          <GurujiPortrait
            key={key}
            img={img}
            label={labels[key]}
            index={i}
            portraitKey={key}
            active={activeKey === key}
            onToggle={onToggle}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    overflow: "visible",
    // Keep enough bottom pad for cream glow; trim top under the navbar.
    paddingTop: 4,
    paddingBottom: GLOW_PAD,
  },
  cell: {
    position: "relative",
    overflow: "visible",
  },
  glowSvg: {
    position: "absolute",
    zIndex: 0,
  },
  /** Web `figure` — brown plate; glow is the SVG blur behind. */
  figure: {
    backgroundColor: palette.brownDeep,
    overflow: "hidden",
    zIndex: 1,
  },
  imageWrap: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  /** Web `.clip-div` / `.reverse` angled label bar. */
  clipWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 5,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 13,
    color: palette.whiteAlpha,
    textAlign: "center",
    zIndex: 1,
  },
});
