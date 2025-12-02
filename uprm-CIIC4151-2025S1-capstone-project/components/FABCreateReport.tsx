import { useAppColors } from "@/hooks/useAppColors";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

interface CreateReportFABProps {
  onPress: () => void;
  style?: any;
  testID?: string;
}

export default function FABCreateReport({
  onPress,
  style,
  testID = "create-report-fab",
}: CreateReportFABProps) {
  const { colors } = useAppColors();
  const styles = createStyles(colors);

  return (
    <FAB
      icon="plus"
      style={[styles.fab, style]}
      onPress={onPress}
      accessibilityLabel="Create new report"
      accessibilityHint="Opens the report submission form"
      color={colors.button.text}
      testID={testID}
    />
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: colors.button.primary,
    },
  });
