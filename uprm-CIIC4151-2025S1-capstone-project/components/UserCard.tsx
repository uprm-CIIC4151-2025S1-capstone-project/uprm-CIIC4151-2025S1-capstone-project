import { StyleSheet, View } from "react-native";
import { Text, Card } from "react-native-paper";
import type { UserCardProps } from "@/types/interfaces";
import { useAppColors } from "@/hooks/useAppColors";

/**
 * UserCard component
 *
 * Displays a user card with their avatar, username, email, and roles.
 *
 * @param {UserCardProps} props - Properties passed to the component
 * @returns {JSX.Element} - The rendered component
 */

export default function UserCard({ user }: UserCardProps) {
  const { colors } = useAppColors();

  const styles = createStyles(colors);

  if (!user) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.username}>
              Guest User
            </Text>
            <Text variant="bodyMedium" style={styles.muted}>
              Sign in to view profile
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={[styles.avatar, user.admin && styles.adminAvatar]}>
          <Text style={styles.avatarText}>
            {user.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.username}>
            {user.email.split("@")[0]}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user.email}
          </Text>
          <View style={styles.badges}>
            <Text style={[styles.badge, user.admin && styles.adminBadge]}>
              {user.admin ? "Administrator" : "User"}
            </Text>
            <Text
              style={[
                styles.badge,
                user.suspended ? styles.suspendedBadge : styles.activeBadge,
              ]}
            >
              {user.suspended ? "Suspended" : "Active"}
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.muted}>
            Joined {new Date(user.created_at).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      marginBottom: 8,
      elevation: 2,
      boxShadow: `0px 1px 2px ${colors.border || "#0000001a"}`,
      backgroundColor: colors.card,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    adminAvatar: {
      backgroundColor: colors.infoContainer,
    },
    avatarText: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
    },
    info: {
      flex: 1,
      gap: 4,
    },
    username: {
      fontWeight: "600",
      fontSize: 18,
      color: colors.text,
    },
    email: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    badges: {
      flexDirection: "row",
      gap: 8,
      marginTop: 4,
    },
    badge: {
      fontSize: 12,
      fontWeight: "600",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: "hidden",
    },
    adminBadge: {
      backgroundColor: colors.infoContainer,
      color: colors.info,
    },
    activeBadge: {
      backgroundColor: colors.successContainer,
      color: colors.success,
    },
    suspendedBadge: {
      backgroundColor: colors.errorContainer,
      color: colors.error,
    },
    muted: {
      color: colors.textMuted,
      marginTop: 4,
    },
  });
