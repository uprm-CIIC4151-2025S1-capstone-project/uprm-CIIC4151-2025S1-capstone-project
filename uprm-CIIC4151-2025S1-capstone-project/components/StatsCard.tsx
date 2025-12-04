import { StyleSheet, View } from "react-native";
import { Text, Card, Icon } from "react-native-paper";
import { useAppColors } from "@/hooks/useAppColors";

export interface StatsCardProps {
  title: string;
  icon?: string;
  stats: {
    label: string;
    value: number;
    color: string;
    description?: string;
  }[];
  showScore?: boolean;
  resolutionMetrics?: {
    score: number;
    maxPossibleScore: number;
    percentage: number;
    grade: "A" | "B" | "C" | "D" | "F";
    gradeColor: string;
  };
  additionalFooterItems?: {
    icon: string;
    label: string;
    value: string | number;
    color?: string;
  }[];
}

export default function StatsCard({
  title,
  icon = "chart-bar",
  stats,
  showScore = false,
  resolutionMetrics,
  additionalFooterItems = [],
}: StatsCardProps) {
  const { colors } = useAppColors();

  const styles = createStyles(colors);

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <Icon source={icon} size={22} color={colors.primary} />
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
        </View>

        {/* Grid de estadísticas */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {stat.description && (
                <Text style={styles.statDescription}>{stat.description}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Sección de scoring (opcional) */}
        {showScore && resolutionMetrics && (
          <View style={styles.scoreSection}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Resolution Score</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{resolutionMetrics.score}</Text>
                <Text style={styles.scoreSeparator}>/</Text>
                <Text style={styles.scoreMax}>
                  {resolutionMetrics.maxPossibleScore}
                </Text>
              </View>
            </View>

            <View style={styles.gradeItem}>
              <Text style={styles.scoreLabel}>Grade</Text>
              <View
                style={[
                  styles.gradeBadge,
                  { backgroundColor: resolutionMetrics.gradeColor },
                ]}
              >
                <Text style={styles.gradeText}>{resolutionMetrics.grade}</Text>
              </View>
            </View>

            <View style={styles.percentageItem}>
              <Text style={styles.scoreLabel}>Effectiveness</Text>
              <Text
                style={[
                  styles.percentageValue,
                  { color: resolutionMetrics.gradeColor },
                ]}
              >
                {resolutionMetrics.percentage}%
              </Text>
            </View>
          </View>
        )}

        {/* Footer items adicionales */}
        {additionalFooterItems.length > 0 && (
          <View style={styles.footer}>
            {additionalFooterItems.map((item, index) => (
              <View key={index} style={styles.footerItem}>
                <Icon
                  source={item.icon}
                  size={14}
                  color={item.color || colors.textSecondary}
                />
                <Text style={styles.footerLabel}>{item.label}</Text>
                <Text
                  style={[
                    styles.footerValue,
                    item.color && { color: item.color },
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 20,
    },
    title: {
      fontWeight: "600",
      fontSize: 16,
      color: colors.text,
    },
    statsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      marginBottom: 20,
    },
    statItem: {
      alignItems: "center",
      width: "33%",
      marginBottom: 16,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
      textAlign: "center",
      marginBottom: 2,
    },
    statDescription: {
      fontSize: 10,
      color: colors.textMuted,
      textAlign: "center",
    },
    scoreSection: {
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    scoreItem: {
      alignItems: "center",
      flex: 1,
    },
    scoreLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 6,
    },
    scoreContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    scoreValue: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.success,
    },
    scoreSeparator: {
      fontSize: 14,
      color: colors.textMuted,
      marginHorizontal: 4,
    },
    scoreMax: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    gradeItem: {
      alignItems: "center",
      flex: 1,
    },
    gradeBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    gradeText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },
    percentageItem: {
      alignItems: "center",
      flex: 1,
    },
    percentageValue: {
      fontSize: 20,
      fontWeight: "700",
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: 16,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    footerItem: {
      alignItems: "center",
    },
    footerLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
      marginBottom: 2,
    },
    footerValue: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
  });
