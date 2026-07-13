import { GIST, GIT, LOCALSTORE } from "@constants/cdn";
import { oxyApi } from "@shared/serviceCalls/oxyApi";
import { loadStateBulk, saveStateBulk } from "@shared/helpers/asyncStorage";
import { formatConfig } from "@shared/utils/formatConfig";
import { logger } from "@shared/utils/logger";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";
import type { VersionResponse } from "@shared/types/api";
import { appStore } from "./appStore";
import seedConfig from "../assets/json/config.json";
import seedEn from "../assets/json/en.json";

const applyContent = (rawConfig: Config, texts: Texts, version: number) => {
  appStore.getState().setContent({
    config: formatConfig(rawConfig),
    texts,
    version,
  });
};

const hydrateFromSeed = () => {
  const config = structuredClone(seedConfig) as Config;
  const texts = structuredClone(seedEn) as Texts;
  const version = Number(config.version) || 0;
  applyContent(config, texts, version);
  logger.warn("[APPLOAD] Using bundled seed JSON");
};

export const contentController = {
  init: async () => {
    try {
      const LS = await loadStateBulk([LOCALSTORE.config, LOCALSTORE.en]);
      const config = LS[LOCALSTORE.config] as Config | undefined;
      const lang = LS[LOCALSTORE.en] as Texts | undefined;

      if (!config || !lang) {
        await contentController.loadVersion();
        return { status: "Local Storage Empty, loadVersion Triggered" };
      }

      applyContent(config, lang, config.version);
      // Await sync so splash stays up through version check / CDN refresh.
      await contentController.syncVersion();
      return { status: "Loaded from Local Storage" };
    } catch (err) {
      logger.error("[APPLOAD] init failed", err);
      hydrateFromSeed();
      return { status: "Init failed, seeded" };
    }
  },

  loadVersion: async () => {
    try {
      const { version } = await oxyApi.getGist<VersionResponse>(GIST.version);
      logger.log("[APPLOAD] Loading Version - ", version);
      const [config, lang] = await Promise.all([
        oxyApi.getGit<Config>(GIT.config),
        oxyApi.getGit<Texts>(GIT.english),
      ]);
      config.version = version;
      await saveStateBulk({
        [LOCALSTORE.config]: config,
        [LOCALSTORE.en]: lang,
      });
      applyContent(config, lang, version);
      return { status: "Loaded Version", version };
    } catch (err) {
      logger.error("[APPLOAD] loadVersion failed", err);
      const LS = await loadStateBulk([LOCALSTORE.config, LOCALSTORE.en]);
      const config = LS[LOCALSTORE.config] as Config | undefined;
      const lang = LS[LOCALSTORE.en] as Texts | undefined;
      if (config && lang) {
        applyContent(config, lang, config.version);
        return { status: "CDN failed, used cache" };
      }
      hydrateFromSeed();
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
      if (version !== currVersion) {
        logger.log("[SYNC] Updating App Version: ", currVersion, "->", version);
        await contentController.loadVersion();
        return { status: "Updating Version", version };
      }
      logger.log("[SYNC] App Version: ", currVersion, " No Updates Required");
      return { status: "Version Synced", version };
    } catch (err) {
      logger.warn("[SYNC] syncVersion failed", err);
      return { status: "Sync failed" };
    }
  },
};
