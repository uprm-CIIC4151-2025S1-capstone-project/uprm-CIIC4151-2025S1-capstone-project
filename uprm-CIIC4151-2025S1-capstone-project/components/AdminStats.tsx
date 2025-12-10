import { StyleSheet, View } from "react-native";
import { Text, Card } from "react-native-paper";
import type { AdminStatsProps } from "@/types/interfaces";
import { useAppColors } from "@/hooks/useAppColors";

/**
 * AdminStats component
 *
 * Displays a dashboard for the admin with stats about assigned, pending and resolved reports.
 *
 * @param {AdminStatsProps} props - Properties passed to the component
 * @returns {JSX.Element} - The rendered component
 */
export default function AdminStats({
  assigned,
  pending,
  resolved,
}: AdminStatsProps) {
  const { colors } = useAppColors();

  const stats = [
    { label: "Assigned", value: assigned, icon: "📋" },
    { label: "Pending", value: pending, icon: "⏳" },
    { label: "Resolved", value: resolved, icon: "✅" },
  ];

  const completionRate =
    assigned > 0 ? Math.round((resolved / assigned) * 100) : 0;

  const styles = createStyles(colors);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          👨‍💼 Admin Dashboard
        </Text>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              style={[
                styles.statRow,
                index < stats.length - 1 && styles.borderBottom,
              ]}
            >
              <View style={styles.statLeft}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.completionRate}>
            Completion Rate:{" "}
            <Text style={styles.rateValue}>{completionRate}%</Text>
          </Text>
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
      borderLeftWidth: 4,
      borderLeftColor: colors.info,
      backgroundColor: colors.card,
    },
    title: {
      fontWeight: "600",
      marginBottom: 16,
      color: colors.info,
      fontSize: 16,
    },
    statsContainer: {
      gap: 0,
      marginBottom: 12,
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    statLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statIcon: {
      fontSize: 18,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    statValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: 12,
    },
    completionRate: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    rateValue: {
      fontWeight: "600",
      color: colors.info,
    },
  });
