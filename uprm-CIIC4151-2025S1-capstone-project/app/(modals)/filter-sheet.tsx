// components/modals/filter-sheet.tsx
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
  Menu,
} from "react-native-paper";
import { useAppColors } from "@/hooks/useAppColors";

// Shared filter types
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
export type SortOrder = "asc" | "desc";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  status: StatusFilter;
  category: CategoryFilter;
  sortOrder: SortOrder;
  location?: string | null;
  onApply: (filters: {
    status: StatusFilter;
    category: CategoryFilter;
    sortOrder: SortOrder;
    location?: string | null;
  }) => void;
};

// All 78 municipalities in Puerto Rico
const cities = [
  "Adjuntas","Aguada","Aguadilla","Aguas Buenas","Aibonito","Añasco","Arecibo","Arroyo",
  "Barceloneta","Barranquitas","Bayamón","Cabo Rojo","Caguas","Camuy","Canóvanas","Carolina",
  "Cataño","Cayey","Ceiba","Ciales","Cidra","Coamo","Comerío","Corozal","Culebra","Dorado",
  "Fajardo","Florida","Guánica","Guayama","Guayanilla","Guaynabo","Gurabo","Hatillo","Hormigueros",
  "Humacao","Isabela","Jayuya","Juana Díaz","Juncos","Lajas","Lares","Las Marías","Las Piedras",
  "Loíza","Luquillo","Manatí","Maricao","Maunabo","Mayagüez","Moca","Morovis","Naguabo","Naranjito",
  "Orocovis","Patillas","Peñuelas","Ponce","Quebradillas","Rincón","Río Grande","Sabana Grande",
  "Salinas","San Germán","San Juan","San Lorenzo","San Sebastián","Santa Isabel","Toa Alta",
  "Toa Baja","Trujillo Alto","Utuado","Vega Alta","Vega Baja","Vieques","Villalba","Yabucoa","Yauco"
];

export default function FilterSheetModal(props: Props) {
  const { visible, onDismiss, status, category, sortOrder, location, onApply } = props;
  const { colors } = useAppColors();

  const [localStatus, setLocalStatus] = useState<StatusFilter>(status);
  const [localCategory, setLocalCategory] = useState<CategoryFilter>(category);
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>(sortOrder);
  const [localLocation, setLocalLocation] = useState<string>(location || "");
  const [menuVisible, setMenuVisible] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleClear = () => {
    setLocalStatus("");
    setLocalCategory("");
    setLocalSortOrder("desc");
    setLocalLocation("");
  };

  const handleApply = () => {
    onApply({
      status: localStatus,
      category: localCategory,
      sortOrder: localSortOrder,
      location: localLocation || null,
    });
    onDismiss();
  };

  const handleDismiss = () => {
    setLocalStatus(status);
    setLocalCategory(category);
    setLocalSortOrder(sortOrder);
    setLocalLocation(location || "");
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
            {["", "open", "in_progress", "resolved", "denied"].map((s) => (
              <Chip
                key={s}
                style={styles.chip}
                mode={localStatus === s ? "flat" : "outlined"}
                selected={localStatus === s}
                onPress={() => setLocalStatus(s as StatusFilter)}
              >
                {s === "" ? "All" : s.replace("_", " ")}
              </Chip>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Category section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            Category
          </Text>
          <View style={styles.chipRow}>
            {[
              "",
              "pothole","street_light","traffic_signal","road_damage","sanitation",
              "flooding","water_outage","wandering_waste","electrical_hazard",
              "sinkhole","fallen_tree","pipe_leak",
            ].map((c) => (
              <Chip
                key={c}
                style={styles.chip}
                mode={localCategory === c ? "flat" : "outlined"}
                selected={localCategory === c}
                onPress={() => setLocalCategory(c as CategoryFilter)}
              >
                {c === "" ? "All" : c.replace("_", " ")}
              </Chip>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Location section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            City
          </Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={{ marginBottom: 8 }}
              >
                {localLocation || "All"}
              </Button>
            }
          >
            {/* "All" option */}
            <Menu.Item
              key="all"
              onPress={() => {
                setLocalLocation("");
                setMenuVisible(false);
              }}
              title="All"
            />
            {cities.map((city) => (
              <Menu.Item
                key={city}
                onPress={() => {
                  setLocalLocation(city);
                  setMenuVisible(false);
                }}
                title={city}
              />
            ))}
          </Menu>
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
