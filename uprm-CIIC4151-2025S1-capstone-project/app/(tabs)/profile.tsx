import AdminStats from "@/components/AdminStats";
import NoActivityState from "@/components/NoActivityState";
import ProfileErrorState from "@/components/ProfileErrorState";
import RecentActivitySection from "@/components/RecentActivitySection";
import UserStatsCard from "@/components/UserStatsCard";
import SystemStatsCard from "@/components/SystemStatsCard";
import StatsSwitchCard from "@/components/StatsSwitchCard";
import UserCard from "@/components/UserCard";
import { useAppColors } from "@/hooks/useAppColors";
import { type ReportData, type UserSession } from "@/types/interfaces";
import {
  getAdminStats,
  getOverviewStats,
  getUserReports,
  getUserStats,
} from "@/utils/api";
import { getStoredCredentials } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, ActivityIndicator, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useAppColors();
  const [user, setUser] = useState<UserSession | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [userRecentReports, setUserRecentReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSystemStats, setShowSystemStats] = useState(false);
  const [expandedRecentActivity, setExpandedRecentActivity] = useState(false);

  const loadProfileData = async () => {
    try {
      setError(null);
      setLoading(true);

      const credentials = await getStoredCredentials();

      if (!credentials) {
        // Esto no debería pasar si siempre hay login, pero por seguridad
        router.replace("/");
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

      // Cargar datos en paralelo
      const [statsData, userReportsData, systemStatsData] = await Promise.all([
        getUserStats(userData.id).catch((err) => {
          console.warn("Failed to load user stats:", err);
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
        // Solo obtenemos los reportes del usuario
        getUserReports(userData.id, 1, 10).catch((err) => {
          console.warn("Failed to load user reports:", err);
          return { reports: [], total: 0, page: 1, limit: 10 };
        }),
        getOverviewStats().catch((err) => {
          console.warn("Failed to load system stats:", err);
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
      setUserRecentReports(userReportsData.reports || []);

      if (userData.admin) {
        try {
          const adminStatsData = await getAdminStats(userData.id);
          setAdminStats(adminStatsData);
        } catch (err) {
          console.warn("Failed to load admin stats:", err);
          setAdminStats({
            total_assigned_reports: 0,
            in_progress_reports: 0,
            resolved_personally: 0,
          });
        }
      }
    } catch (err: any) {
      console.error("Error loading profile data:", err);
      setError(err.message || "Failed to load profile data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleReportPress = (reportId: number) => {
    router.push({
      pathname: "/(modals)/report-view",
      params: { id: reportId.toString() },
    });
  };

  const handleStatsPress = () => {
    router.push("/(modals)/global-stats")
  };

  const handleToggleRecentActivity = () => {
    setExpandedRecentActivity(!expandedRecentActivity);
  };

  // Obtener solo los primeros 3 reportes para la vista collapsed
  const getRecentActivityReports = () => {
    if (expandedRecentActivity) {
      return userRecentReports;
    }
    return userRecentReports.slice(0, 3);
  };

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
        {error ? (
          <ProfileErrorState error={error} onRetry={loadProfileData} />
        ) : (
          <>
            <UserCard user={user} />

            <StatsSwitchCard
              showSystemStats={showSystemStats}
              onToggle={setShowSystemStats}
            />

            {showSystemStats ? (
              <SystemStatsCard stats={systemStats} />
            ) : (
              <UserStatsCard
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
            <Button
              mode="outlined"
              onPress={handleStatsPress}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
              buttonColor={colors.button.primary}
              textColor={colors.button.text}
            >
              View Global Statistics
            </Button>
            <RecentActivitySection
              reports={getRecentActivityReports()}
              expanded={expandedRecentActivity}
              onToggle={handleToggleRecentActivity}
              onReportPress={handleReportPress}
            />

            {!error && userRecentReports.length === 0 && <NoActivityState />}
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
    actionButton: {
      flex: 1,
      borderColor: colors.border,
    },
    actionButtonContent: {
      height: 44,
    },
  });
