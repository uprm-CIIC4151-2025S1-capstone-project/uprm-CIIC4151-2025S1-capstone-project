import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Text, Chip, Button } from "react-native-paper";
import type { ReportData } from "@/types/interfaces";
import { getUser } from "@/utils/api";
import { useAppColors } from "@/hooks/useAppColors";

interface UserDetails {
  id: number;
  email?: string;
  admin?: boolean;
  suspended?: boolean;
}

interface ReportDetailsProps {
  report: ReportData;
  ratingCount: number;
}

export const ReportDetails = ({ report, ratingCount }: ReportDetailsProps) => {
  const { colors } = useAppColors();
  const styles = createStyles(colors);

  const [userDetails, setUserDetails] = useState<Record<number, UserDetails>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      setLoadingUsers(true);
      const userIds = Array.from(
        new Set([report.created_by, report.validated_by, report.resolved_by].filter(Boolean) as number[])
      );
      const newUsers: Record<number, UserDetails> = {};
      for (const id of userIds) {
        if (userDetails[id]) {
          newUsers[id] = userDetails[id];
          continue;
        }
        try {
          const u = await getUser(id);
          newUsers[id] = u;
        } catch {
          newUsers[id] = { id, email: `user${id}@example.com` };
        }
      }
      if (mounted && Object.keys(newUsers).length > 0) {
        setUserDetails((prev) => ({ ...prev, ...newUsers }));
      }
      if (mounted) setLoadingUsers(false);
    };
    loadUsers();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.created_by, report.validated_by, report.resolved_by]);

  // --- Location string: prefer top-level `report.city`, then `report.location.city`
  const locationString = useMemo(() => {
    // backend sometimes returns `city` at top-level (handler.map_to_dict),
    // other times nested under location object. Cover both.
    const topCity = (report as any).city;
    if (topCity && typeof topCity === "string" && topCity.trim() !== "") return topCity;
    const nestedCity = (report.location as any)?.city;
    if (nestedCity && typeof nestedCity === "string" && nestedCity.trim() !== "") return nestedCity;
    return "Unknown";
  }, [report]);

  const getUserDisplayName = (userId?: number) => {
    if (!userId) return "-";
    const u = userDetails[userId];
    if (!u) return loadingUsers ? "Loading..." : `User #${userId}`;
    return u.email || `User #${userId}`;
  };

  const getUserInitials = (userId?: number) => {
    if (!userId) return "U";
    const u = userDetails[userId];
    const email = u?.email;
    if (!email) return String(userId).slice(-1);
    return email.charAt(0).toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "open": return colors.reportStatus.open;
      case "in_progress": return colors.reportStatus.in_progress;
      case "resolved": return colors.reportStatus.resolved;
      case "denied": return colors.reportStatus.denied;
      case "closed": return colors.reportStatus.closed;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const openMap = () => {
    if (report.location?.latitude && report.location?.longitude) {
      const { latitude, longitude } = report.location;
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
    }
  };

  const hasCoords = !!(report.location?.latitude && report.location?.longitude);

  return (
    <View style={styles.reportCard}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>{getUserInitials(report.created_by)}</Text>
          </View>
          <View>
            <Text variant="titleMedium" style={styles.userName}>{getUserDisplayName(report.created_by)}</Text>
            <Text variant="bodySmall" style={styles.timestamp}>{formatDate(report.created_at)}</Text>
          </View>
        </View>
        <Chip
          mode="outlined"
          style={[styles.statusChip, { backgroundColor: getStatusColor(report.status) }]}
          textStyle={styles.statusText}
        >
          {""}
        </Chip>
      </View>

      {/* Report Info */}
      <Text variant="headlineSmall" style={styles.title}>{report.title}</Text>
      <Chip mode="outlined" style={styles.categoryChip} textStyle={styles.categoryText}>{report.category}</Chip>
      <Text variant="bodyMedium" style={styles.description}>{report.description}</Text>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={styles.statLabel}>Rating</Text>
          <Text variant="titleSmall" style={styles.statValue}>{ratingCount} {ratingCount === 1 ? "like" : "likes"}</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={styles.statLabel}>Updated</Text>
          <Text variant="bodySmall" style={styles.statValue}>{formatDate(report.updated_at)}</Text>
        </View>
        {report.resolved_at && (
          <View style={styles.statItem}>
            <Text variant="bodySmall" style={styles.statLabel}>Resolved</Text>
            <Text variant="bodySmall" style={styles.statValue}>{formatDate(report.resolved_at)}</Text>
          </View>
        )}
      </View>

      {/* Location */}
      {(report.location_id || report.location || (report as any).city) && (
        <View style={styles.locationSection}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Location</Text>
          <Text variant="bodyMedium" style={styles.locationText}>{locationString}</Text>

          {/* Map button intentionally removed — kept in case you want to re-enable:
          <Button mode="outlined" icon="map" onPress={openMap} disabled={!hasCoords} style={styles.mapButton}>
            View on Map
          </Button>
          */}
        </View>
      )}

      {/* Admin */}
      {(report.validated_by || report.resolved_by) && (
        <View style={styles.adminSection}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Administration</Text>
          {report.validated_by && (
            <View style={styles.adminItem}>
              <Text variant="bodySmall" style={styles.adminLabel}>Validated by:</Text>
              <Text variant="bodySmall" style={styles.adminValue}>{getUserDisplayName(report.validated_by)}</Text>
            </View>
          )}
          {report.resolved_by && (
            <View style={styles.adminItem}>
              <Text variant="bodySmall" style={styles.adminLabel}>Resolved by:</Text>
              <Text variant="bodySmall" style={styles.adminValue}>{getUserDisplayName(report.resolved_by)}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    reportCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    headerSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    userInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
    userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
    userInitials: { color: colors.textInverse, fontWeight: "600", fontSize: 16 },
    userName: { fontWeight: "600", color: colors.text, marginBottom: 2 },
    timestamp: { color: colors.textMuted, fontSize: 12 },
    statusChip: { height: 24 },
    statusText: { color: colors.textInverse, fontSize: 10, fontWeight: "600" },
    title: { fontWeight: "700", color: colors.text, marginBottom: 8, lineHeight: 28 },
    categoryChip: { alignSelf: "flex-start", marginBottom: 16, backgroundColor: colors.chip.background },
    categoryText: { color: colors.chip.text, fontSize: 12, fontWeight: "500" },
    description: { color: colors.textSecondary, lineHeight: 20, marginBottom: 16 },
    statsSection: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 16 },
    statItem: { alignItems: "center" },
    statLabel: { color: colors.textMuted, marginBottom: 4 },
    statValue: { color: colors.text, fontWeight: "600" },
    locationSection: { marginBottom: 16 },
    sectionTitle: { fontWeight: "600", color: colors.text, marginBottom: 8 },
    locationText: { color: colors.text, fontSize: 14, fontWeight: "500", marginBottom: 8 },
    mapButton: { alignSelf: "flex-start" },
    adminSection: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 16 },
    adminItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    adminLabel: { color: colors.textMuted },
    adminValue: { color: colors.text, fontWeight: "500" },
  });

export default ReportDetails;
