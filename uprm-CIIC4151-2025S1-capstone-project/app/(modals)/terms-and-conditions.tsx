import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/useAppColors";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsAndConditionsModal() {
  const { colors } = useAppColors();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="headlineMedium" style={styles.title}>
            Terms & Conditions
          </Text>

          <Text variant="bodySmall" style={styles.effectiveDate}>
            Last Updated: December
          </Text>

          <Text variant="bodyMedium" style={styles.introText}>
            Welcome to Community Reports. By accessing or using our services,
            you agree to be bound by these Terms and Conditions.
          </Text>

          {/* Acceptance of Terms */}
          <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              1. Acceptance of Terms
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              By accessing and using Community Reports, you accept and agree to
              be bound by the terms and provision of this agreement.
            </Text>
          </View>

          {/* Use License */}
          <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              2. Use License
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              Permission is granted to temporarily use Community Reports for
              personal, non-commercial transitory viewing only. This is the
              grant of a license, not a transfer of title.
            </Text>
          </View>

          {/* User Responsibilities */}
          <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              3. User Responsibilities
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              <Text style={styles.bold}>Accurate Information:</Text> You agree
              to provide accurate and complete information when submitting
              reports.{"\n\n"}
              <Text style={styles.bold}>Appropriate Content:</Text> Reports must
              not contain offensive, defamatory, or illegal content.{"\n\n"}
              <Text style={styles.bold}>Respectful Use:</Text> You agree to use
              the service in compliance with all applicable laws and
              regulations.
            </Text>
          </View>

          {/* Privacy */}
          <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              4. Privacy Policy
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              Your privacy is important to us. Our Privacy Policy explains how
              we collect, use, and protect your personal information. By using
              our services, you agree to the collection and use of information
              in accordance with our Privacy Policy.
            </Text>
          </View>

          {/* Termination */}
          <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              5. Termination
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              We may terminate or suspend your account and bar access to the
              Service immediately, without prior notice or liability, under our
              sole discretion, for any reason whatsoever, including but not
              limited to a breach of the Terms.
            </Text>
          </View>

          {/* Limitation of Liability */}
          <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              6. Limitation of Liability
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              In no event shall Community Reports, nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses.
            </Text>
          </View>

          {/* Changes to Terms */}
          <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              7. Changes to Terms
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. By continuing to access or use our
              Service after those revisions become effective, you agree to be
              bound by the revised terms.
            </Text>
          </View>

          {/* Acknowledgment Box */}
          <View style={styles.acknowledgmentBox}>
            <Text variant="bodyMedium" style={styles.acknowledgmentText}>
              <Text style={styles.bold}>Acknowledgment:</Text> By using
              Community Reports, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and Conditions.
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.fullTermsText}>
            This is a summary of our full Terms and Conditions. For complete
            details, please review the full document.
          </Text>
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
      paddingBottom: 20,
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
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    sectionTitle: {
      marginBottom: 12,
      fontWeight: "600",
    },
    sectionText: {
      lineHeight: 20,
      color: colors.text,
    },
    bold: {
      fontWeight: "600",
      color: colors.text,
    },
    acknowledgmentBox: {
      backgroundColor: colors.successContainer,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.success,
    },
    acknowledgmentText: {
      lineHeight: 20,
      color: colors.onSuccessContainer,
      textAlign: "center",
    },
    fullTermsText: {
      textAlign: "center",
      color: colors.textMuted,
      fontStyle: "italic",
      marginBottom: 16,
    },
  });
