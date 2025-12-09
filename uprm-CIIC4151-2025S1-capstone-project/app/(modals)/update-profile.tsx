import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/useAppColors";
import { updateUser, upgradeToAdmin } from "@/utils/api";
import { getStoredCredentials, saveCredentials } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpdateProfileModal() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    adminCode: "",
  });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Password change validation
    if (
      formData.newPassword ||
      formData.confirmPassword ||
      formData.currentPassword
    ) {
      if (!formData.currentPassword) {
        newErrors.currentPassword =
          "Current password is required to change password";
      }
      if (formData.newPassword && formData.newPassword.length < 8) {
        newErrors.newPassword = "New password must be at least 8 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleUpdatePassword = async () => {
    if (!validateForm()) {
      return;
    }

    // If no password fields are filled, return early
    if (
      !formData.newPassword &&
      !formData.confirmPassword &&
      !formData.currentPassword
    ) {
      Alert.alert("No Changes", "Please enter your current and new password.");
      return;
    }

    setLoading(true);
    try {
      const credentials = await getStoredCredentials();
      if (!credentials) {
        Alert.alert("Error", "Please log in to update your password");
        router.back();
        return;
      }

      const updateData: any = {};

      if (formData.newPassword && formData.currentPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      const response = await updateUser(credentials.userId, updateData);

      if (response.success) {
        // Update stored credentials if password was changed
        if (updateData.new_password) {
          await saveCredentials(
            credentials.userId,
            credentials.email,
            formData.newPassword,
            credentials.admin,
            credentials.suspended
          );
        }

        Alert.alert("Success", "Password updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Clear password fields after successful update
              setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              }));
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.error_msg || "Failed to update password");
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToAdmin = async () => {
    try {
      if (!formData.adminCode?.trim()) {
        Alert.alert("Missing Code", "Please enter an admin code.");
        return;
      }

      setLoading(true);
      const credentials = await getStoredCredentials();
      if (!credentials) {
        Alert.alert("Error", "You must be logged in to use an admin code.");
        return;
      }

      const response = await upgradeToAdmin(
        credentials.userId,
        formData.adminCode.trim()
      );

      if (response?.success) {
        await saveCredentials(
          credentials.userId,
          credentials.email,
          credentials.password,
          true,
          credentials.suspended
        );

        Alert.alert(
          "Success",
          response.department
            ? `You have been upgraded to admin in ${response.department}.`
            : "You have been upgraded to admin."
        );
        // Reset the code box
        setFormData((prev) => ({ ...prev, adminCode: "" }));
      } else {
        Alert.alert("Invalid Code", response?.error_msg || "Code not recognized.");
      }
    } catch (err: any) {
      console.error("Upgrade admin error:", err);
      Alert.alert("Error", err.message || "Failed to verify admin code.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="headlineMedium" style={styles.title}>
            Update Profile
          </Text>

          {/* Password Section */}
          <View style={[styles.section, { borderLeftColor: colors.info }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.info }]}
            >
              Change Password
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              Update your password to keep your account secure. Your new
              password should be strong and unique.
            </Text>

            <TextInput
              label="Current Password"
              value={formData.currentPassword}
              onChangeText={(value) =>
                handleInputChange("currentPassword", value)
              }
              mode="outlined"
              secureTextEntry
              disabled={loading}
              style={styles.input}
              error={!!errors.currentPassword}
              outlineColor={colors.input.border}
              activeOutlineColor={colors.input.borderFocused}
              textColor={colors.input.text}
            />
            {errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}

            <TextInput
              label="New Password"
              value={formData.newPassword}
              onChangeText={(value) => handleInputChange("newPassword", value)}
              mode="outlined"
              secureTextEntry
              disabled={loading}
              style={styles.input}
              error={!!errors.newPassword}
              outlineColor={colors.input.border}
              activeOutlineColor={colors.input.borderFocused}
              textColor={colors.input.text}
            />
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}

            <TextInput
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              mode="outlined"
              secureTextEntry
              disabled={loading}
              style={styles.input}
              error={!!errors.confirmPassword}
              outlineColor={colors.input.border}
              activeOutlineColor={colors.input.borderFocused}
              textColor={colors.input.text}
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}

            <Button
              mode="contained"
              style={styles.actionButton}
              disabled={
                loading ||
                (!formData.newPassword &&
                  !formData.currentPassword &&
                  !formData.confirmPassword)
              }
              onPress={handleUpdatePassword}
              textColor={colors.button.text}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </View>

          <Divider style={styles.divider} />

          {/* Admin Upgrade Section */}
          <View style={[styles.section, { borderLeftColor: colors.warning }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.warning }]}
            >
              Admin Code Upgrade
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              If you were given an administrator access code, enter it below to
              upgrade your account.
            </Text>

            <TextInput
              label="Admin Code"
              value={formData.adminCode}
              onChangeText={(value) => handleInputChange("adminCode", value)}
              mode="outlined"
              disabled={loading}
              style={styles.input}
              autoCapitalize="none"
              placeholder="Enter admin code"
              outlineColor={colors.input.border}
              activeOutlineColor={colors.input.borderFocused}
              textColor={colors.input.text}
            />

            <Button
              mode="contained"
              style={styles.actionButton}
              disabled={loading || !formData.adminCode?.trim()}
              onPress={handleUpgradeToAdmin}
              textColor={colors.button.text}
            >
              {loading ? "Verifying..." : "Verify & Upgrade"}
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
      paddingBottom: 20,
    },
    title: {
      textAlign: "center",
      marginBottom: 4,
      fontWeight: "bold",
      color: colors.text,
    },
    section: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 8,
      borderLeftWidth: 4,
      marginBottom: 16,
    },
    sectionTitle: {
      marginBottom: 12,
      fontWeight: "600",
    },
    sectionText: {
      lineHeight: 20,
      color: colors.text,
      marginBottom: 16,
    },
    input: {
      marginBottom: 8,
      backgroundColor: colors.input.background,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginBottom: 8,
      marginLeft: 4,
    },
    divider: {
      marginVertical: 8,
      backgroundColor: colors.divider,
      height: 1,
    },
    actionButton: {
      marginTop: 8,
    },
  });
