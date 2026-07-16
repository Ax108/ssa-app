import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { CustomText } from "@shared/components/CustomText";
import { LOCALE_LABELS, LOCALES, type Locale } from "@constants/cdn";
import { contentController } from "@store/contentController";
import { appStore } from "@store/appStore";
import { useShallow } from "zustand/react/shallow";
import { palette, theme } from "@constants";
import { Ionicons } from "@expo/vector-icons";

/**
 * Compact locale picker for the top navbar (en / bn / hi).
 * Persists via contentController.setLocale + AsyncStorage.
 */
export const LanguageSwitcher: React.FC = () => {
  const locale = appStore(useShallow((s) => s.locale));
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSelect = async (next: Locale) => {
    if (next === locale || busy) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      await contentController.setLocale(next);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Language: ${LOCALE_LABELS[locale]}`}
        hitSlop={8}
        style={styles.trigger}
      >
        <Ionicons
          name="language-outline"
          size={22}
          color={theme.topNav.foreground}
        />
        <CustomText medium customStyle={styles.triggerLabel}>
          {locale.toUpperCase()}
        </CustomText>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <CustomText freeman customStyle={styles.sheetTitle}>
              Language
            </CustomText>
            {LOCALES.map((code) => {
              const active = code === locale;
              return (
                <Pressable
                  key={code}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => void onSelect(code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={LOCALE_LABELS[code]}
                >
                  <CustomText
                    medium={active}
                    customStyle={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
                  >
                    {LOCALE_LABELS[code]}
                  </CustomText>
                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={theme.tabBar.active}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  triggerLabel: {
    fontSize: 11,
    color: theme.topNav.foreground,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 72,
    paddingRight: 12,
  },
  sheet: {
    minWidth: 180,
    backgroundColor: palette.default100,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: palette.default200,
  },
  sheetTitle: {
    fontSize: 14,
    color: palette.default300,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  optionActive: {
    backgroundColor: theme.tabBar.activeBg,
  },
  optionText: {
    fontSize: 15,
    color: palette.default300,
  },
  optionTextActive: {
    color: theme.tabBar.active,
  },
});
