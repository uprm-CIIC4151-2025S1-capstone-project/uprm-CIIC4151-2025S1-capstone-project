import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Badge, Card, Text, Chip } from "react-native-paper";
import type { ReportData } from "@/types/interfaces";
import { ReportStatus, ReportCategory } from "@/types/interfaces";
import { useAppColors } from "@/hooks/useAppColors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { buildImageUrl } from "@/utils/api";

interface ReportCardProps {
  report: Omit<ReportData, "category"> & { category: ReportCategory };
  onPress?: () => void;
}

export default function ReportCard({ report, onPress }: ReportCardProps) {
  const router = useRouter();
  const { colors } = useAppColors();

  const handlePress =
    onPress ??
    (() =>
      router.push({
        pathname: "/(modals)/report-view",
        params: { id: report.id },
      }));

  const getStatusStyles = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.OPEN:
        return {
          backgroundColor: colors.reportStatus.open,
          color: colors.textInverse,
        };
      case ReportStatus.IN_PROGRESS:
        return {
          backgroundColor: colors.reportStatus.in_progress,
          color: colors.textInverse,
        };
      case ReportStatus.RESOLVED:
        return {
          backgroundColor: colors.reportStatus.resolved,
          color: colors.textInverse,
        };
      case ReportStatus.DENIED:
        return {
          backgroundColor: colors.reportStatus.denied,
          color: colors.textInverse,
        };
      case ReportStatus.CLOSED:
        return {
          backgroundColor: colors.reportStatus.closed,
          color: colors.textInverse,
        };
      default:
        return {
          backgroundColor: colors.chip.background,
          color: colors.chip.text,
        };
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.OPEN:
        return "Open";
      case ReportStatus.IN_PROGRESS:
        return "In Progress";
      case ReportStatus.RESOLVED:
        return "Resolved";
      case ReportStatus.DENIED:
        return "Denied";
      case ReportStatus.CLOSED:
        return "Closed";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: ReportCategory) => {
    switch (category) {
      case ReportCategory.POTHOLE:
        return "Pothole";
      case ReportCategory.STREET_LIGHT:
        return "Street Light";
      case ReportCategory.TRAFFIC_SIGNAL:
        return "Traffic Signal";
      case ReportCategory.ROAD_DAMAGE:
        return "Road Damage";
      case ReportCategory.SANITATION:
        return "Sanitation";
      case ReportCategory.FLOODING:
        return "Flooding";
      case ReportCategory.WATER_OUTAGE:
        return "Water Outage";
      case ReportCategory.WANDERING_WASTE:
        return "Wandering Waste";
      case ReportCategory.ELECTRICAL_HAZARD:
        return "Electrical Hazard";
      case ReportCategory.SINKHOLE:
        return "Sinkhole";
      case ReportCategory.FALLEN_TREE:
        return "Fallen Tree";
      case ReportCategory.PIPE_LEAK:
        return "Pipe Leak";
      default:
        return category;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ----------------------------------------------------------------------------
  // IMAGE HANDLING
  // ----------------------------------------------------------------------------
  const rawImageUrl = report.image_url || "";

  const hasValidImage =
    !!rawImageUrl &&
    !rawImageUrl.includes("via.placeholder.com") &&
    !rawImageUrl.includes("No+Image+Available");

  // Turn "/uploads/uuid.jpg" into "http://192.168.x.x:5000/uploads/uuid.jpg"
  const finalImageUri = hasValidImage ? buildImageUrl(rawImageUrl) : undefined;

  const statusStyles = getStatusStyles(report.status);
  const styles = createStyles(colors);

  const numericRating = Number(report.rating ?? 0);
  return (
    <Card
      onPress={handlePress}
      style={styles.card}
      mode="elevated"
      accessibilityLabel={`Report card for ${report.title}`}
      testID={`report-card-${report.id}`}
    >
      {/* Show image only if we have a valid URL */}
      {finalImageUri && (
        <Card.Cover source={{ uri: finalImageUri }} style={styles.cardCover} />
      )}

      <Card.Content
        style={[
          styles.cardContent,
          !finalImageUri && styles.cardContentNoImage,
        ]}
      >
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {report.title}
          </Text>
          <Badge
            style={[
              styles.badge,
              { backgroundColor: statusStyles.backgroundColor },
            ]}
            size={16}
          >
            {/* If you want the text inside the badge, uncomment: */}
            {/* {getStatusLabel(report.status)} */}
          </Badge>
        </View>

        <View style={styles.metaRow}>
          <Chip
            mode="outlined"
            style={styles.categoryChip}
            textStyle={styles.categoryText}
            compact
          >
            {/* {getCategoryIcon(report.category)}{" "} */}
            {getCategoryLabel(report.category)}
          </Chip>
          {/* If you want to show the report ID, uncomment: */}
          {/* <Text variant="bodySmall" style={styles.reportId}>
            #{report.id}
          </Text> */}
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="calendar-plus"
              size={14}
              color={colors.textMuted}
              style={styles.metaIcon}
            />
            <Text variant="bodySmall" style={styles.metaLabel}>
              Created at:
            </Text>
            <Text variant="bodySmall" style={styles.metaValue}>
              {formatDate(report.created_at)}
            </Text>
          </View>

          {report.resolved_at && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={14}
                color={colors.success}
                style={styles.metaIcon}
              />
              <Text variant="bodySmall" style={styles.metaLabel}>
                Resolved at:
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.metaValue, styles.resolvedValue]}
              >
                {formatDate(report.resolved_at)}
              </Text>
            </View>
          )}

          {numericRating > 0 && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="thumb-up-outline"
                size={14}
                color={colors.warning}
                style={styles.metaIcon}
              />
              <Text variant="bodySmall" style={styles.metaLabel}>
                Rating:
              </Text>
              <Text variant="bodySmall" style={styles.ratingValue}>
                {numericRating}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      marginVertical: 8,
      overflow: "hidden",
      backgroundColor: colors.card,
    },
    cardCover: {
      height: 160,
    },
    cardContent: {
      paddingVertical: 12,
      gap: 12,
    },
    cardContentNoImage: {
      paddingTop: 16,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 8,
    },
    title: {
      flex: 1,
      fontWeight: "600",
      lineHeight: 22,
      color: colors.text,
    },
    badge: {
      alignSelf: "flex-start",
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    categoryChip: {
      height: 28,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.chip.background,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.chip.text,
    },
    reportId: {
      fontWeight: "500",
      color: colors.textMuted,
    },
    metadata: {
      gap: 8,
    },
    metaItem: {
      flexDirection: "row",
      gap: 8,
    },
    metaIcon: {
      marginRight: 4,
    },
    metaLabel: {
      fontWeight: "600",
      color: colors.textMuted,
    },
    metaValue: {
      fontWeight: "500",
      color: colors.text,
    },
    resolvedValue: {
      color: colors.success,
      fontWeight: "600",
    },
    ratingValue: {
      color: colors.warning,
      fontWeight: "600",
      fontSize: 14,
    },
  });
