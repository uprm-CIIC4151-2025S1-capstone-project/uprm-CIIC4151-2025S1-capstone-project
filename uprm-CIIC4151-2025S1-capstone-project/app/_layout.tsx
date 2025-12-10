import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  navigationDarkTheme,
  navigationLightTheme,
} from "@/theme/navigation-theme";
import { paperDarkTheme, paperLightTheme } from "@/theme/paper-theme";
import { clearCredentials, getStoredCredentials } from "@/utils/auth";
import { ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  PaperProvider,
  Text,
} from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === "dark" ? paperDarkTheme : paperLightTheme;
  const navigationTheme =
    colorScheme === "dark" ? navigationDarkTheme : navigationLightTheme;

  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");

  const forceReset = async () => {
    await clearCredentials();
    router.replace("/");
  };

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log("Starting auth check...");
        setDebugInfo("Checking stored credentials...");

        const credentials = await getStoredCredentials();
        console.log("Credentials found:", credentials);

        if (!isMounted) return;

        if (credentials) {
          setDebugInfo(`Found credentials for: ${credentials.email}`);
          console.log("Credentials found, redirecting to home...");

          // Small delay to ensure navigation is ready
          setTimeout(() => {
            if (isMounted) {
              router.replace("/(tabs)/home");
              console.log("Navigation to home completed");
            }
          }, 100);
        } else {
          setDebugInfo("No credentials found");
          console.log("No credentials found, redirecting to login...");
          setTimeout(() => {
            if (isMounted) {
              router.replace("/");
              console.log("Navigation to login completed");
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setDebugInfo(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        if (isMounted) {
          router.replace("/");
        }
      } finally {
        if (isMounted) {
          console.log("Auth check completed");
          setIsCheckingAuth(false);
        }
      }
    };

    // Add a timeout fallback
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log("Auth check timeout - forcing completion");
        setIsCheckingAuth(false);
      }
    }, 3000);

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [router]);

  // Show loading screen while checking auth to avoid flash
  if (isCheckingAuth) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                accessibilityLabel="Loading authentication status"
                accessibilityRole="progressbar"
              />
              <Text style={styles.loadingText}>Checking authentication...</Text>
              <Text style={styles.debugText}>{debugInfo}</Text>
              <Button
                mode="outlined"
                onPress={forceReset}
                style={styles.resetButton}
              >
                Reset App
              </Button>
            </View>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(modals)/about-us"
              options={{ presentation: "modal", title: "About Us" }}
            />
            <Stack.Screen
              name="(modals)/account-security"
              options={{ presentation: "modal", title: "Account Security" }}
            />
            <Stack.Screen
              name="(modals)/contact-support"
              options={{ presentation: "modal", title: "Contact Support" }}
            />
            <Stack.Screen
              name="(modals)/delete-account"
              options={{ presentation: "modal", title: "Delete Account" }}
            />
            <Stack.Screen
              name="(modals)/global-stats"
              options={{ presentation: "modal", title: "Global Statistics" }}
            />
            <Stack.Screen
              name="(modals)/logout"
              options={{ presentation: "modal", title: "Logout" }}
            />
            <Stack.Screen
              name="(modals)/modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
            <Stack.Screen
              name="(modals)/privacy-policy"
              options={{ presentation: "modal", title: "Privacy Policy" }}
            />
            <Stack.Screen
              name="(modals)/report-form"
              options={({ route }) => {
                const params = route.params as any;
                const isEdit = params?.mode === "edit";
                return {
                  presentation: "modal",
                  title: isEdit ? "Edit Report" : "Create Report",
                };
              }}
            />
            <Stack.Screen
              name="(modals)/report-view"
              options={{ presentation: "modal", title: "Report Details" }}
            />
            <Stack.Screen
              name="(modals)/terms-and-conditions"
              options={{ presentation: "modal", title: "Terms & Conditions" }}
            />
            <Stack.Screen
              name="(modals)/update-profile"
              options={{ presentation: "modal", title: "Update Profile" }}
            />
            <Stack.Screen
              name="(modals)/view-map"
              options={{ presentation: "modal", title: "View Map" }}
            />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  resetButton: {
    marginTop: 20,
  },
});
