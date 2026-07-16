import {
  DEFAULT_LOCALE,
  GIST,
  GIT,
  LOCALSTORE,
  isLocale,
  textsStoreKey,
  type Locale,
} from "@constants/cdn";
import { oxyApi } from "@shared/serviceCalls/oxyApi";
import {
  loadState,
  loadStateBulk,
  saveState,
  saveStateBulk,
} from "@shared/helpers/asyncStorage";
import { formatConfig } from "@shared/utils/formatConfig";
import { logger } from "@shared/utils/logger";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";
import type { VersionResponse } from "@shared/types/api";
import { appStore } from "./appStore";
import seedConfig from "../assets/json/config.json";
import seedEn from "../assets/json/en.json";
import seedBn from "../assets/json/bn.json";
import seedHi from "../assets/json/hi.json";

const seedTexts: Record<Locale, Texts> = {
  en: seedEn as Texts,
  bn: seedBn as Texts,
  hi: seedHi as Texts,
};

const normalizeVersion = (version: number | string): number | string => {
  if (typeof version === "number") return version;
  const asNum = Number(version);
  return Number.isFinite(asNum) ? asNum : version;
};

const versionsEqual = (a: number | string | null, b: number | string) =>
  a != null && String(a) === String(b);

const resolveStoredLocale = async (): Promise<Locale> => {
  const saved = await loadState<string>(LOCALSTORE.locale);
  return isLocale(saved) ? saved : DEFAULT_LOCALE;
};

const applyContent = (
  rawConfig: Config,
  texts: Texts,
  version: number | string,
  locale: Locale,
) => {
  appStore.getState().setContent({
    config: formatConfig(rawConfig),
    texts,
    version: normalizeVersion(version),
    locale,
  });
};

const hydrateFromSeed = (locale: Locale = DEFAULT_LOCALE) => {
  const config = structuredClone(seedConfig) as Config;
  const texts = structuredClone(seedTexts[locale] ?? seedTexts.en);
  const version = normalizeVersion(config.version) || 0;
  applyContent(config, texts, version, locale);
  logger.warn("[APPLOAD] Using bundled seed JSON");
};

export const contentController = {
  init: async () => {
    try {
      const locale = await resolveStoredLocale();
      const textsKey = textsStoreKey(locale);
      const LS = await loadStateBulk([LOCALSTORE.config, textsKey]);
      const config = LS[LOCALSTORE.config] as Config | undefined;
      const lang = LS[textsKey] as Texts | undefined;

      if (!config || !lang) {
        await contentController.loadVersion(locale);
        return { status: "Local Storage Empty, loadVersion Triggered" };
      }

      applyContent(config, lang, config.version, locale);
      await contentController.syncVersion();
      return { status: "Loaded from Local Storage" };
    } catch (err) {
      logger.error("[APPLOAD] init failed", err);
      hydrateFromSeed(DEFAULT_LOCALE);
      return { status: "Init failed, seeded" };
    }
  },

  loadVersion: async (localeArg?: Locale) => {
    const locale = localeArg ?? (await resolveStoredLocale());
    const textsKey = textsStoreKey(locale);
    try {
      const { version } = await oxyApi.getGist<VersionResponse>(GIST.version);
      logger.log("[APPLOAD] Loading Version - ", version);
      const [config, lang] = await Promise.all([
        oxyApi.getGit<Config>(GIT.config),
        oxyApi.getGit<Texts>(GIT.texts[locale]),
      ]);
      const normalized = normalizeVersion(version);
      config.version =
        typeof normalized === "number"
          ? normalized
          : Number(normalized) || config.version;
      await saveStateBulk({
        [LOCALSTORE.config]: config,
        [textsKey]: lang,
        [LOCALSTORE.locale]: locale,
      });
      applyContent(config, lang, normalized, locale);
      return { status: "Loaded Version", version: normalized };
    } catch (err) {
      logger.error("[APPLOAD] loadVersion failed", err);
      const LS = await loadStateBulk([LOCALSTORE.config, textsKey]);
      const config = LS[LOCALSTORE.config] as Config | undefined;
      const lang = LS[textsKey] as Texts | undefined;
      if (config && lang) {
        applyContent(config, lang, config.version, locale);
        return { status: "CDN failed, used cache" };
      }
      hydrateFromSeed(locale);
      return { status: "CDN failed, seeded" };
    }
  },

  syncVersion: async () => {
    try {
      const { version: currVersion } = appStore.getState();
      const { version } = await oxyApi.getGist<VersionResponse>(
        GIST.version,
        true,
      );
      if (!versionsEqual(currVersion, version)) {
        logger.log("[SYNC] Updating App Version: ", currVersion, "->", version);
        await contentController.loadVersion();
        return {
          status: "Updating Version",
          version: normalizeVersion(version),
        };
      }
      logger.debug("[SYNC] App Version: ", currVersion, " No Updates Required");
      return { status: "Version Synced", version: normalizeVersion(version) };
    } catch (err) {
      logger.warn("[SYNC] syncVersion failed", err);
      return { status: "Sync failed" };
    }
  },

  setLocale: async (locale: Locale) => {
    if (!isLocale(locale)) {
      return { status: "Invalid locale" };
    }
    const textsKey = textsStoreKey(locale);
    try {
      await saveState(LOCALSTORE.locale, locale);
      const cached = await loadState<Texts>(textsKey);
      let lang = cached;
      if (!lang) {
        logger.log("[LOCALE] Fetching texts for", locale);
        lang = await oxyApi.getGit<Texts>(GIT.texts[locale]);
        await saveState(textsKey, lang);
      }
      const { config, version } = appStore.getState();
      if (config && version != null) {
        applyContent(config, lang, version, locale);
      } else {
        appStore.getState().setLocaleState(locale);
        appStore.getState().setContent({
          config: formatConfig(structuredClone(seedConfig) as Config),
          texts: lang,
          version: normalizeVersion((seedConfig as Config).version),
          locale,
        });
      }
      logger.debug("[LOCALE] Switched to", locale);
      return { status: "Locale set", locale };
    } catch (err) {
      logger.error("[LOCALE] setLocale failed", err);
      const seed = structuredClone(seedTexts[locale] ?? seedTexts.en);
      const { config, version } = appStore.getState();
      if (config && version != null) {
        applyContent(config, seed, version, locale);
        return { status: "Locale set from seed", locale };
      }
      hydrateFromSeed(locale);
      return { status: "Locale failed, seeded", locale };
    }
  },
};
