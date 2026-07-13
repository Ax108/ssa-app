import { siteTitle } from "@constants/cdn";
import type { Config } from "@shared/types/config";

/**
 * Rewrites primary image paths to absolute CDN URLs and stamps album/img keys.
 * Clones input so AsyncStorage / seed JSON are never mutated in place.
 */
export const formatConfig = (configJson: Config): Config => {
  const config = structuredClone(configJson);
  const { CONSTS, gallery, primaryImgs } = config;
  const { albums } = gallery;
  const { gitAssetBase } = CONSTS;

  Object.keys(albums).forEach((key) => {
    albums[key].key = key;
  });

  Object.keys(primaryImgs).forEach((key) => {
    const img = primaryImgs[key];
    img.key = key;
    if (!img.src.startsWith("http")) {
      img.src = gitAssetBase + img.src;
    }
    if (!img.alt.includes(siteTitle)) {
      img.alt = `${img.alt} - ${siteTitle}`;
    }
    if (img.ratio && img.width) {
      img.height = img.width * img.ratio;
    }
  });

  return config;
};
