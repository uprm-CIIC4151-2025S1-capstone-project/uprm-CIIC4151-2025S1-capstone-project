import { useAppColors } from "@/hooks/useAppColors";
import { completeLogout, getStoredCredentials } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogoutModal() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const credentials = await getStoredCredentials();

      if (!credentials) {
        router.back();
        return;
      }

      await completeLogout();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Logout
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              Are you sure you want to log out of your account?
            </Text>

            <View style={styles.infoBox}>
              <Text variant="bodySmall" style={styles.infoText}>
                • You&apos;ll need to sign in again to access your account{"\n"}
                • Your data will be safely preserved{"\n"}• Reports and
                preferences will be saved
              </Text>
            </View>

            <View style={styles.buttons}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.button}
                disabled={loading}
                textColor={colors.text}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.button}
                loading={loading}
                disabled={loading}
                buttonColor={colors.error}
                textColor={colors.button.text}
              >
                {loading ? "Logging Out..." : "Log Out"}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
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
    message: {
      textAlign: "center",
      marginBottom: 20,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    infoBox: {
      backgroundColor: colors.backgroundMuted,
      padding: 16,
      borderRadius: 8,
      marginBottom: 24,
    },
    infoText: {
      color: colors.textSecondary,
      lineHeight: 18,
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
