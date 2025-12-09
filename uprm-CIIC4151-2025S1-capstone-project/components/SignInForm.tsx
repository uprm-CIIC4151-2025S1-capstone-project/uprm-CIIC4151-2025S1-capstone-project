import { useAppColors } from "@/hooks/useAppColors";
import { createUser } from "@/utils/api";
import { saveCredentials } from "@/utils/auth";
import { useState } from "react";
import { Alert, Keyboard, StyleSheet, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";

interface SignInFormProps {
  onSuccess: () => void;
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const { colors } = useAppColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEmailValid = email.includes("@") && email.includes(".");
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirm;
  const hasErrors = () =>
    !isEmailValid || !isPasswordValid || !doPasswordsMatch;

  const handleSignUp = async () => {
    setErrorMessage("");
    if (hasErrors()) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      console.log("Attempting to create user:", { email });

      const response = await createUser({
        email,
        password,
        admin: false,
      });

      console.log("User creation response:", response);

      if (!response) {
        setErrorMessage("Failed to create account");
        Alert.alert("Registration Failed", "Failed to create account");
        return;
      }

      // Handle successful user creation
      if (response && response.id) {
        // Save credentials
        await saveCredentials(response.id, email, password, response.admin, response.suspended);
        Alert.alert("Success", "Account created successfully!");
        onSuccess();
      } else {
        const errorMsg = response?.error_msg || "Failed to create account";
        setErrorMessage(errorMsg);
        Alert.alert("Registration Failed", errorMsg);
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      let message = "Network error. Please try again.";

      if (error.message.includes("Cannot connect to server")) {
        message =
          "Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:5000";
      } else if (
        error.message.includes("User with this email already exists")
      ) {
        message = "An account with this email already exists.";
      } else {
        message = error.message || "Network error. Please try again.";
      }

      setErrorMessage(message);
      Alert.alert("Registration Error", message);
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
        value={email}
        keyboardType="email-address"
        mode="outlined"
        onChangeText={(text) => {
          setEmail(text);
          clearErrorOnType();
        }}
        label="Email"
        autoCapitalize="none"
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
        visible={email.length > 0 && !isEmailValid}
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
      <HelperText
        type="error"
        visible={password.length > 0 && !isPasswordValid}
        style={styles.helperText}
      >
        Password must be at least 8 characters
      </HelperText>

      <TextInput
        label="Confirm Password"
        value={confirm}
        onChangeText={(text) => {
          setConfirm(text);
          clearErrorOnType();
        }}
        secureTextEntry
        mode="outlined"
        disabled={loading}
        style={styles.input}
        outlineStyle={styles.inputOutline}
        left={<TextInput.Icon icon="lock-check" />}
        outlineColor={colors.input.border}
        activeOutlineColor={colors.input.borderFocused}
        textColor={colors.input.text}
        placeholderTextColor={colors.input.placeholder}
      />
      <HelperText
        type="error"
        visible={!doPasswordsMatch && confirm.length > 0}
        style={styles.helperText}
      >
        Passwords must match
      </HelperText>

      <Button
        mode="contained"
        onPress={handleSignUp}
        disabled={hasErrors() || loading}
        loading={loading}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        buttonColor={colors.button.primary}
        textColor={colors.button.text}
      >
        Create Account
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
