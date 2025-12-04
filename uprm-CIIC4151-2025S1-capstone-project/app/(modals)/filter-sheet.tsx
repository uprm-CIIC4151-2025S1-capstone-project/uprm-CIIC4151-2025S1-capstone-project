// components/modals/filter-sheet.tsx
import { useAppColors } from "@/hooks/useAppColors";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  Divider,
  Modal,
  Portal,
  RadioButton,
  Text,
} from "react-native-paper";

// Shared filter types (we'll import these in explore.tsx)
export type StatusFilter = "" | "open" | "in_progress" | "resolved" | "denied";
export type CategoryFilter =
  | ""
  | "pothole"
  | "street_light"
  | "traffic_signal"
  | "road_damage"
  | "sanitation"
  | "flooding"
  | "water_outage"
  | "wandering_waste"
  | "electrical_hazard"
  | "sinkhole"
  | "fallen_tree"
  | "pipe_leak"
  | "none";
export type SortOrder = "asc" | "desc"; // asc = oldest first, desc = newest first

type Props = {
  visible: boolean;
  onDismiss: () => void;

  status: StatusFilter;
  category: CategoryFilter;
  sortOrder: SortOrder;

  onApply: (filters: {
    status: StatusFilter;
    category: CategoryFilter;
    sortOrder: SortOrder;
  }) => void;
};

export default function FilterSheetModal(props: Props) {
  const { visible, onDismiss, status, category, sortOrder, onApply } = props;
  const { colors } = useAppColors();

  const [localStatus, setLocalStatus] = useState<StatusFilter>(status);
  const [localCategory, setLocalCategory] = useState<CategoryFilter>(category);
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>(sortOrder);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleClear = () => {
    setLocalStatus("");
    setLocalCategory("");
    setLocalSortOrder("desc"); // default: newest first
  };

  const handleApply = () => {
    onApply({
      status: localStatus,
      category: localCategory,
      sortOrder: localSortOrder,
    });
    onDismiss();
  };

  const handleDismiss = () => {
    // Reset local values if user closes without applying
    setLocalStatus(status);
    setLocalCategory(category);
    setLocalSortOrder(sortOrder);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.sheet}
      >
        <Text variant="titleMedium" style={styles.title}>
          Filters
        </Text>

        {/* Status section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            Status
          </Text>
          <View style={styles.chipRow}>
            <Chip
              style={styles.chip}
              mode={localStatus === "" ? "flat" : "outlined"}
              selected={localStatus === ""}
              onPress={() => setLocalStatus("")}
            >
              All
            </Chip>
            <Chip
              style={styles.chip}
              mode={localStatus === "open" ? "flat" : "outlined"}
              selected={localStatus === "open"}
              onPress={() => setLocalStatus("open")}
            >
              Open
            </Chip>
            <Chip
              style={styles.chip}
              mode={localStatus === "in_progress" ? "flat" : "outlined"}
              selected={localStatus === "in_progress"}
              onPress={() => setLocalStatus("in_progress")}
            >
              In progress
            </Chip>
            <Chip
              style={styles.chip}
              mode={localStatus === "resolved" ? "flat" : "outlined"}
              selected={localStatus === "resolved"}
              onPress={() => setLocalStatus("resolved")}
            >
              Resolved
            </Chip>
            <Chip
              style={styles.chip}
              mode={localStatus === "denied" ? "flat" : "outlined"}
              selected={localStatus === "denied"}
              onPress={() => setLocalStatus("denied")}
            >
              Denied
            </Chip>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Category section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            Category
          </Text>
          <View style={styles.chipRow}>
            <Chip
              style={styles.chip}
              mode={localCategory === "" ? "flat" : "outlined"}
              selected={localCategory === ""}
              onPress={() => setLocalCategory("")}
            >
              All
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "pothole" ? "flat" : "outlined"}
              selected={localCategory === "pothole"}
              onPress={() => setLocalCategory("pothole")}
            >
              Pothole
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "street_light" ? "flat" : "outlined"}
              selected={localCategory === "street_light"}
              onPress={() => setLocalCategory("street_light")}
            >
              Street light
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "traffic_signal" ? "flat" : "outlined"}
              selected={localCategory === "traffic_signal"}
              onPress={() => setLocalCategory("traffic_signal")}
            >
              Traffic signal
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "road_damage" ? "flat" : "outlined"}
              selected={localCategory === "road_damage"}
              onPress={() => setLocalCategory("road_damage")}
            >
              Road damage
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "sanitation" ? "flat" : "outlined"}
              selected={localCategory === "sanitation"}
              onPress={() => setLocalCategory("sanitation")}
            >
              Sanitation
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "flooding" ? "flat" : "outlined"}
              selected={localCategory === "flooding"}
              onPress={() => setLocalCategory("flooding")}
            >
              Flooding
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "water_outage" ? "flat" : "outlined"}
              selected={localCategory === "water_outage"}
              onPress={() => setLocalCategory("water_outage")}
            >
              Water outage
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "wandering_waste" ? "flat" : "outlined"}
              selected={localCategory === "wandering_waste"}
              onPress={() => setLocalCategory("wandering_waste")}
            >
              Wandering waste
            </Chip>

            <Chip
              style={styles.chip}
              mode={
                localCategory === "electrical_hazard" ? "flat" : "outlined"
              }
              selected={localCategory === "electrical_hazard"}
              onPress={() => setLocalCategory("electrical_hazard")}
            >
              Electrical hazard
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "sinkhole" ? "flat" : "outlined"}
              selected={localCategory === "sinkhole"}
              onPress={() => setLocalCategory("sinkhole")}
            >
              Sinkhole
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "fallen_tree" ? "flat" : "outlined"}
              selected={localCategory === "fallen_tree"}
              onPress={() => setLocalCategory("fallen_tree")}
            >
              Fallen tree
            </Chip>

            <Chip
              style={styles.chip}
              mode={localCategory === "pipe_leak" ? "flat" : "outlined"}
              selected={localCategory === "pipe_leak"}
              onPress={() => setLocalCategory("pipe_leak")}
            >
              Pipe leak
            </Chip>

          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Sort section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            Date
          </Text>
          <RadioButton.Group
            onValueChange={(v) => setLocalSortOrder(v as SortOrder)}
            value={localSortOrder}
          >
            <View style={styles.radioRow}>
              <RadioButton value="desc" />
              <Text style={styles.radioLabel}>Newest first</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="asc" />
              <Text style={styles.radioLabel}>Oldest first</Text>
            </View>
          </RadioButton.Group>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button mode="text" onPress={handleClear} style={styles.footerBtn}>
            Clear
          </Button>
          <Button mode="contained" onPress={handleApply} style={styles.footerBtn}>
            Apply
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    sheet: {
      margin: 16,
      borderRadius: 16,
      padding: 16,
      backgroundColor: colors.surface,
    },
    title: {
      textAlign: "center",
      marginBottom: 8,
      fontWeight: "600",
      color: colors.text,
    },
    section: {
      marginTop: 8,
      marginBottom: 8,
    },
    sectionTitle: {
      marginBottom: 6,
      color: colors.textSecondary,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      marginBottom: 4,
    },
    divider: {
      marginVertical: 8,
      backgroundColor: colors.divider,
    },
    radioRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
    },
    radioLabel: {
      color: colors.text,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 12,
    },
    footerBtn: {
      flex: 1,
    },
  });
