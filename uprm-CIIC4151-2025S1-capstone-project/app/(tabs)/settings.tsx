import { useAppColors } from "@/hooks/useAppColors";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useAppColors();

  type ModalPath =
    | "about-us"
    | "contact-support"
    | "terms-and-conditions"
    | "privacy-policy"
    | "logout"
    | "delete-account"
    | "update-profile"
    | "account-security";

  const handleNavigate = (modalPath: ModalPath) => {
    router.push(`/(modals)/${modalPath}`);
  };

  const handleContactSupport = async () => {
    try {
      handleNavigate("contact-support");
    } catch (error) {
      console.error("Contact support error:", error);
      handleNavigate("contact-support");
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed header (outside ScrollView), same idea as Explore */}
      <Text variant="headlineMedium" style={styles.header}>
        Settings
      </Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <List.Section title="General" titleStyle={styles.sectionTitle}>
          <List.Item
            title="About Us"
            description="Learn more about our app and mission"
            left={(props) => (
              <List.Icon {...props} icon="information-outline" color={colors.icon} />
            )}
            onPress={() => handleNavigate("about-us")}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="Contact Support"
            description="Reach out to our support team"
            left={(props) => (
              <List.Icon {...props} icon="help-circle-outline" color={colors.icon} />
            )}
            onPress={handleContactSupport}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </List.Section>

        <Divider style={styles.divider} />

        <List.Section title="Account" titleStyle={styles.sectionTitle}>
          <List.Item
            title="Update Profile"
            description="Change your email or password"
            left={(props) => (
              <List.Icon {...props} icon="account-edit-outline" color={colors.icon} />
            )}
            onPress={() => handleNavigate("update-profile")}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="Account Security"
            description="Manage your account security settings"
            left={(props) => (
              <List.Icon {...props} icon="shield-account-outline" color={colors.icon} />
            )}
            onPress={() => handleNavigate("account-security")}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </List.Section>

        <Divider style={styles.divider} />

        <List.Section title="Legal" titleStyle={styles.sectionTitle}>
          <List.Item
            title="Terms and Conditions"
            description="Read our terms of service"
            left={(props) => (
              <List.Icon {...props} icon="file-document-outline" color={colors.icon} />
            )}
            onPress={() => handleNavigate("terms-and-conditions")}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="Privacy Policy"
            description="Learn how we protect your data"
            left={(props) => (
              <List.Icon {...props} icon="shield-lock-outline" color={colors.icon} />
            )}
            onPress={() => handleNavigate("privacy-policy")}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </List.Section>

        <Divider style={styles.divider} />

        <List.Section title="Danger Zone" titleStyle={styles.sectionTitle}>
          <List.Item
            title="Logout"
            description="Sign out of your account"
            left={(props) => <List.Icon {...props} icon="logout" color={colors.icon} />}
            onPress={() => handleNavigate("logout")}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="Delete Account"
            description="Permanently delete your account and data"
            left={(props) => (
              <List.Icon {...props} icon="delete-outline" color={colors.icon} />
            )}
            onPress={() => handleNavigate("delete-account")}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </List.Section>

        <Text style={styles.versionText}>App Version 1.0.0</Text>
        <Text style={styles.buildText}>Build: 1.0.0.1</Text>
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
    // same spacing as Explore header (margin & centered)
    header: {
      margin: 16,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    listItem: {
      backgroundColor: colors.surface,
      marginVertical: 2,
      borderRadius: 8,
      paddingVertical: 4,
    },
    listItemTitle: {
      color: colors.text,
      fontWeight: "500",
    },
    listItemDescription: {
      color: colors.textMuted,
      fontWeight: "100",
      fontSize: 12,
    },
    divider: {
      marginVertical: 16,
      backgroundColor: colors.divider,
      height: StyleSheet.hairlineWidth,
    },
    versionText: {
      textAlign: "center",
      marginTop: 24,
      color: colors.textMuted,
      fontSize: 12,
    },
    buildText: {
      textAlign: "center",
      marginTop: 4,
      color: colors.textMuted,
      fontSize: 10,
    },
  });
