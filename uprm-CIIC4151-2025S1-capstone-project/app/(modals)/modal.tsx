import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Modal Screen
      </ThemedText>

      <ThemedText type="default" style={styles.text}>
        This is a sample modal screen. You can use this pattern for various
        modal presentations throughout your app.
      </ThemedText>

      <ThemedText type="default" style={styles.text}>
        Common uses include:
        {"\n"}• Forms and data entry
        {"\n"}• Settings and preferences
        {"\n"}• Confirmation dialogs
        {"\n"}• Detailed information views
      </ThemedText>

      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Dismiss via Link</ThemedText>
      </Link>

      <Button
        mode="outlined"
        onPress={() => router.back()}
        style={styles.button}
      >
        Dismiss via Router
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  text: {
    marginVertical: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  link: {
    marginTop: 20,
    paddingVertical: 10,
  },
  button: {
    marginTop: 10,
  },
});
