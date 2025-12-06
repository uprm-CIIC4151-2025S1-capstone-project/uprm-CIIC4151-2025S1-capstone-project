// app/(tabs)/explore.tsx
import FABCreateReport from "@/components/FABCreateReport";
import { getStoredCredentials } from "@/utils/auth";
import ReportCard from "@/components/ReportCard";
import { useAppColors } from "@/hooks/useAppColors";
import type { ReportCategory, ReportData } from "@/types/interfaces";
import {
  filterReports,
  getReports,
  searchReports,
  checkUserIsAdministrator,
} from "@/utils/api";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Searchbar,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import FilterSheetModal, {
  StatusFilter,
  CategoryFilter,
  SortOrder,
} from "../(modals)/filter-sheet";

/** API response shape used by /reports, /reports/search, /reports/filter */
type ReportsResponse = {
  reports?: ReportData[];
  totalPages?: number;
};

// ------------------------------------------------------------------
// Department → allowed categories (hardcoded business rules)
// ------------------------------------------------------------------
const getDepartmentAllowedCategories = (
  department: string
): CategoryFilter[] => {
  switch (department) {
    case "LUMA":
      return ["street_light", "traffic_signal", "electrical_hazard"];
    case "DTOP":
      return ["pothole", "road_damage", "fallen_tree"];
    case "AAA":
      return ["flooding", "water_outage", "pipe_leak"];
    case "DDS":
      return ["sanitation", "wandering_waste", "sinkhole"];
    default:
      return [];
  }
};

export default function ReportScreen() {
  const router = useRouter();
  const { colors } = useAppColors();

  // data
  const [reports, setReports] = useState<ReportData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // pagination (only for ALL feed)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // search
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // filters & sort
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc"); // newest first

  // location filter (manual dropdown only)
  const [location, setlocation] = useState<string | null>(null);

  // admin info
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDepartment, setAdminDepartment] = useState<string | null>(null);

  // filter sheet visibility
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // debounce
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limit = 10;

  const styles = useMemo(() => createStyles(colors), [colors]);

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const applyAdminDepartmentFilter = (list: ReportData[]): ReportData[] => {
    if (!isAdmin || !adminDepartment) return list;

    const allowed = getDepartmentAllowedCategories(adminDepartment);
    if (!allowed.length) return list; // no mapping → show all

    return list.filter((r) =>
      allowed.includes(r.category as CategoryFilter)
    );
  };

  // -------------------------
  // Fetch helpers
  // -------------------------
  const loadExploreReports = async (page = 1, isRefresh = true) => {
    try {
      if (isRefresh) {
        setError("");
        setRefreshing(true);
      } else {
        setIsLoadingMore(true);
      }

      // If actively searching, the unified search path handles it
      if (query.trim()) return;

      let resp: ReportsResponse;

      if (statusFilter || categoryFilter || location) {
        // Filtered results (server-side; first page only)
        resp = (await filterReports(
          statusFilter || undefined,
          categoryFilter || undefined,
          1,
          limit,
          sortOrder,
          undefined, // locationId removed
          location || undefined
        )) as ReportsResponse;

        const serverReports = resp.reports || [];
        const filteredReports = applyAdminDepartmentFilter(serverReports);

        setReports(filteredReports);
        setCurrentPage(1);
        setTotalPages(resp.totalPages || 1);
      } else {
        // ALL (paginated, server-side sort)
        resp = (await getReports(
          page,
          limit,
          sortOrder,
          undefined, // locationId removed
          location || undefined
        )) as ReportsResponse;

        const serverReports = resp.reports || [];
        const filteredReports = applyAdminDepartmentFilter(serverReports);

        if (isRefresh) {
          setReports(filteredReports);
        } else {
          setReports((prev) => [...prev, ...filteredReports]);
        }
        setCurrentPage(page);
        setTotalPages(resp.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
      console.error("Error loading reports:", err);
    } finally {
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const loadSearchResults = async (q: string, nextStatus?: StatusFilter) => {
    const effectiveStatus = nextStatus ?? statusFilter;

    // If no query and no filters selected, fall back to feed
    if (!q.trim() && !effectiveStatus && !categoryFilter && !location) {
      setIsSearching(false);
      await loadExploreReports(1, true);
      return;
    }

    try {
      setError("");
      setIsSearching(!!q.trim());
      setRefreshing(true);

      const resp = (await searchReports(
        q.trim() || "",
        effectiveStatus || undefined,
        categoryFilter || undefined,
        1,
        limit,
        sortOrder,
        undefined, // locationId removed
        location || undefined
      )) as ReportsResponse;

      const serverReports = resp.reports || [];
      const filteredReports = applyAdminDepartmentFilter(serverReports);

      setReports(filteredReports);
      setCurrentPage(1);
      setTotalPages(resp.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to search");
      console.error("Error searching reports:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // -------------------------
  // Effects
  // -------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const creds = await getStoredCredentials();
        if (creds) {
          const res = await checkUserIsAdministrator(creds.userId);
          console.log("Admin info from /me/admin:", res);

          if (res.admin) {
            setIsAdmin(true);
            setAdminDepartment(res.department || null);
          } else {
            setIsAdmin(false);
            setAdminDepartment(null);
          }
        } else {
          setIsAdmin(false);
          setAdminDepartment(null);
        }
      } catch (err) {
        console.error("Failed to load admin info:", err);
        setIsAdmin(false);
        setAdminDepartment(null);
      } finally {
        await loadExploreReports(1, true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      loadSearchResults(query, statusFilter);
    } else {
      loadExploreReports(1, true);
    }
  }, [statusFilter, categoryFilter, sortOrder, location]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadSearchResults(query);
    }, 350);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  useEffect(() => {
    setReports((prev) => applyAdminDepartmentFilter(prev));
  }, [isAdmin, adminDepartment]);

  // -------------------------
  // UI handlers
  // -------------------------
  const loadMoreReports = async () => {
    if (isSearching) return;
    if (statusFilter || categoryFilter || location) return;
    if (currentPage >= totalPages || isLoadingMore || refreshing) return;
    await loadExploreReports(currentPage + 1, false);
  };

  const onRefresh = () => {
    if (query.trim()) {
      loadSearchResults(query);
    } else {
      loadExploreReports(1, true);
    }
  };

  const handleReportPress = (reportId: number) => {
    router.push({
      pathname: "/(modals)/report-view",
      params: { id: reportId.toString() },
    });
  };

  const handleCreateReport = () => {
    router.push("/(modals)/report-form");
  };

  const renderReportItem = ({ item }: { item: ReportData }) => (
    <ReportCard
      report={{ ...item, category: item.category as ReportCategory }}
      onPress={() => handleReportPress(item.id)}
    />
  );

  const renderFooter = () => {
    if (isSearching || statusFilter || categoryFilter || !isLoadingMore) return null;
    return <ActivityIndicator style={{ paddingVertical: 16 }} size="small" color={colors.primary} />;
  };

  const renderEmptyComponent = () => {
    if (refreshing) return <ActivityIndicator size="large" style={{ marginTop: 32 }} color={colors.primary} />;
    if (error)
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button mode="outlined" onPress={onRefresh} style={styles.retryButton} textColor={colors.error}>
            Retry
          </Button>
        </View>
      );

    const hasFilter = !!(query.trim() || statusFilter || categoryFilter || location);
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{hasFilter ? "No results found." : "No reports available."}</Text>
        <Text style={styles.emptySubtext}>
          {hasFilter ? "Try a different keyword, status, category, city, or sort." : "Be the first to create a report!"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        Explore
      </Text>

      {/* Search + Filter button row */}
      <View style={styles.row}>
        <View style={styles.searchFlex}>
          <Searchbar
            value={query}
            onChangeText={setQuery}
            placeholder="Search reports..."
            style={styles.searchbar}
            inputStyle={{ fontSize: 16, color: colors.text }}
            iconColor={colors.textSecondary}
            clearIcon="close"
          />
        </View>

        <IconButton
          icon="filter-variant"
          onPress={() => setFilterSheetVisible(true)}
          accessibilityLabel="Open filters"
          style={styles.filterBtn}
        />
      </View>

      {/* Results */}
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
        onEndReached={loadMoreReports}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
      />

      <FABCreateReport onPress={handleCreateReport} />

      {/* Filter sheet modal */}
      <FilterSheetModal
        visible={filterSheetVisible}
        onDismiss={() => setFilterSheetVisible(false)}
        status={statusFilter}
        category={categoryFilter}
        sortOrder={sortOrder}
        location={location}
        onApply={({ status, category, sortOrder: nextSort, location }) => {
          setStatusFilter(status);
          setCategoryFilter(category);
          setSortOrder(nextSort);
          setlocation(location || null);

          if (query.trim()) {
            loadSearchResults(query, status);
          } else {
            loadExploreReports(1, true);
          }

          setFilterSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { margin: 16, fontWeight: "bold", color: colors.text, textAlign: "center" },
    row: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
    searchFlex: { flex: 1 },
    searchbar: { borderRadius: 12, backgroundColor: colors.surface, elevation: 0 },
    filterBtn: { margin: 0 },
    listContainer: { paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 },
    errorContainer: { padding: 16, alignItems: "center" },
    errorText: { textAlign: "center", marginBottom: 12, color: colors.error },
    retryButton: { marginTop: 8, borderColor: colors.error },
    emptyContainer: { alignItems: "center", paddingVertical: 32 },
    emptyText: { textAlign: "center", fontSize: 16, marginBottom: 8, color: colors.textSecondary },
    emptySubtext: { textAlign: "center", fontSize: 14, color: colors.textMuted },
    fab: { position: "absolute", margin: 16, right: 0, bottom: 0 },
  });
