import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/useAppColors";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * A modal that displays the app's privacy policy.
 *
 * It provides a brief summary of the key aspects of the privacy policy
 * and links to the full policy on the app's website.
 *
 * The full policy covers information collection, data usage, and
 * protection practices.
 */
export default function PrivacyPolicyModal() {
  const { colors } = useAppColors();

  const handleViewFullPolicy = () => {
    Linking.openURL(
      "https://github.com/uprm-CIIC4151-2025S1-capstone-project/uprm-CIIC4151-2025S1-capstone-project"
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text variant="headlineMedium" style={styles.title}>
            Privacy Policy
          </Text>

          <Text variant="bodySmall" style={styles.effectiveDate}>
            Last Updated: December
          </Text>

          <Text variant="bodyMedium" style={styles.introText}>
            At Community Reports, we take your privacy seriously. This policy
            explains how we collect, use, and protect your personal information.
          </Text>

          {/* Privacy policy sections*/}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              1. Information We Collect
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              • <Text style={styles.bold}>Account Information:</Text> Email
              address, user preferences, and profile data{"\n"}•{" "}
              <Text style={styles.bold}>Report Data:</Text> Issue descriptions,
              photos, locations, and timestamps{"\n"}•{" "}
              <Text style={styles.bold}>Device Information:</Text> App usage
              statistics, device type, and operating system{"\n"}•{" "}
              <Text style={styles.bold}>Location Data:</Text> Only when you
              submit reports or use location-based features
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.noticeBox}>
            <Text variant="bodySmall" style={styles.noticeText}>
              <Text style={styles.bold}>Privacy Commitment:</Text> We are
              committed to protecting your privacy and being transparent about
              our data practices. This summary covers key aspects of our privacy
              policy.
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.fullPolicyText}>
            For the complete privacy policy with detailed explanations, please
            visit our website.
          </Text>

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleViewFullPolicy}
              style={styles.actionButton}
              icon="web"
              textColor={colors.primary}
            >
              View Full Policy
            </Button>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
      gap: 20,
    },
    title: {
      textAlign: "center",
      marginBottom: 4,
      fontWeight: "bold",
      color: colors.text,
    },
    effectiveDate: {
      textAlign: "center",
      color: colors.textMuted,
      marginBottom: 16,
      fontStyle: "italic",
    },
    introText: {
      textAlign: "center",
      lineHeight: 22,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    section: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    sectionTitle: {
      marginBottom: 12,
      fontWeight: "600",
      color: colors.primary,
    },
    sectionText: {
      lineHeight: 20,
      color: colors.text,
    },
    bold: {
      fontWeight: "600",
    },
    divider: {
      marginVertical: 8,
      backgroundColor: colors.divider,
    },
    noticeBox: {
      backgroundColor: colors.infoContainer,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.info,
    },
    noticeText: {
      lineHeight: 18,
      color: colors.onInfoContainer,
      textAlign: "center",
    },
    fullPolicyText: {
      textAlign: "center",
      color: colors.textMuted,
      fontStyle: "italic",
      marginBottom: 16,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    actionButton: {
      flex: 1,
      borderColor: colors.primary,
    },
  });
