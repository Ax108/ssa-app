import { CustomText } from "@shared/components/CustomText";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BubbleLoader } from "./BubbleLoader";

export const CustomSplashScreen = () => {
  const { bottom } = useSafeAreaInsets();
  const styles = createStyles(bottom);
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        contentFit="contain"
        source={require("@/assets/logo2.png")}
      />

      <CustomText customStyle={styles.logoText} bold freeman>
        Sadhan Sangha Ashram
      </CustomText>

      <BubbleLoader />

      <CustomText customStyle={styles.devText} semiBold freeman>
        From AstraX
      </CustomText>
    </View>
  );
};
const createStyles = (bottom: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#bda894",
      position: "relative",
    },
    image: {
      width: 150,
      height: 150,
      color: "rgb(243, 217, 195)",
      filter: "brightness(1.1)",
    },
    logoText: {
      fontSize: 24,
      color: "rgb(243, 217, 195)",
      marginTop: 12,
      textAlign: "center",
      filter: "brightness(1.1)",
    },
    devText: {
      position: "absolute",
      bottom: 20,
      marginBottom: bottom + 20, // Adjust for safe area
      fontSize: 18,
      color: "rgb(243, 217, 195)",
      marginTop: 8,
      textAlign: "center",
      filter: "brightness(1.01)",
    },
  });
