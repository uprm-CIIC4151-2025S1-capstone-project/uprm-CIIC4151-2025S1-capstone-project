import { ThemedView } from "@/components/themed-view";
import { StyleSheet, ScrollView, Linking, Alert } from "react-native";
import { Button, Text, Card, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStoredCredentials } from "@/utils/auth";
import { useAppColors } from "@/hooks/useAppColors";

export default function ContactSupportModal() {
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

  const handleWebsitePress = () => {
    Linking.openURL(
      "http://github.com/Jonathan-Rod/uprm-CIIC4151-2025S1-capstone-project/blob/main/README.md"
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
      gap: 16,
    },
    title: {
      textAlign: "center",
      marginBottom: 8,
      fontWeight: "bold",
      color: colors.text,
    },
    contactCard: {
      marginBottom: 8,
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
    divider: {
      marginVertical: 8,
      backgroundColor: colors.divider,
    },
  });
