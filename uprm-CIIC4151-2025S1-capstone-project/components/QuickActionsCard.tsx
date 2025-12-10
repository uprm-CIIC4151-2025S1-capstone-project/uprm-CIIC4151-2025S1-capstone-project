import { Card, Text, Button } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";

interface QuickActionsCardProps {
  onBrowseAll: () => void;
  onViewMap: () => void;
}

/**
 * A component for displaying quick actions for the user to take.
 *
 * @param {{QuickActionsCardProps}} props
 * @param {function} props.onBrowseAll
 * @param {function} props.onViewMap
 * @return {JSX.Element} A JSX element for displaying quick actions for the user to take.
 */
export default function QuickActionsCard({
  onBrowseAll,
  onViewMap,
}: QuickActionsCardProps) {
  const { colors } = useAppColors();
  const styles = createStyles(colors);

  return (
    <Card style={styles.actionsCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <Button
            mode="outlined"
            icon="compass"
            onPress={onBrowseAll}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            textColor={colors.text}
          >
            Browse All
          </Button>
          <Button
            mode="outlined"
            icon="map-marker"
            accessibilityLabel="View map"
            accessibilityRole="image"
            onPress={onViewMap}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            textColor={colors.text}
          >
            View Map
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    actionsCard: {
      marginBottom: 16,
      backgroundColor: colors.surface,
    },
    sectionTitle: {
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.text,
    },
    actionsGrid: {
      flexDirection: "row",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      borderColor: colors.border,
    },
    actionButtonContent: {
      height: 44,
    },
  });
