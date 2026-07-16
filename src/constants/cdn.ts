/** CDN / gist constants — mirrored from sadhan-sangha web `constants.ts`. */

export const siteTitle = "Sadhan Sangha Ashram";
/** Canonical public site (privacy, etc.) */
export const siteUrl = "https://sadhansangha.in";
export const HTTPS = "https://";
export const gitBase = `${HTTPS}astrarudra.github.io/ssa-static/prod/`;
export const gitAssetBase = `${gitBase}assets/`;

export type Locale = "en" | "bn" | "hi";

export const LOCALES: Locale[] = ["en", "bn", "hi"];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
  hi: "हिन्दी",
};

export const LOCALSTORE = {
  config: "ssaConfig",
  locale: "ssaLocale",
  en: "ssaEn",
  bn: "ssaBn",
  hi: "ssaHi",
} as const;

const gitDomain = "githubusercontent.com/";
export const gistBase = `${HTTPS}gist.${gitDomain}astrarudra/`;

export const GIST = {
  version: "589c7ae622999f36a24892f17f677b31",
} as const;

export const GIT = {
  config: "json/config.json",
  texts: {
    en: "json/en.json",
    bn: "json/bn.json",
    hi: "json/hi.json",
  } as Record<Locale, string>,
  /** @deprecated use GIT.texts.en */
  english: "json/en.json",
  privacy: "json/privacy.json",
} as const;

export const textsStoreKey = (locale: Locale): string => LOCALSTORE[locale];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && LOCALES.includes(value as Locale);
