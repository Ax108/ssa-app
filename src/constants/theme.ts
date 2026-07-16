import { palette } from "./palette";

/**
 * Semantic theme mapped from web CSS variables in `index.css`.
 * Use these in StyleSheets instead of raw hex when possible.
 *
 * @example
 * StyleSheet.create({
 *   bar: { backgroundColor: theme.topNav.background, color: theme.text.default },
 * })
 */
export const theme = {
  bg: {
    light: palette.default100, // --bg-light
    default: palette.default200, // --bg
    dark: palette.default300, // --bg-dark
  },
  text: {
    light: palette.default100, // --text-light
    default: palette.default300, // --text
    mid: palette.default250, // --text-mid
    dark: palette.default200, // --text-dark
  },
  accent: {
    orange: palette.orange500, // --footer-header / --orange-500
    icon: palette.iconMuted,
  },
  topNav: {
    background: palette.default100,
    foreground: palette.default300,
    logoWrap: palette.logoWrap,
    logoBody: palette.logoBrown,
    /** Approximate MUI AppBar `elevation={4}` */
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 } as const,
    elevation: 4,
  },
  splash: {
    background: palette.default200,
    foreground: palette.creamSoft,
  },
  footer: {
    background: palette.footerBg,
    text: palette.default250,
    heading: palette.orange500,
    bar: palette.footerBar,
    muted: palette.footerMuted,
  },
  /** Bottom tabs */
  tabBar: {
    background: palette.tabBarBg,
    border: palette.brownBorder,
    active: palette.gold,
    inactive: palette.tabBarTextMid,
    activeBg: "rgba(212, 160, 23, 0.12)",
  },
} as const;

export type Theme = typeof theme;
