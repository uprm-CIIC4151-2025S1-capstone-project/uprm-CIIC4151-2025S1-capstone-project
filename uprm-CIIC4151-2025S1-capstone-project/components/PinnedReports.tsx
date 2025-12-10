import ReportCard from "@/components/ReportCard";
import { useAppColors } from "@/hooks/useAppColors";
import type { ReportCategory, ReportData } from "@/types/interfaces";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

interface PinnedReportsCardProps {
  pinnedReports: ReportData[];
  error: string;
  // onViewAll: () => void;
  onRetry: () => void;
  onReportPress: (reportId: number) => void;
}

/**
 * A component that displays a list of pinned reports, with
 * options to retry loading, view all pinned reports, and
 * navigate to a specific report.
 *
 * @param pinnedReports - An array of pinned report data.
 * @param error - An error message to display if there was an issue loading the pinned reports.
 * @param onRetry - A function to call when the user wants to retry loading the pinned reports.
 * @param onReportPress - A function to call when the user wants to view a specific report.
 * @returns A JSX element displaying the pinned reports list.
 */
export default function PinnedReportsCard({
  pinnedReports,
  error,
  // onViewAll,
  onRetry,
  onReportPress,
}: PinnedReportsCardProps) {
  const { colors } = useAppColors();
  const styles = createStyles(colors);

  return (
    <Card style={styles.pinnedCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your Pinned Reports
          </Text>
          {/* {pinnedReports.length > 0 && (
            <Button
              mode="text"
              compact
              onPress={onViewAll}
              textColor={colors.primary}
            >
              View All
            </Button>
          )} */}
        </View>

        {error && !error.includes("log in") ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Button
              mode="outlined"
              onPress={onRetry}
              style={styles.retryButton}
              textColor={colors.error}
            >
              Retry
            </Button>
          </View>
        ) : pinnedReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pinned reports yet</Text>
            <Text style={styles.emptySubtext}>
              Pin important reports to see them here
            </Text>
            {/* <Button
              mode="contained"
              onPress={onViewAll}
              style={styles.exploreButton}
              textColor={colors.button.text}
            >
              Explore Reports
            </Button> */}
          </View>
        ) : (
          <>
            {console.log("Pinned reports data:", pinnedReports)}
            {pinnedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={{
                  ...report,
                  category: report.category as ReportCategory,
                }}
                onPress={() => onReportPress(report.id)}
              />
            ))}
            {/* {pinnedReports.length > 5 && (
              <Button
                mode="text"
                onPress={onViewAll}
                style={styles.viewMoreButton}
                textColor={colors.primary}
              >
                View {pinnedReports.length - 5} more pinned reports
              </Button>
            )} */}
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    pinnedCard: {
      marginBottom: 16,
      backgroundColor: colors.surface,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.text,
    },
    errorContainer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    errorText: {
      textAlign: "center",
      marginBottom: 12,
      color: colors.error,
    },
    retryButton: {
      marginTop: 8,
      borderColor: colors.error,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 30,
    },
    emptyText: {
      fontSize: 16,
      marginBottom: 8,
      color: colors.textSecondary,
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 20,
      color: colors.textMuted,
    },
    exploreButton: {
      marginTop: 8,
      backgroundColor: colors.button.primary,
    },
    viewMoreButton: {
      marginTop: 8,
    },
  });
