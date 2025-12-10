import { StyleSheet, View } from "react-native";
import { Text, Card } from "react-native-paper";
import type { ReportData } from "@/types/interfaces";
import { useAppColors } from "@/hooks/useAppColors";

interface VisitedReportsProps {
  reports: ReportData[];
}

/**
 * Displays a list of recently visited reports.
 *
 * @param {{ reports: ReportData[] }} props
 * @returns {JSX.Element} A list of recently visited reports.
 */
export default function VisitedReports({ reports }: VisitedReportsProps) {
  const { colors } = useAppColors();

  if (reports.length === 0) return null;

  const getStatusStyles = (status: string) => {
    const baseStyle = {
      fontSize: 10,
      fontWeight: "500" as const,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      overflow: "hidden" as const,
    };

    switch (status) {
      case "open":
        return {
          ...baseStyle,
          backgroundColor: colors.reportStatus.openLight,
          color: colors.reportStatus.open,
        };
      case "in_progress":
        return {
          ...baseStyle,
          backgroundColor: colors.reportStatus.in_progressLight,
          color: colors.reportStatus.in_progress,
        };
      case "resolved":
        return {
          ...baseStyle,
          backgroundColor: colors.reportStatus.resolvedLight,
          color: colors.reportStatus.resolved,
        };
      case "closed":
        return {
          ...baseStyle,
          backgroundColor: colors.reportStatus.closedLight,
          color: colors.reportStatus.closed,
        };
      case "denied":
        return {
          ...baseStyle,
          backgroundColor: colors.reportStatus.deniedLight,
          color: colors.reportStatus.denied,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.chip.background,
          color: colors.chip.text,
        };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const formatCategory = (category: string) => {
    return category
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const styles = createStyles(colors);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Recent Activity ({reports.length})
        </Text>

        <View style={styles.reportsList}>
          {reports.map((report) => {
            const statusStyle = getStatusStyles(report.status);

            return (
              <View key={report.id} style={styles.reportItem}>
                <Text style={styles.reportTitle} numberOfLines={2}>
                  {report.title}
                </Text>
                <View style={styles.reportMeta}>
                  <View style={styles.metaLeft}>
                    <Text style={styles.category}>
                      {formatCategory(report.category)}
                    </Text>
                    <Text style={[styles.status, statusStyle]}>
                      {report.status.replace("_", " ")}
                    </Text>
                  </View>
                  <Text style={styles.timeAgo}>
                    {getTimeAgo(report.created_at)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      marginBottom: 8,
      elevation: 2,
      boxShadow: `0px 1px 2px ${colors.border || "#0000001a"}`,
      backgroundColor: colors.card,
    },
    title: {
      fontWeight: "600",
      marginBottom: 16,
      fontSize: 16,
      color: colors.text,
    },
    reportsList: {
      gap: 12,
    },
    reportItem: {
      padding: 12,
      backgroundColor: colors.backgroundMuted,
      borderRadius: 8,
    },
    reportTitle: {
      fontWeight: "500",
      marginBottom: 8,
      lineHeight: 18,
      color: colors.text,
    },
    reportMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    metaLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    category: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    status: {
      // Styles applied dynamically in getStatusStyles
    },
    timeAgo: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: "500",
    },
  });
