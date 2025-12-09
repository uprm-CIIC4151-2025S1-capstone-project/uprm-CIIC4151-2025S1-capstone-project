// app/(modals)/report-view.tsx
import { ReportActionBar } from "@/components/ReportActionBar";
import { ReportDetails } from "@/components/ReportDetails";
import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/useAppColors";
import { useAuth } from "@/hooks/useAuth";
import type { ReportData, ReportStatus } from "@/types/interfaces";
import {
  buildImageUrl,
  changeReportStatus,
  checkReportPinned,
  checkReportRated,
  getReport,
  togglePinReport,
  toggleRating,
} from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Button, Snackbar, Text } from "react-native-paper";

export default function ReportViewModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors } = useAppColors();
  const { user: currentUser } = useAuth();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [isPinned, setIsPinned] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const [isRated, setIsRated] = useState(false); // user-specific
  const [isRating, setIsRating] = useState(false);
  const [ratingCount, setRatingCount] = useState(0); // total likes

  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      setImageError(false);

      const data = await getReport(Number(id));
      setReport(data);
      setRatingCount(data.rating ?? 0); // total likes from backend

      if (currentUser) {
        try {
          const [pinnedStatus, ratedStatus] = await Promise.all([
            checkReportPinned(Number(id)),
            checkReportRated(Number(id)), // user-specific info
          ]);
          console.log("[loadReport] checkReportPinned =>", pinnedStatus);
          setIsPinned(pinnedStatus.pinned);
          setIsRated(ratedStatus.rated);
        } catch (err) {
          console.error("Error checking report status:", err);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load report.");
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReport();
  };

  const handleEdit = () => {
    if (!report) return;
    router.push({
      pathname: "/(modals)/report-form",
      params: { id: report.id.toString(), mode: "edit" },
    });
  };

  const handlePin = async (pinned: boolean) => {
    console.log(
      "[handlePin] pinned param =",
      pinned,
      "current isPinned =",
      isPinned
    );
    if (!report || !currentUser) return;
    try {
      setIsPinning(true);
      await togglePinReport(report.id, pinned);
      setIsPinned(pinned);
      showSnackbar(pinned ? "Report pinned" : "Report unpinned");
    } catch (err: any) {
      console.error("Error toggling pin:", err);
      showSnackbar(err.message || "Failed to update pin status");
    } finally {
      setIsPinning(false);
    }
  };

  const handleRating = async () => {
    if (!report || !currentUser) return;

    // Optimistic UI update
    const newRated = !isRated;
    setIsRated(newRated);
    setRatingCount((prev) => prev + (newRated ? 1 : -1));

    try {
      setIsRating(true);
      const result = await toggleRating(report.id); // server toggles rating
      setIsRated(result.rated);
      setRatingCount(result.rating); // ensure correct total from backend
      showSnackbar(result.rated ? "Rating added" : "Rating removed");
    } catch (err: any) {
      console.error("Error toggling rating:", err);
      // rollback if failed
      setIsRated(!newRated);
      setRatingCount((prev) => prev + (newRated ? -1 : 1));
      showSnackbar(err.message || "Failed to update rating");
    } finally {
      setIsRating(false);
    }
  };

  const handleStatusChange = async (status: ReportStatus) => {
    if (!report || !currentUser?.isAdmin) return;
    try {
      await changeReportStatus(report.id, status, currentUser.id);
      setReport({ ...report, status });
      showSnackbar(`Status updated to ${status}`);
    } catch (err: any) {
      console.error("Error changing status:", err);
      showSnackbar(err.message || "Failed to change status");
    }
  };

  const showSnackbar = (message: string) =>
    setSnackbar({ visible: true, message });
  const hideSnackbar = () => setSnackbar({ visible: false, message: "" });

  const styles = createStyles(colors);
  const rawImageUrl = report?.image_url ?? "";
  const finalImageUri = rawImageUrl ? buildImageUrl(rawImageUrl) : undefined;

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading report...</Text>
      </ThemedView>
    );
  }

  const ErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{error}</Text>
      <Button
        mode="contained"
        onPress={loadReport}
        style={styles.retryButton}
        buttonColor={colors.primary}
      >
        Try Again
      </Button>
      <Button
        mode="outlined"
        onPress={() => router.back()}
        textColor={colors.text}
        style={styles.backButton}
      >
        Go Back
      </Button>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* <View style={styles.header}>
        <Button mode="text" onPress={() => router.back()} icon="arrow-left" textColor={colors.text} compact>
          Back
        </Button>
      </View> */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
          <ErrorState />
        ) : report ? (
          <View style={styles.reportContent}>
            {finalImageUri && !imageError && (
              <View style={styles.imageWrap}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: finalImageUri }}
                    style={styles.image}
                    resizeMode="cover"
                    onError={() => setImageError(true)}
                  />
                </View>
              </View>
            )}

            <ReportActionBar
              report={report}
              onEdit={handleEdit}
              onRating={handleRating}
              onStatusChange={handleStatusChange}
              isPinned={isPinned}
              onPin={handlePin}
              isPinning={isPinning}
              isRating={isRating}
              isRated={isRated}
              ratingCount={ratingCount}
              showBack={false}
            />

            <ReportDetails report={report} ratingCount={ratingCount} />
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Report not found.</Text>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              textColor={colors.text}
              style={styles.backButton}
            >
              Go Back
            </Button>
          </View>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
        action={{ label: "OK", onPress: hideSnackbar }}
      >
        {snackbar.message}
      </Snackbar>
    </ThemedView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    scrollContent: { flexGrow: 1, padding: 16, gap: 16 },
    loadingText: {
      marginTop: 16,
      textAlign: "center",
      color: colors.textSecondary,
    },
    imageWrap: { alignItems: "center", marginBottom: 12 },
    imageContainer: { borderRadius: 8, overflow: "hidden", width: "100%" },
    image: { width: "100%", height: 200 },
    reportContent: { width: "100%" },
    errorContainer: { alignItems: "center", paddingVertical: 32 },
    errorIcon: { fontSize: 48, marginBottom: 16 },
    errorText: {
      color: colors.error,
      textAlign: "center",
      marginBottom: 16,
      fontSize: 16,
    },
    retryButton: { marginBottom: 12, minWidth: 120 },
    backButton: { minWidth: 120 },
  });
