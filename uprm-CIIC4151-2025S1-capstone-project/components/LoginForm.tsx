import { useAppColors } from "@/hooks/useAppColors";
import { login } from "@/utils/api";
import { saveCredentials } from "@/utils/auth";
import { useState } from "react";
import { StyleSheet, View, Keyboard, Alert } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";

interface LoginFormProps {
  onSuccess: () => void;
}

/**
 * LoginForm component with email and password inputs.
 *
 * Handles login action by calling the backend API.
 * Saves credentials using the existing function signature.
 * Displays an error message if the login credentials are invalid.
 */
export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { colors } = useAppColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasErrors = () => !email || !password;
  const hasEmailError = () => email.length > 0 && !email.includes("@");

  const handleLogin = async () => {
    setErrorMessage("");
    if (hasErrors() || hasEmailError()) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await login({ email, password });

      // Handle both response formats from backend
      if (response.success || response.user) {
        // Save credentials using the existing function signature
        await saveCredentials(response.user.id, email, password, response.user.admin, response.user.suspended);

        onSuccess();
      } else {
        const errorMsg = response.error_msg || "Invalid credentials";
        setErrorMessage(errorMsg);
        Alert.alert("Login Failed", errorMsg);
      }
    } catch (error: any) {
      const message = error.message || "Network error. Please try again.";
      setErrorMessage(message);
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  const clearErrorOnType = () => {
    setErrorMessage("");
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          clearErrorOnType();
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        mode="outlined"
        disabled={loading}
        style={styles.input}
        outlineStyle={styles.inputOutline}
        left={<TextInput.Icon icon="email" />}
        outlineColor={colors.input.border}
        activeOutlineColor={colors.input.borderFocused}
        textColor={colors.input.text}
        placeholderTextColor={colors.input.placeholder}
      />
      <HelperText
        type="error"
        visible={hasEmailError()}
        style={styles.helperText}
      >
        Enter a valid email address
      </HelperText>

      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          clearErrorOnType();
        }}
        secureTextEntry
        mode="outlined"
        disabled={loading}
        style={styles.input}
        outlineStyle={styles.inputOutline}
        left={<TextInput.Icon icon="lock" />}
        outlineColor={colors.input.border}
        activeOutlineColor={colors.input.borderFocused}
        textColor={colors.input.text}
        placeholderTextColor={colors.input.placeholder}
      />

      <HelperText type="error" visible={hasErrors()} style={styles.helperText}>
        Email and password are required
      </HelperText>

      <Button
        mode="contained"
        onPress={handleLogin}
        disabled={hasErrors() || hasEmailError() || loading}
        loading={loading}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        buttonColor={colors.button.primary}
        textColor={colors.button.text}
      >
        Sign In
      </Button>

      <HelperText
        type="error"
        visible={!!errorMessage}
        style={styles.authErrorText}
      >
        {errorMessage}
      </HelperText>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    input: {
      fontSize: 16,
      backgroundColor: colors.input.background,
    },
    inputOutline: {
      borderRadius: 12,
      borderWidth: 1,
    },
    button: {
      marginTop: 8,
      paddingVertical: 8,
      borderRadius: 12,
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: "600",
      paddingVertical: 4,
    },
    helperText: {
      fontSize: 14,
      marginTop: -8,
      marginBottom: 4,
    },
    authErrorText: {
      fontSize: 14,
      textAlign: "center",
      marginTop: 8,
      paddingHorizontal: 8,
      color: colors.error,
    },
  });
