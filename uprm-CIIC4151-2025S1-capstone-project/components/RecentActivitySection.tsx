import { Card, List } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import ReportCard from "./ReportCard";
import type { ReportData, ReportCategory } from "@/types/interfaces";
import { useAppColors } from "@/hooks/useAppColors";

interface RecentActivitySectionProps {
  reports: ReportData[];
  expanded: boolean;
  onToggle: () => void;
  onReportPress?: (reportId: number) => void;
}

/**
 * Component that displays a list of recent reports.
 * @param {RecentActivitySectionProps} props - props for the component
 * @param {ReportData[]} props.reports - list of recent reports
 * @param {boolean} props.expanded - whether or not the list is expanded
 * @param {() => void} props.onToggle - callback for toggling the list
 * @param {number => void} props.onReportPress - callback for when a report is pressed
 */
export default function RecentActivitySection({
  reports,
  expanded,
  onToggle,
  onReportPress,
}: RecentActivitySectionProps) {
  const { colors } = useAppColors();
  const styles = createStyles(colors);

  if (reports.length === 0) return null;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <List.Accordion
          title={`Recent Activity (${reports.length})`}
          expanded={expanded}
          onPress={onToggle}
          style={styles.accordion}
          titleStyle={styles.accordionTitle}
          left={(props) => <List.Icon {...props} icon="clock-outline" />}
        >
          <View style={styles.reportsContainer}>
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={{
                  ...report,
                  category: report.category as ReportCategory,
                }}
                onPress={
                  onReportPress ? () => onReportPress(report.id) : undefined
                }
              />
            ))}
          </View>
        </List.Accordion>
      </Card.Content>
    </Card>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      margin: 0,
      padding: 0,
      backgroundColor: colors.surface,
    },
    cardContent: {
      color: colors.warning,
      padding: 0,
    },
    accordion: {
      margin: 0,
      padding: 0,
    },
    accordionTitle: {
      fontWeight: "600",
      color: colors.text,
    },
    reportsContainer: {
      paddingHorizontal: 8,
      paddingBottom: 8,
      gap: 12,
    },
  });
