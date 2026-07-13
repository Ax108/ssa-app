/** CDN / gist constants — mirrored from sadhan-sangha web `constants.ts`. */

export const siteTitle = "Sadhan Sangha Ashram";
/** Canonical public site (privacy, etc.) */
export const siteUrl = "https://sadhansangha.in";
export const HTTPS = "https://";
export const gitBase = `${HTTPS}astrarudra.github.io/ssa-static/prod/`;
export const gitAssetBase = `${gitBase}assets/`;

export const LOCALSTORE = {
  config: "ssaConfig",
  en: "ssaEn",
} as const;

const gitDomain = "githubusercontent.com/";
export const gistBase = `${HTTPS}gist.${gitDomain}astrarudra/`;

export const GIST = {
  version: "589c7ae622999f36a24892f17f677b31",
} as const;

export const GIT = {
  config: "json/config.json",
  english: "json/en.json",
  privacy: "json/privacy.json",
} as const;
