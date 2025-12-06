// TODO Code cleanup and add comments explaining the overall idea
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { StyleSheet, View, ScrollView, Alert, Switch } from "react-native";
import { Button, Text, List, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { getStoredCredentials } from "@/utils/auth";
import { useAppColors } from "@/hooks/useAppColors";

export default function AccountSecurityModal() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    biometricAuth: false,
    twoFactorAuth: false,
    sessionTimeout: false,
    emailNotifications: false,
    pushNotifications: false,
  });

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const credentials = await getStoredCredentials();
      if (!credentials) {
        Alert.alert("Error", "Please log in to update security settings");
        router.back();
        return;
      }

      // TODO: Implement API call to save security settings
      // await updateSecuritySettings(credentials.userId, settings);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("Success", "Security settings updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Security settings update error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update security settings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewSessions = () => {
    Alert.alert(
      "Active Sessions",
      "This feature will show you all active sessions and allow you to log out from other devices.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "View Sessions",
          onPress: () => {
            Alert.alert("Info", "Sessions management coming soon!");
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "This will generate a file containing all your account data and reports.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: () => {
            Alert.alert("Info", "Data export feature coming soon!");
          },
        },
      ]
    );
  };

  const handlePrivacySettings = () => {
    router.push("/(modals)/privacy-policy");
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
            Account Security
          </Text>

          {/* <Text variant="bodyMedium" style={styles.introText}>
            Manage your account security preferences and privacy settings to
            keep your information safe and secure.
          </Text> */}

          {/* Authentication Settings */}
          <View style={[styles.section, { borderLeftColor: colors.primary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              Authentication
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              Configure how you authenticate and access your account for
              enhanced security.
            </Text>

            {/* <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face ID to log in quickly and securely"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={(props) => (
                <Switch
                  value={settings.biometricAuth}
                  onValueChange={() => handleSettingToggle("biometricAuth")}
                  disabled={loading}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={
                    settings.biometricAuth ? colors.primary : colors.border
                  }
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            /> */}

            {/* <List.Item
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => (
                <Switch
                  value={settings.twoFactorAuth}
                  onValueChange={() => handleSettingToggle("twoFactorAuth")}
                  disabled={loading}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={
                    settings.twoFactorAuth ? colors.primary : colors.border
                  }
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            /> */}

            <List.Item
              title="Auto Logout"
              description="Automatically log out after 30 minutes of inactivity"
              left={(props) => <List.Icon {...props} icon="logout" />}
              right={(props) => (
                <Switch
                  value={settings.sessionTimeout}
                  onValueChange={() => handleSettingToggle("sessionTimeout")}
                  disabled={loading}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={
                    settings.sessionTimeout ? colors.primary : colors.border
                  }
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
          </View>

          {/* Notification Settings */}
          <View style={[styles.section, { borderLeftColor: colors.info }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.info }]}
            >
              Notifications
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              Control how you receive security alerts and important
              notifications.
            </Text>

            <List.Item
              title="Email Notifications"
              description="Receive security alerts and important updates via email"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={(props) => (
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={() =>
                    handleSettingToggle("emailNotifications")
                  }
                  disabled={loading}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={
                    settings.emailNotifications ? colors.primary : colors.border
                  }
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />

            {/* <List.Item
              title="Push Notifications"
              description="Receive instant security alerts on your device"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={(props) => (
                <Switch
                  value={settings.pushNotifications}
                  onValueChange={() => handleSettingToggle("pushNotifications")}
                  disabled={loading}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={
                    settings.pushNotifications ? colors.primary : colors.border
                  }
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            /> */}
          </View>

          <Divider style={styles.divider} />

          {/* Security Actions */}
          <View style={[styles.section, { borderLeftColor: colors.warning }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.warning }]}
            >
              Security Actions
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              Manage your account security and access additional security
              features.
            </Text>

            {/* <List.Item
              title="Active Sessions"
              description="View and manage your active login sessions across devices"
              left={(props) => <List.Icon {...props} icon="monitor" />}
              onPress={handleViewSessions}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            /> */}

            <List.Item
              title="Export Data"
              description="Download a copy of your personal data and reports"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={handleExportData}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />

            <List.Item
              title="Privacy Settings"
              description="Review and manage your privacy preferences"
              left={(props) => <List.Icon {...props} icon="lock" />}
              onPress={handlePrivacySettings}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </View>

          {/* Security Status */}
          {/* <View style={[styles.section, { borderLeftColor: colors.success }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.success }]}
            >
              Security Status
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              Overview of your current account security status and
              recommendations.
            </Text> */}

            {/* <View style={styles.statusItems}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Password Strength:</Text>
                <Text style={[styles.statusValue, { color: colors.success }]}>
                  Strong
                </Text>
              </View> */}
              {/* <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>2FA Status:</Text>
                <Text
                  style={[
                    styles.statusValue,
                    {
                      color: settings.twoFactorAuth
                        ? colors.success
                        : colors.warning,
                    },
                  ]}
                >
                  {settings.twoFactorAuth ? "Enabled" : "Disabled"}
                </Text>
              </View> */}
              {/* <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Last Login:</Text>
                <Text style={styles.statusValue}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View> */}
          {/* </View> */}

          {/* Security Tips */}
          {/* <View style={[styles.section, { borderLeftColor: colors.secondary }]}>
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: colors.secondary }]}
            >
              Security Recommendations
            </Text>
            <Text variant="bodyMedium" style={styles.sectionText}>
              • Enable two-factor authentication for enhanced account protection
              {"\n"}• Use a unique, strong password that you don&apos;t use
              elsewhere
              {"\n"}• Regularly review your active sessions and log out unused
              devices{"\n"}• Keep the app updated to the latest version for
              security patches{"\n"}• Be cautious of suspicious emails,
              messages, or login attempts
            </Text>
          </View> */}

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
              onPress={handleSaveSettings}
              loading={loading}
              disabled={loading}
              style={styles.actionButton}
              textColor={colors.button.text}
            >
              Save Settings
            </Button>
          </View> */}
        </ScrollView>

        {/* <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.backButton}
            icon="arrow-left"
            textColor={colors.button.text}
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
    listItem: {
      paddingVertical: 12,
      paddingHorizontal: 0,
    },
    listItemTitle: {
      color: colors.text,
      fontWeight: "500",
    },
    listItemDescription: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    statusItems: {
      gap: 12,
      marginTop: 8,
    },
    statusItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
    },
    statusLabel: {
      color: colors.textSecondary,
      fontWeight: "500",
    },
    statusValue: {
      fontWeight: "600",
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
