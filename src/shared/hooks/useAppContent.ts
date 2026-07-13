import { useShallow } from "zustand/react/shallow";
import { appStore } from "@store/appStore";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";

/**
 * CDN content from Zustand. Returns `null` until `contentController` has applied
 * config + texts (splash normally prevents this, but screens stay defensive).
 */
export const useAppContent = (): { config: Config; texts: Texts } | null => {
  const { config, texts } = appStore(
    useShallow((s) => ({ config: s.config, texts: s.texts })),
  );
  if (!config || !texts) {
    return null;
  }
  return { config, texts };
};
