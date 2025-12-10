import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/useAppColors";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * AccountSecurityModal
 *
 * A modal screen for managing account security settings, including
 * authentication, notification, and security action settings.
 *
 * @returns {jsx.Element} The rendered modal screen.
 */
export default function AccountSecurityModal() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [settings, setSettings] = useState({
    sessionTimeout: false,
    emailNotifications: false,
  });

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
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

            <List.Item
              title="Auto Logout"
              description="Automatically log out after 30 minutes of inactivity"
              left={(props) => <List.Icon {...props} icon="logout" />}
              right={(props) => (
                <Switch
                  value={settings.sessionTimeout}
                  onValueChange={() => handleSettingToggle("sessionTimeout")}
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
    divider: {
      marginVertical: 8,
      backgroundColor: colors.divider,
      height: 1,
    },
  });
