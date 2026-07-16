import { useShallow } from "zustand/react/shallow";
import { appStore } from "@store/appStore";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";
import type { Locale } from "@constants/cdn";

/**
 * CDN content from Zustand. Returns `null` until `contentController` has applied
 * config + texts (splash normally prevents this, but screens stay defensive).
 */
export const useAppContent = (): {
  config: Config;
  texts: Texts;
  locale: Locale;
} | null => {
  const { config, texts, locale } = appStore(
    useShallow((s) => ({
      config: s.config,
      texts: s.texts,
      locale: s.locale,
    })),
  );
  if (!config || !texts) {
    return null;
  }
  return { config, texts, locale };
};
