import { useAppColors } from "@/hooks/useAppColors";
import { StyleSheet, Switch, Text, View } from "react-native";

interface StatsSwitchCardProps {
  showSystemStats: boolean;
  onToggle: (value: boolean) => void;
}

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
