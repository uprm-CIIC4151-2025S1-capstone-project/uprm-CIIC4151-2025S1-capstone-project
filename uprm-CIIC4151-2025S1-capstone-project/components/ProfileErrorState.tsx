import { useAppColors } from "@/hooks/useAppColors";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

interface ProfileErrorStateProps {
  error: string;
  onRetry: () => void;
}

/**
 * A component that displays an error message and a retry button
 * when the profile page encounters an error.
 *
 * @param {string} error - The error message to display.
 * @param {() => void} onRetry - A function to call when the user wants to retry loading the profile.
 * @returns {JSX.Element} The rendered error state component.
 */
export default function ProfileErrorState({
  error,
  onRetry,
}: ProfileErrorStateProps) {
  const { colors } = useAppColors();
  const styles = createStyles(colors);

  return (
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
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    errorContainer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    errorText: {
      color: colors.error,
      textAlign: "center",
      marginBottom: 12,
    },
    retryButton: {
      marginTop: 8,
      borderColor: colors.error,
    },
  });
