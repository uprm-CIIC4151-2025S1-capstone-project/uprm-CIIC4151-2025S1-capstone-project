// TODO Code cleanup
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, ScrollView, Linking, Alert } from "react-native";
import { Button, Text, Card, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStoredCredentials } from "@/utils/auth";
import { useAppColors } from "@/hooks/useAppColors";

export default function ContactSupportModal() {
  // const router = useRouter();
  const { colors } = useAppColors();

  const handleEmailPress = async () => {
    try {
      const credentials = await getStoredCredentials();
      const userEmail = credentials?.email || "User";

      const subject = encodeURIComponent(
        "Support Request - Community Reporting App"
      );
      const body = encodeURIComponent(
        `Hello Support Team,\n\nI need assistance with:\n\n\n\nUser Information:\n- Email: ${userEmail}\n- App Version: 1.0.0\n\nThank you!`
      );

      const mailtoUrl = `mailto:reporteciudadano.uprm@gmail.com?subject=${subject}&body=${body}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert("Error", "Unable to open email client");
      }
    } catch (error) {
      console.error("Error opening email:", error);
      Alert.alert("Error", "Failed to open email client");
    }
  };

  const handleCallPress = () => {
    Alert.alert(
      "Contact Support",
      "Call our support team at 911?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Call",
          onPress: () => Linking.openURL("tel:911"),
        },
      ]
    );
  };

  const handleWebsitePress = () => {
    Linking.openURL("https://github.com/uprm-CIIC4151-2025S1-capstone-project/uprm-CIIC4151-2025S1-capstone-project");
  };

  const handleFAQPress = () => {
    Alert.alert(
      "FAQ & Help Center",
      "Our comprehensive help center is available on our website.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Visit Website",
          onPress: () =>
            Linking.openURL("https://github.com/uprm-CIIC4151-2025S1-capstone-project/uprm-CIIC4151-2025S1-capstone-project"),
        },
      ]
    );
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      "Emergency Contact",
      "For urgent matters requiring immediate attention, please contact local authorities directly.\n\nThis support channel is for app-related issues only.",
      [
        {
          text: "I Understand",
          style: "default",
        },
        {
          text: "Call Emergency",
          style: "destructive",
          onPress: () => Linking.openURL("tel:911"),
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text variant="headlineMedium" style={styles.title}>
            Contact Support
          </Text>

          {/* <Text variant="bodyMedium" style={styles.subtitle}>
            We&apos;re here to help! Choose the best way to get in touch with
            our support team.
          </Text> */}

          <Card style={styles.contactCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Email Support
              </Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                Send us a detailed description of your issue. We typically
                respond within 24 hours.
              </Text>
              <Button
                mode="contained"
                onPress={handleEmailPress}
                style={styles.actionButton}
                icon="email"
                buttonColor={colors.button.primary}
                textColor={colors.button.text}
              >
                Send Email
              </Button>
            </Card.Content>
          </Card>

          {/* <Card style={styles.contactCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Phone Support
              </Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                Available Monday-Friday, 9AM-5PM EST for immediate assistance.
              </Text>
              <Button
                mode="outlined"
                onPress={handleCallPress}
                style={styles.actionButton}
                icon="phone"
                textColor={colors.text}
              >
                Call +1 (555) 123-4567
              </Button>
            </Card.Content>
          </Card> */}

          {/* <Card style={styles.contactCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                FAQ & Help Center
              </Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                Find answers to common questions and troubleshooting guides.
              </Text>
              <Button
                mode="outlined"
                onPress={handleFAQPress}
                style={styles.actionButton}
                icon="help-circle"
                textColor={colors.text}
              >

                Browse Help Center
              </Button>
            </Card.Content>
          </Card> */}

          <Card style={styles.contactCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Website Support
              </Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                Visit our website for additional resources and support options.
              </Text>
              <Button
                mode="outlined"
                onPress={handleWebsitePress}
                style={styles.actionButton}
                icon="web"
                textColor={colors.text}
              >
                Visit Website
              </Button>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          {/* <Card style={styles.emergencyCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.emergencyTitle}>
                Emergency Contact
              </Text>
              <Text variant="bodyMedium" style={styles.emergencyText}>
                For urgent community issues requiring immediate attention,
                contact local authorities directly.
              </Text>
              <Button
                mode="contained"
                onPress={handleEmergencyPress}
                style={styles.emergencyButton}
                icon="alert"
                textColor={colors.button.text}
              >
                Emergency Information
              </Button>
            </Card.Content>
          </Card> */}

          <Card style={styles.contactCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.cardTitle}>
                What to Include in Your Support Request:
              </Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                • Detailed description of the issue{"\n"}• Steps to reproduce
                the problem{"\n"}• Screenshots (if applicable){"\n"}• Device and
                app version information{"\n"}• Your contact email
              </Text>
            </Card.Content>
          </Card>

          {/* <View style={styles.hoursSection}>
            <Text variant="titleSmall" style={styles.hoursTitle}>
              Support Hours
            </Text>
            <Text variant="bodyMedium" style={styles.hoursText}>
              📧 Email: 24/7 (Response within 24 hours){"\n"}
              📞 Phone: Mon-Fri, 9AM-5PM EST{"\n"}
              🕒 Live Chat: Mon-Fri, 8AM-6PM EST
            </Text>
          </View> */}
        </ScrollView>

        {/* <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.backButton}
            icon="arrow-left"
            textColor={colors.text}
          >
            Back to Settings
          </Button>
        </View> */}
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
      gap: 16,
    },
    title: {
      textAlign: "center",
      marginBottom: 8,
      fontWeight: "bold",
      color: colors.text,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: 24,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    contactCard: {
      marginBottom: 8,
      elevation: 2,
      boxShadow: `0px 1px 2px ${colors.border || "#0000001a"}`,
      backgroundColor: colors.card,
    },
    cardTitle: {
      marginBottom: 8,
      fontWeight: "600",
      color: colors.text,
    },
    cardText: {
      marginBottom: 16,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    actionButton: {
      marginTop: 8,
    },
    emergencyCard: {
      backgroundColor: colors.errorContainer,
      borderColor: colors.error,
      borderWidth: 1,
    },
    emergencyTitle: {
      marginBottom: 8,
      fontWeight: "600",
    },
    emergencyText: {
      marginBottom: 16,
      color: colors.onErrorContainer,
      lineHeight: 20,
    },
    emergencyButton: {
      marginTop: 8,
      backgroundColor: colors.error,
    },
    divider: {
      marginVertical: 8,
      backgroundColor: colors.divider,
    },
    infoSection: {
      backgroundColor: colors.infoContainer,
      padding: 16,
      borderRadius: 8,
      marginTop: 8,
    },
    infoTitle: {
      marginBottom: 8,
      fontWeight: "600",
      color: colors.onInfoContainer,
    },
    infoText: {
      color: colors.onInfoContainer,
      lineHeight: 20,
    },
    hoursSection: {
      backgroundColor: colors.primaryContainer,
      padding: 16,
      borderRadius: 8,
    },
    hoursTitle: {
      marginBottom: 8,
      fontWeight: "600",
      color: colors.onPrimaryContainer,
    },
    hoursText: {
      color: colors.onPrimaryContainer,
      lineHeight: 20,
    },
    buttonContainer: {
      padding: 20,
      paddingBottom: 30,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.surface,
    },
    backButton: {
      borderRadius: 8,
    },
  });
