// TODO Remove onViewAll 
import FABCreateReport from "@/components/FABCreateReport";
import PinnedReports from "@/components/PinnedReports";
import QuickActionsCard from "@/components/QuickActionsCard";
import UserCard from "@/components/UserCard";
import { useAppColors } from "@/hooks/useAppColors";
import type { ReportData, UserSession } from "@/types/interfaces";
import { getPinnedReports } from "@/utils/api";
import { getStoredCredentials } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [pinnedReports, setPinnedReports] = useState<ReportData[]>([]);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHomeData = async () => {
    try {
      setError("");
      const credentials = await getStoredCredentials();

      if (!credentials) {
        setError("Please log in to view home data");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setUser({
        id: credentials.userId,
        email: credentials.email,
        admin: false,
        suspended: false,
        created_at: new Date().toISOString(),
      });

      const pinnedData = await getPinnedReports();

      const reports =
        pinnedData.pinned_reports || pinnedData.reports || pinnedData || [];
      setPinnedReports(Array.isArray(reports) ? reports : []);
    } catch (err: any) {
      console.error("Error loading home data:", err);
      if (
        err.message?.includes("not authenticated") ||
        err.message?.includes("User ID")
      ) {
        setError("Please log in to view home data");
      } else {
        setError(err.message || "Failed to load home data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleReportPress = (reportId?: number) => {
    if (reportId == null) {
      console.warn("handleReportPress called with invalid reportId:", reportId);
      return;
    }
    router.push({
      pathname: "/(modals)/report-view",
      params: { id: reportId.toString() },
    });
  };

  const handleCreateReport = () => {
    getStoredCredentials().then((credentials) => {
      if (!credentials) {
        setError("Please log in to create reports");
        return;
      }
      router.push("/(modals)/report-form");
    });
  };

  const handleViewAllReports = () => {
    router.push("/(tabs)/explore");
  };

  const handleViewMap = () => {
    router.push("/(modals)/view-map");
  };

  const handleViewAllPinned = () => {
    router.push("/(tabs)/explore");
  };

  const handleLoginRedirect = () => {
    router.replace("/");
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && error.includes("log in")) {
    return (
      <SafeAreaView style={styles.container}>
        <View className="login" style={styles.loginContainer}>
          <Text variant="headlineMedium" style={styles.loginTitle}>
            Welcome
          </Text>
          <Text variant="bodyMedium" style={styles.loginSubtitle}>
            Please log in to view your dashboard
          </Text>
          <Button
            mode="contained"
            onPress={handleLoginRedirect}
            style={styles.loginButton}
            textColor={colors.button.text}
          >
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        Home
      </Text>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <UserCard user={user} />

        {/* Pinned Reports Section*/}
        <PinnedReports
          pinnedReports={pinnedReports}
          error={error}
          // onViewAll={handleViewAllPinned}
          onRetry={loadHomeData}
          onReportPress={handleReportPress}
        />

        {/* Quick Actions */}
        <QuickActionsCard
          onBrowseAll={handleViewAllReports}
          onViewMap={handleViewMap}
        />
      </ScrollView>

      <FABCreateReport onPress={handleCreateReport} />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      margin: 16,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
    },
    loadingText: {
      color: colors.text,
    },
    loginContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      gap: 16,
    },
    loginTitle: {
      fontWeight: "bold",
      textAlign: "center",
      color: colors.text,
    },
    loginSubtitle: {
      textAlign: "center",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    loginButton: {
      marginTop: 16,
      backgroundColor: colors.button.primary,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
  });
