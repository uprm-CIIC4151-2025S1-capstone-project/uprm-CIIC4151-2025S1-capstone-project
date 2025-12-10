import LoginForm from "@/components/LoginForm";
import SignInForm from "@/components/SignInForm";
import { useAppColors } from "@/hooks/useAppColors";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * IndexScreen displays a login form when the user is not logged in, and a
 * sign up form when the user is logged in. It also displays a button to
 * toggle between the two forms.
 * @returns {JSX.Element} The IndexScreen component.
 */
export default function IndexScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { colors } = useAppColors();

  const handleSuccess = () => {
    router.replace("/(tabs)/home");
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.headline}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {isLogin ? "Sign in to your account" : "Sign up to get started"}
        </Text>

        {isLogin ? (
          <LoginForm onSuccess={handleSuccess} />
        ) : (
          <SignInForm onSuccess={handleSuccess} />
        )}

        <Button
          mode="text"
          onPress={() => setIsLogin(!isLogin)}
          style={styles.toggleButton}
          labelStyle={styles.toggleButtonLabel}
          textColor={colors.primary}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </Button>
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
      justifyContent: "center",
      padding: 24,
    },
    headline: {
      textAlign: "center",
      marginBottom: 8,
      fontWeight: "bold",
      color: colors.text,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: 32,
      color: colors.textSecondary,
    },
    toggleButton: {
      marginTop: 24,
    },
    toggleButtonLabel: {
      fontSize: 14,
    },
  });
