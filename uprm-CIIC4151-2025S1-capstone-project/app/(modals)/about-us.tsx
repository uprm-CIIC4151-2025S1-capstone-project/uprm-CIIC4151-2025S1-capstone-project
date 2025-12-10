import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/useAppColors";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * A modal that displays information about the app and its development team.
 *
 * It shows the app's mission, what it does, its values, and team roles.
 *
 * The modal also provides contact information for users to reach out
 * to the development team with questions or suggestions.
 *
 * @return {React.ReactElement}
 */
export default function AboutUsModal() {
  const { colors } = useAppColors();

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text variant="headlineMedium" style={styles.title}>
            About Us
          </Text>

          <View style={styles.content}>
            <Text variant="bodyMedium" style={styles.text}>
              We&apos;re dedicated to building safer and more responsive
              communities. We help everyone connect with local authorities and
              bring transparency to the reporting process of common public
              needs.
            </Text>

            <View style={styles.section}>
              <List.Item
                title="Our Mission"
                titleStyle={styles.sectionTitle}
                style={{ paddingHorizontal: 0 }}
              />
              <Text variant="bodyMedium" style={styles.text}>
                To help people improve their communities by giving them an easy
                way to report problems, follow their progress, and see them
                solved. We want everyone to feel heard and be part of the change
                in their area.
              </Text>
            </View>

            <View style={styles.section}>
              <List.Item
                title="What We Do"
                titleStyle={styles.sectionTitle}
                style={{ paddingHorizontal: 0 }}
              />
              <Text variant="bodyMedium" style={styles.text}>
                • Let users easily report local issues with photos and details.
                {"\n"}• Store and organize reports in a secure database for
                review.{"\n"}• Help administrators manage, update, and resolve
                reports.{"\n"}• Keep users informed about the progress and
                status of their reports.{"\n"}
              </Text>
            </View>

            <View style={styles.section}>
              <List.Item
                title="Our Values"
                titleStyle={styles.sectionTitle}
                style={{ paddingHorizontal: 0 }}
              />
              <Text variant="bodyMedium" style={styles.text}>
                • <Text style={styles.bold}>Transparency: </Text>
                Open and clear updates on every report.{"\n"}
                {"\n"}• <Text style={styles.bold}>Accountability:</Text>{" "}
                Ensuring actions are taken and progress is visible.{"\n"}
                {"\n"}• <Text style={styles.bold}>Efficiency:</Text> Making it
                quick and easy to report and resolve issues.{"\n"}
                {"\n"}
              </Text>
            </View>

            <View style={styles.section}>
              <List.Item
                title="Team Roles"
                titleStyle={styles.sectionTitle}
                style={{ paddingHorizontal: 0 }}
              />
              <Text variant="bodyMedium" style={styles.text}>
                •{" "}
                <Text style={styles.bold}>
                  Ramphis Lopez - Data & Backend Development:{" "}
                </Text>{" "}
                {"\n"}
                Responsible for data collection during research, defining the
                database schema, and implementing core backend functions. Leads
                the development of analytics features and performance testing in
                later stages. {"\n"} {"\n"}•{" "}
                <Text style={styles.bold}>
                  Manuel Fuertes - Requirements & Integration:{" "}
                </Text>{" "}
                {"\n"}
                Focuses on drafting project requirements and setting up the
                backend environment. Works on UI mockups during development and
                integrates frontend with backend. Leads the analysis of user
                feedback. {"\n"} {"\n"}•{" "}
                <Text style={styles.bold}>
                  Jonathan Rodriguez - Research & API Development:{" "}
                </Text>{" "}
                {"\n"}
                Conducts initial interviews, researches and prepares development
                tools, and implements REST API endpoints. Contributes to
                settings functionality and gathers insights from surveys during
                the final sprint. {"\n"} {"\n"}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.contactInfo}>
              <List.Item
                title="Get In Touch"
                titleStyle={styles.sectionTitle}
                style={{ paddingHorizontal: 0 }}
              />
              <Text variant="bodyMedium" style={styles.text}>
                Have a question or suggestion? We&apos;d love to hear from you!
                {"\n"}
                Visit the Contact Support section in the app settings to reach
                our team.
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.versionText}>
              App Version 1.0.0 • Making Communities Better
            </Text>
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
    divider: {
      marginVertical: 16,
      backgroundColor: colors.divider,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    title: {
      textAlign: "center",
      marginBottom: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    content: {
      gap: 20,
    },
    text: {
      lineHeight: 22,
      textAlign: "left",
      color: colors.text,
    },
    section: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    sectionTitle: {
      marginBottom: 8,
      fontWeight: "600",
      color: colors.text,
    },
    bold: {
      fontWeight: "600",
    },
    contactInfo: {
      backgroundColor: colors.successContainer,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
    },
    versionText: {
      textAlign: "center",
      marginTop: 24,
      color: colors.textMuted,
      fontStyle: "italic",
    },
  });
