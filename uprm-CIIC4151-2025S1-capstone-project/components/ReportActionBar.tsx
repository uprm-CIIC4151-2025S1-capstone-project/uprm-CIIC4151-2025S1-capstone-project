// components/ReportActionBar.tsx
import { Text, View, StyleSheet } from "react-native";
import { Button, IconButton, Menu } from "react-native-paper";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ReportData, ReportStatus } from "@/types/interfaces";
import { useAppColors } from "@/hooks/useAppColors";
import { useRouter } from "expo-router";

interface ReportActionBarProps {
  report: ReportData;
  onEdit: () => void;
  onRating: () => void;
  onStatusChange: (status: ReportStatus) => void;
  isPinned: boolean;
  onPin: (pinned: boolean) => void;
  isPinning: boolean;
  isRating: boolean;
  isRated: boolean;
  ratingCount: number;
  showBack?: boolean; // <-- optional prop to control internal Back button
}

export const ReportActionBar = ({
  report,
  onEdit,
  onRating,
  onStatusChange,
  isPinned,
  onPin,
  isPinning,
  isRating,
  isRated,
  ratingCount,
  showBack = true, // default true for backward compatibility
}: ReportActionBarProps) => {
  const { user } = useAuth();
  const { colors } = useAppColors();
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const router = useRouter();

  const isAuthor = user?.id === report.created_by;
  const isAdmin = user?.isAdmin;

  // Permission checks
  const canEdit = false; //isAuthor;
  const canChangeStatus = isAdmin;
  const canPin = !!user && !isPinning;
  const canRate = !!user && !isRating;

  // Status options for admin
  const statusOptions = [
    { label: "Open", value: ReportStatus.OPEN },
    { label: "In Progress", value: ReportStatus.IN_PROGRESS },
    { label: "Resolved", value: ReportStatus.RESOLVED },
    { label: "Denied", value: ReportStatus.DENIED },
    { label: "Closed", value: ReportStatus.CLOSED },
  ];

  const styles = createStyles(colors);

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Left side: User actions */}
      <View style={styles.leftActions}>
        {/* Internal Back button (optional) */}
        {showBack && (
          <Button
            mode="text"
            onPress={() => router.back()}
            icon="arrow-left"
            compact
            textColor={colors.text}
            style={{ marginRight: 8 }}
          >
            Back
          </Button>
        )}

        {/* Rating button */}
        {canRate && (
          <View style={styles.ratingContainer}>
            <IconButton
              icon={isRated ? "star" : "star-outline"}
              onPress={onRating}
              size={24}
              disabled={isRating}
              iconColor={isRated ? colors.error : colors.textSecondary}
              accessibilityLabel={isRated ? "Remove rating" : "Add rating"}
            />
            <Text style={styles.ratingCount}>{ratingCount}</Text>
          </View>
        )}

        {/* Show rating count only if user can't rate (not logged in) */}
        {!user && (
          <View style={styles.ratingContainer}>
            <IconButton
              icon="star-outline"
              size={24}
              disabled
              iconColor={colors.textMuted}
            />
            <Text style={[styles.ratingCount, styles.disabledText]}>
              {ratingCount}
            </Text>
          </View>
        )}

        {/* Pin/Unpin button */}
        {canPin && (
          <IconButton
            icon={isPinned ? "bookmark" : "bookmark-outline"}
            onPress={() => onPin(!isPinned)}
            size={24}
            disabled={isPinning}
            iconColor={isPinned ? colors.primary : colors.textSecondary}
            accessibilityLabel={isPinned ? "Unpin report" : "Pin report"}
          />
        )}
      </View>

      {/* Right side: Author and Admin actions */}
      <View style={styles.rightActions}>
        {/* Edit button (author only) */}
        {canEdit && (
          <Button
            mode="outlined"
            onPress={onEdit}
            compact
            icon="pencil"
            style={styles.editButton}
            textColor={colors.primary}
          >
            Edit
          </Button>
        )}

        {/* Status change menu (admin only) */}
        {canChangeStatus && (
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button
                mode="contained"
                onPress={() => setStatusMenuVisible(true)}
                compact
                icon="cog"
                buttonColor={colors.primary}
                textColor={colors.textInverse}
              >
                Status
              </Button>
            }
          >
            {statusOptions.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  onStatusChange(option.value);
                  setStatusMenuVisible(false);
                }}
                title={option.label}
                disabled={option.value === report.status}
                titleStyle={{
                  color:
                    option.value === report.status
                      ? colors.textMuted
                      : colors.text,
                }}
              />
            ))}
          </Menu>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      marginBottom: 16,
    },
    leftActions: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    rightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    ratingCount: {
      marginLeft: -8,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    disabledText: {
      color: colors.textMuted,
    },
    editButton: {
      marginRight: 8,
      borderColor: colors.primary,
    },
  });
