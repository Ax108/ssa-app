import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@shared/utils/logger";

/**
 * Bulk load JSON values from AsyncStorage (Expo SDK 57 / async-storage v2 API).
 * Returns {} if the native module is missing (e.g. before a rebuild).
 */
export const loadStateBulk = async (
  keys: string[],
): Promise<Record<string, unknown>> => {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const out: Record<string, unknown> = {};
    for (const [key, value] of pairs) {
      if (value == null) continue;
      try {
        out[key] = JSON.parse(value) as unknown;
      } catch {
        logger.warn("[storage] Failed to parse key:", key);
      }
    }
    return out;
  } catch (err) {
    logger.warn("[storage] loadStateBulk unavailable:", err);
    return {};
  }
};

export const saveStateBulk = async (
  data: Record<string, unknown>,
): Promise<void> => {
  try {
    const pairs: [string, string][] = Object.entries(data).map(([k, v]) => [
      k,
      JSON.stringify(v),
    ]);
    await AsyncStorage.multiSet(pairs);
  } catch (err) {
    logger.warn("[storage] saveStateBulk unavailable:", err);
  }
};

export const loadState = async <T = unknown>(
  key: string,
): Promise<T | undefined> => {
  const bulk = await loadStateBulk([key]);
  return bulk[key] as T | undefined;
};

export const saveState = async (key: string, value: unknown): Promise<void> => {
  await saveStateBulk({ [key]: value });
};
