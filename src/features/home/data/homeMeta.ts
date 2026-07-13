import { theme, palette } from "@constants";

/** Sample-inspired gradient plates keyed by primaryImgs keys. */
export const GURU_CARD_META: Record<
  string,
  { gradient: [string, string]; longName: string }
> = {
  guruji: {
    gradient: ["rgba(252,192,156,1)", "rgba(200,57,61,1)"],
    longName: "Shri Achyut Chetan Maharaj",
  },
  boroGuruji: {
    gradient: ["#ffe8e8", "#af2a84"],
    longName: "Yogi 108 Swami Sachchidananda Saraswati",
  },
  mataji: {
    gradient: ["#d5562e", "#ffb5c2"],
    longName: "Revered Mataji",
  },
};

export const GURU_ORDER = ["guruji", "boroGuruji", "mataji"] as const;

export const HOME_SURFACE = {
  cream: palette.default100,
  white: palette.white,
  textLight: "#f5ebe0",
  textMutedOnDark: "rgba(245,235,224,0.75)",
  accent: theme.accent.orange,
  gold: theme.tabBar.active,
  primary: palette.brownDeep,
  primaryLight: "#7a6a5e",
  bgDark: theme.tabBar.background,
  footerBg: theme.footer.background,
} as const;
