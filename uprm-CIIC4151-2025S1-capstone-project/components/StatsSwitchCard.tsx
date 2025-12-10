import { useAppColors } from "@/hooks/useAppColors";
import { StyleSheet, Switch, Text, View } from "react-native";

interface StatsSwitchCardProps {
  showSystemStats: boolean;
  onToggle: (value: boolean) => void;
}

/**
 * A component for switching between user stats and system stats.
 * It displays a switch and a label that changes depending on the value of the switch.
 * When the switch is turned on, it displays "Switch to User Stats" and when it's turned off, it displays "Switch to System Stats".
 * The onToggle function is called when the switch is toggled.
 * @param {boolean} showSystemStats - Whether to show system stats or not.
 * @param {(value: boolean) => void} onToggle - Function to be called when the switch is toggled.
 */
export default function StatsSwitchCard({
  showSystemStats,
  onToggle,
}: StatsSwitchCardProps) {
  const { colors } = useAppColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>
        {showSystemStats ? "Switch to User Stats" : "Switch to System Stats"}
      </Text>
      <Switch value={showSystemStats} onValueChange={onToggle} />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
  });
