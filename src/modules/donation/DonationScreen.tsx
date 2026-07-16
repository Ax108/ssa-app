import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@shared/components/CustomText";
import { ExpoImage } from "@shared/components/ExpoImage";
import { ScreenScroll } from "@shared/components/ScreenScroll";
import { SSADivider } from "@shared/components/SSADivider";
import { useAppContent } from "@shared/hooks/useAppContent";
import { paragraphsFromMarkdown } from "@shared/utils/assetUrl";
import { palette, theme } from "@constants";
import type { DonationDetails, Headers } from "@shared/types";

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  copiedLabel: string;
};

const DonationRow = ({ icon, label, value, color, copiedLabel }: RowProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={28} color={color} style={styles.rowIcon} />
      <View style={styles.rowBody}>
        <CustomText customStyle={styles.rowLabel}>{label}</CustomText>
        <CustomText customStyle={styles.rowValue}>{value}</CustomText>
        {copied ? (
          <CustomText customStyle={styles.copied}>{copiedLabel}</CustomText>
        ) : null}
      </View>
      <Pressable
        onPress={() => void handleCopy()}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={8}
        style={styles.copyBtn}
      >
        <Ionicons
          name={copied ? "checkmark" : "copy-outline"}
          size={20}
          color={copied ? "#2e7d32" : color}
        />
      </Pressable>
    </View>
  );
};

const DonationRows = ({
  headers,
  donationDetails,
}: {
  headers: Headers;
  donationDetails: DonationDetails;
}) => {
  const { accountName, accountNumber, ifsc, swift, bankBranch } =
    donationDetails;
  const copiedLabel = headers.copied;
  return (
    <View style={styles.rows}>
      <DonationRow
        icon="person-outline"
        label={headers.donateAccName}
        value={accountName}
        color="#5c6bc0"
        copiedLabel={copiedLabel}
      />
      <DonationRow
        icon="card-outline"
        label={headers.donateAccNo}
        value={accountNumber}
        color="#2e7d32"
        copiedLabel={copiedLabel}
      />
      <DonationRow
        icon="business-outline"
        label={headers.donateIfsc}
        value={ifsc}
        color="#c17817"
        copiedLabel={copiedLabel}
      />
      <DonationRow
        icon="globe-outline"
        label={headers.donateSwift}
        value={swift}
        color="#0288d1"
        copiedLabel={copiedLabel}
      />
      <DonationRow
        icon="location-outline"
        label={headers.donateBank}
        value={bankBranch}
        color="#d32f2f"
        copiedLabel={copiedLabel}
      />
    </View>
  );
};

/** In-app bank-transfer details (web Donation page parity). */
export const DonationScreen: React.FC = () => {
  const content = useAppContent();

  if (!content) {
    return <View style={styles.fallback} />;
  }

  const { config, texts } = content;
  const { headers, donationNote } = texts;
  const { donationDetails, primaryImgs } = config;
  const noteParagraphs = paragraphsFromMarkdown(donationNote);
  const shiva = primaryImgs.shiva;

  return (
    <ScreenScroll>
      <CustomText freeman customStyle={styles.title}>
        {headers.donate}
      </CustomText>
      <View style={styles.card}>
        <SSADivider color={palette.default200} />
        <View style={styles.noteBlock}>
          {noteParagraphs.map((p, i) => (
            <CustomText key={`note-${i}`} customStyle={styles.note}>
              {p}
            </CustomText>
          ))}
        </View>
        <DonationRows headers={headers} donationDetails={donationDetails} />
        <SSADivider color={palette.default200} />
        {shiva?.src ? (
          <ExpoImage
            source={{ uri: shiva.src }}
            style={styles.shiva}
            contentFit="contain"
          />
        ) : null}
      </View>
    </ScreenScroll>
  );
};

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: theme.bg.default,
  },
  title: {
    fontSize: 28,
    color: palette.default300,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: palette.default100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noteBlock: {
    gap: 10,
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.default300,
  },
  rows: {
    gap: 4,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    gap: 10,
  },
  rowIcon: {
    marginTop: 2,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 12,
    opacity: 0.7,
    color: palette.default300,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    color: palette.default300,
  },
  copied: {
    fontSize: 11,
    color: "#2e7d32",
    marginTop: 4,
  },
  copyBtn: {
    padding: 4,
  },
  shiva: {
    width: "45%",
    aspectRatio: 1,
    alignSelf: "center",
    marginTop: 8,
  },
});
