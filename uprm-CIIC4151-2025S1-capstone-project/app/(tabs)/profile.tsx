import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes
import AdminStats from "@/components/AdminStats";
import NoActivityState from "@/components/NoActivityState";
import ProfileErrorState from "@/components/ProfileErrorState";
import RecentActivitySection from "@/components/RecentActivitySection";
import ReportStats from "@/components/ReportStats";
import StatsOverviewCard from "@/components/StatsOverviewCard";
import StatsSwitchCard from "@/components/StatsSwitchCard";
import UserCard from "@/components/UserCard";

// Utils
import { useAppColors } from "@/hooks/useAppColors";
import { type ReportData, type UserSession } from "@/types/interfaces";
import {
  getAdminStats,
  getOverviewStats,
  getReports,
  getUserStats,
} from "@/utils/api";
import { getStoredCredentials } from "@/utils/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [user, setUser] = useState<UserSession | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [allReports, setAllReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showSystemStats, setShowSystemStats] = useState(false);
  const [expandedRecentActivity, setExpandedRecentActivity] = useState(false); // Nuevo estado

  const loadProfileData = async () => {
    try {
      setError("");
      setLoading(true);

      const credentials = await getStoredCredentials();

      if (!credentials) {
        setError("Please log in to view profile");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const userData: UserSession = {
        id: credentials.userId,
        email: credentials.email,
        admin: false,
        suspended: false,
        created_at: new Date().toISOString(),
      };
      setUser(userData);

      const [statsData, reportsData, systemStatsData] = await Promise.all([
        getUserStats(userData.id).catch((err) => {
          console.warn("Failed to load user stats:", err);
          return null;
        }),
        getReports(1, 100).catch((err) => {
          console.warn("Failed to load reports:", err);
          return { reports: [] };
        }),
        getOverviewStats().catch((err) => {
          console.warn("Failed to load system stats:", err);
          return null;
        }),
      ]);

      setUserStats(statsData);
      setSystemStats(systemStatsData);
      setAllReports(reportsData.reports || []);

      if (userData.admin) {
        try {
          const adminStatsData = await getAdminStats(userData.id);
          setAdminStats(adminStatsData);
        } catch (err) {
          console.warn("Failed to load admin stats:", err);
        }
      }
    } catch (err: any) {
      console.error("Error loading profile data:", err);
      if (
        err.message?.includes("not authenticated") ||
        err.message?.includes("User ID")
      ) {
        setError("Please log in to view profile");
      } else {
        setError(err.message || "Failed to load profile data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleReportPress = (reportId: number) => {
    router.push({
      pathname: "/(modals)/report-view",
      params: { id: reportId.toString() },
    });
  };

  const handleToggleRecentActivity = () => {
    setExpandedRecentActivity(!expandedRecentActivity);
  };

  const getUserSpecificStats = () => {
    if (!user || !allReports.length) {
      return { lastThreeVisited: [] };
    }
    const userReports = allReports.filter(
      (report) => report.created_by === user.id
    );
    return {
      lastThreeVisited: userReports.slice(0, 3),
    };
  };

  const userSpecificStats = getUserSpecificStats();
  const handleLoginRedirect = () => router.replace("/");
  const styles = createStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && error.includes("log in")) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <Text variant="headlineMedium" style={styles.header}>
            Profile
          </Text>
          <Text variant="bodyMedium" style={styles.loginSubtitle}>
            Please log in to view your profile
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
        Profile
      </Text>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && !error.includes("log in") ? (
          <ProfileErrorState error={error} onRetry={loadProfileData} />
        ) : (
          <>
            <UserCard user={user} />

            <StatsSwitchCard
              showSystemStats={showSystemStats}
              onToggle={setShowSystemStats}
            />

            {showSystemStats ? (
              <StatsOverviewCard stats={systemStats} />
            ) : (
              <ReportStats
                filed={userStats?.total_reports}
                resolved={userStats?.resolved_reports}
                pending={userStats?.open_reports}
                pinned={userStats?.pinned_reports_count}
                lastReportDate={userStats?.last_report_date}
              />
            )}

            {user?.admin && adminStats && (
              <AdminStats
                assigned={adminStats?.total_assigned_reports || 0}
                pending={adminStats?.in_progress_reports || 0}
                resolved={adminStats?.resolved_personally || 0}
              />
            )}

            <RecentActivitySection
              reports={userSpecificStats.lastThreeVisited}
              expanded={expandedRecentActivity}
              onToggle={handleToggleRecentActivity}
              onReportPress={handleReportPress}
            />

            {!error && userSpecificStats.lastThreeVisited.length === 0 && (
              <NoActivityState />
            )}
          </>
        )}
      </ScrollView>
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
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 16,
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
    loginSubtitle: {
      textAlign: "center",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    loginButton: {
      marginTop: 16,
      backgroundColor: colors.button.primary,
    },
  });
