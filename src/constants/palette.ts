/**
 * Raw Sadhan Sangha color tokens — mirrored from web `index.css` `:root`
 * and common hard-coded accents used across the site.
 *
 * Plain string values so they can be used directly in RN `StyleSheet.create`.
 */
export const palette = {
  /** Cream — header / light surfaces (`--default-100`) */
  default100: "#fff1e4",
  /** Warm taupe — page / splash bg (`--default-200`) */
  default200: "#bda894",
  /** Muted taupe — mid text (`--default-250`) */
  default250: "#b5a08d",
  /** Deep brown — primary text (`--default-300`) */
  default300: "#464038",
  /** Accent orange — footer headers (`--orange-500`) */
  orange500: "#c96a14",

  /** Loader / splash foreground (InitLoader, BubbleLoader) */
  creamSoft: "#f3d9c3",
  /** Nav menu icon accent (Header startIcon) */
  iconMuted: "#bea894",
  /** Logo circle wrap (`.logo-wrap`) */
  logoWrap: "#ffffffd1",
  /** Web `.variant-brown svg #ssa-body` fill */
  logoBrown: "#796b5d",

  /** Extra surfaces from App.css */
  brownDeep: "#50453b",
  brownDeepAlpha: "#50453ba8",
  brownBorder: "#2f2822",
  brownShadow: "#fbe0ca",
  /** App footer background — warmer/darker than web `--bg-dark` */
  footerBg: "#2a1f16",
  footerBar: "#2a2620",
  footerMuted: "#898989",
  /** Bottom tab bar background */
  tabBarBg: "#3a2e24",
  /** Gold accent — active tab */
  gold: "#d4a017",
  goldLight: "#f9bc23",
  /** Mid text on dark chrome */
  tabBarTextMid: "#6b5a48",
  white: "#ffffff",
  whiteAlpha: "#ffffffe8",
  blackSoft: "#282828",
  graySoft: "#3a3a3a",
} as const;

export type PaletteColor = (typeof palette)[keyof typeof palette];
