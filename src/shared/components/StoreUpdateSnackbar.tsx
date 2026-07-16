import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useShallow } from "zustand/react/shallow";
import { theme } from "@constants";
import { appStore } from "@store/appStore";
import { CustomText } from "@shared/components/CustomText";
import { evaluateStoreUpdatePrompt } from "@shared/ota/storeUpdateController";
import { getStoreListingUrl } from "@shared/ota/storeVersion";
import { openExternalUrl } from "@shared/utils/openUrl";

const TAB_BAR_CLEARANCE = 64;

/**
 * Global store-update snackbar — rendered above the nav stack after splash.
 * Session dismiss only; reappears on next cold start if still on an old binary.
 */
export const StoreUpdateSnackbar = () => {
  const insets = useSafeAreaInsets();
  const { visible, config, texts, dismissStoreUpdate, latestStoreVersion } =
    appStore(
      useShallow((s) => ({
        visible: s.storeUpdateVisible,
        config: s.config,
        texts: s.texts,
        dismissStoreUpdate: s.dismissStoreUpdate,
        latestStoreVersion: s.config?.storeApp?.latestVersion ?? null,
      })),
    );

  useEffect(() => {
    evaluateStoreUpdatePrompt();
  }, [latestStoreVersion]);

  if (!visible || !config?.storeApp) {
    return null;
  }

  const storeUrl = getStoreListingUrl(config.storeApp);
  if (!storeUrl) {
    return null;
  }

  const message =
    texts?.headers.storeUpdateMessage?.trim() ||
    "A new version of the app is available on the store.";
  const action = texts?.headers.storeUpdateAction?.trim() || "Update";

  const bottom = Math.max(insets.bottom, 8) + TAB_BAR_CLEARANCE;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.bar} accessibilityRole="alert">
        <CustomText medium customStyle={styles.message} numberOfLines={3}>
          {message}
        </CustomText>
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              void openExternalUrl(storeUrl);
              dismissStoreUpdate();
            }}
            style={({ pressed }) => [
              styles.updateBtn,
              pressed && styles.updateBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={action}
          >
            <CustomText bold customStyle={styles.updateLabel}>
              {action}
            </CustomText>
          </Pressable>
          <Pressable
            onPress={dismissStoreUpdate}
            hitSlop={10}
            style={styles.dismissBtn}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          >
            <Ionicons name="close" size={20} color={theme.footer.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 1000,
    elevation: 12,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.footer.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.tabBar.border,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  message: {
    flex: 1,
    color: theme.footer.text,
    fontSize: 14,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  updateBtn: {
    backgroundColor: theme.tabBar.active,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateBtnPressed: {
    opacity: 0.85,
  },
  updateLabel: {
    color: theme.bg.light,
    fontSize: 13,
  },
  dismissBtn: {
    padding: 6,
  },
});
