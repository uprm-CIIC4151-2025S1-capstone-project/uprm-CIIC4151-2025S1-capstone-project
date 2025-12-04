import AdminStats from "@/components/AdminStats";
import NoActivityState from "@/components/NoActivityState";
import ProfileErrorState from "@/components/ProfileErrorState";
import RecentActivitySection from "@/components/RecentActivitySection";
import UserStatsCard from "@/components/UserStatsCard"; // ← Corregido
import SystemStatsCard from "@/components/SystemStatsCard"; // ← Corregido
import StatsSwitchCard from "@/components/StatsSwitchCard";
import UserCard from "@/components/UserCard";
import { useAppColors } from "@/hooks/useAppColors";
import { type ReportData, type UserSession } from "@/types/interfaces";
import {
  getAdminStats,
  getOverviewStats,
  getReports,
  getUserStats,
} from "@/utils/api";
import { getStoredCredentials } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [expandedRecentActivity, setExpandedRecentActivity] = useState(false);

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
        admin: credentials.admin || false,
        suspended: credentials.suspended || false,
        created_at: new Date().toISOString(),
      };
      setUser(userData);

      // Cargar datos en paralelo con valores por defecto
      const [statsData, reportsData, systemStatsData] = await Promise.all([
        getUserStats(userData.id).catch((err) => {
          console.warn("Failed to load user stats:", err);
          // Valores por defecto para el scoring
          return {
            total_reports: 0,
            open_reports: 0,
            in_progress_reports: 0,
            resolved_reports: 0,
            denied_reports: 0,
            closed_reports: 0,
            pinned_reports_count: 0,
            avg_rating: 0,
            last_report_date: null,
          };
        }),
        getReports(1, 100).catch((err) => {
          console.warn("Failed to load reports:", err);
          return { reports: [] };
        }),
        getOverviewStats().catch((err) => {
          console.warn("Failed to load system stats:", err);
          // Valores por defecto para el scoring del sistema
          return {
            total_reports: 0,
            open_reports: 0,
            in_progress_reports: 0,
            resolved_reports: 0,
            denied_reports: 0,
            closed_reports: 0,
            avg_rating: 0,
            total_users: 0,
            pinned_reports_count: 0,
          };
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
          // Valores por defecto para admin
          setAdminStats({
            total_assigned_reports: 0,
            in_progress_reports: 0,
            resolved_personally: 0,
          });
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
              <SystemStatsCard stats={systemStats} /> // ← Corregido
            ) : (
              <UserStatsCard // ← Corregido
                filed={userStats?.total_reports || 0}
                resolved={userStats?.resolved_reports || 0}
                pending={userStats?.open_reports || 0}
                pinned={userStats?.pinned_reports_count || 0}
                lastReportDate={userStats?.last_report_date || null}
                inProgress={userStats?.in_progress_reports || 0}
                denied={userStats?.denied_reports || 0}
                closed={userStats?.closed_reports || 0}
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
