import { Linking } from "react-native";
import { logger } from "@shared/utils/logger";

/** Open https / tel / mailto (and other) URLs via the system handler. */
export const openExternalUrl = async (url: string): Promise<void> => {
  const trimmed = url.trim();
  if (!trimmed) {
    logger.warn("[Linking] skipped empty url");
    return;
  }
  try {
    await Linking.openURL(trimmed);
  } catch (err) {
    logger.warn("[Linking] failed to open", trimmed, err);
  }
};
