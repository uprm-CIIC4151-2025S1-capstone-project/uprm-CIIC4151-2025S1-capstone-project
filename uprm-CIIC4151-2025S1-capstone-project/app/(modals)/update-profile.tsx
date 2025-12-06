// TODO Code cleanup
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { Button, Text, TextInput, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getStoredCredentials, saveCredentials } from "@/utils/auth";
import { updateUser, upgradeToAdmin } from "@/utils/api";
import { useAppColors } from "@/hooks/useAppColors";

export default function UpdateProfileModal() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    adminCode: "", // <- NEW
  });
  const [errors, setErrors] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      const credentials = await getStoredCredentials();
      if (credentials) {
        setFormData((prev) => ({
          ...prev,
          email: credentials.email || "",
        }));
      }
    };
    loadUserData();
  }, []);

  const validateForm = () => {
    const newErrors = {
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

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

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const credentials = await getStoredCredentials();
      if (!credentials) {
        Alert.alert("Error", "Please log in to update your profile");
        router.back();
        return;
      }

      const updateData: any = {};

      // Only include fields that have been changed
      if (formData.email && formData.email !== credentials.email) {
        updateData.email = formData.email;
      }

      if (formData.newPassword && formData.currentPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      // If no changes, show message
      if (Object.keys(updateData).length === 0) {
        Alert.alert("No Changes", "No changes were made to your profile.");
        return;
      }

      const response = await updateUser(credentials.userId, updateData);

      if (response.success) {
        // Update stored credentials if email was changed
        if (updateData.email) {
          await saveCredentials(
            credentials.userId,
            updateData.email,
            formData.newPassword || credentials.password
          );
        }

        Alert.alert("Success", "Profile updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", response.error_msg || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
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
        Alert.alert(
          "Success",
          response.department
            ? `You have been upgraded to admin in ${response.department}.`
            : "You have been upgraded to admin."
        );
        // Optionally reset the code box
        setFormData((prev) => ({ ...prev, adminCode: "" }));

        // TODO save admin credentials
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


          {/* Email Section */}
          {/* <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              Email Address
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              Update your email address. You&apos;ll need to verify the new
              email address for security purposes.
            </Text>

            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              mode="outlined"
              disabled={loading}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!errors.email}
              outlineColor={colors.input.border}
              activeOutlineColor={colors.input.borderFocused}
              textColor={colors.input.text}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View> */}

          {/* Password Section */}
          {/* <View style={[styles.section, { borderLeftColor: colors.info }]}>
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
          </View> */}

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
              Verify & Upgrade
            </Button>
          </View>

          <Divider style={styles.divider} />

          {/* Security Tips */}
          <View style={[styles.section, { borderLeftColor: colors.success }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.success }]}
            >
              Security Tips
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              • Use a strong, unique password that you don&apos;t use elsewhere
              {"\n"}• Avoid using personal information like birthdays or names
              {"\n"}• Consider using a password manager for better security
              {"\n"}• Update your password regularly for maximum protection
            </Text>
          </View>

          {/* Action Buttons */}
          {/* <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              disabled={loading}
              style={styles.actionButton}
              textColor={colors.text}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              loading={loading}
              disabled={loading}
              style={styles.actionButton}
              textColor={colors.button.text}
            >
              Update Profile
            </Button>
          </View> */}
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
      boxShadow: `0px 1px 2px ${colors.shadow || "#0000001a"}`,
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
    actionButtons: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    actionButton: {
      flex: 1,
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
      backgroundColor: colors.button.primary,
    },
  });
