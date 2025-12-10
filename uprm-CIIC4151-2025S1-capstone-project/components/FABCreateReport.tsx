import { useAppColors } from "@/hooks/useAppColors";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

interface CreateReportFABProps {
  onPress: () => void;
  style?: any;
  testID?: string;
}

/**
 * A FAB button that opens the report submission form when pressed.
 * @param {CreateReportFABProps} props - an object containing the props for the FAB.
 * @param {() => void} onPress - a function to call when the button is pressed.
 * @param {Object} style - an optional style object to override the default style of the FAB.
 * @param {string} testID - an optional test ID to assign to the FAB.
 */
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
