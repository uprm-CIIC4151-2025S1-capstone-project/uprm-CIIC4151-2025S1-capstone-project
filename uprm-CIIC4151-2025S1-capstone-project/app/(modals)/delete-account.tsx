import { useAppColors } from "@/hooks/useAppColors";
import { deleteUser } from "@/utils/api";
import { completeLogout, getStoredCredentials } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeleteAccountModal() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [step, setStep] = useState(1); // 1: warning, 2: confirmation

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") {
      return;
    }

    setLoading(true);
    try {
      const credentials = await getStoredCredentials();

      if (!credentials) {
        router.back();
        return;
      }

      await deleteUser(credentials.userId);
      await completeLogout();
      router.replace("/");
    } catch (error: any) {
      console.error("Account deletion error:", error);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                Delete Account
              </Text>

              <Text variant="bodyMedium" style={styles.warningText}>
                You are about to permanently delete your account. This action
                cannot be undone and will result in:
              </Text>

              <View style={styles.consequences}>
                <Text style={styles.consequenceItem}>
                  • Permanent loss of all your personal data
                </Text>
                <Text style={styles.consequenceItem}>
                  • Deletion of all reports you&apos;ve created
                </Text>
                <Text style={styles.consequenceItem}>
                  • Removal from all pinned reports
                </Text>
                <Text style={styles.consequenceItem}>
                  • Complete erasure of your activity history
                </Text>
                <Text style={styles.consequenceItem}>
                  • Inability to recover any information
                </Text>
              </View>

              <View style={styles.buttons}>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={styles.button}
                  textColor={colors.text}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setStep(2)}
                  style={styles.button}
                  buttonColor={colors.error}
                  textColor={colors.button.text}
                >
                  I Understand, Continue
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Final Confirmation
            </Text>

            <Text variant="bodyMedium" style={styles.confirmationText}>
              This is your final warning. Your account and all data will be
              permanently deleted.
            </Text>

            <Text variant="bodyMedium" style={styles.instructionText}>
              To confirm deletion, please type &quot;DELETE&quot; in the box
              below:
            </Text>

            <TextInput
              label="Type DELETE to confirm"
              value={confirmationText}
              onChangeText={setConfirmationText}
              mode="outlined"
              style={styles.textInput}
              autoCapitalize="characters"
              autoCorrect={false}
              outlineColor={colors.input.border}
              activeOutlineColor={colors.input.borderFocused}
              textColor={colors.input.text}
            />

            <Text variant="bodySmall" style={styles.noteText}>
              Note: By proceeding, you acknowledge that all your data will be
              permanently erased and cannot be recovered.
            </Text>

            <View style={styles.buttons}>
              <Button
                mode="outlined"
                onPress={() => setStep(1)}
                style={styles.button}
                disabled={loading}
                textColor={colors.text}
              >
                Go Back
              </Button>
              <Button
                mode="contained"
                onPress={handleDeleteAccount}
                style={styles.button}
                loading={loading}
                disabled={loading || confirmationText !== "DELETE"}
                buttonColor={colors.error}
                textColor={colors.button.text}
              >
                {loading ? "Deleting..." : "Permanently Delete"}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
      justifyContent: "center",
    },
    card: {
      padding: 16,
      backgroundColor: colors.card,
    },
    title: {
      marginBottom: 16,
      textAlign: "center",
      fontWeight: "bold",
      color: colors.text,
    },
    warningText: {
      textAlign: "center",
      marginBottom: 20,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    confirmationText: {
      textAlign: "center",
      marginBottom: 16,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    consequences: {
      backgroundColor: colors.errorContainer,
      padding: 16,
      borderRadius: 8,
      marginBottom: 20,
    },
    consequenceItem: {
      color: colors.onErrorContainer,
      marginBottom: 8,
      lineHeight: 18,
    },
    instructionText: {
      textAlign: "center",
      marginBottom: 16,
      fontWeight: "600",
      color: colors.text,
    },
    textInput: {
      marginBottom: 16,
      backgroundColor: colors.input.background,
    },
    noteText: {
      textAlign: "center",
      color: colors.textMuted,
      fontStyle: "italic",
      marginBottom: 24,
    },
    buttons: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      flex: 1,
      borderRadius: 8,
    },
  });
