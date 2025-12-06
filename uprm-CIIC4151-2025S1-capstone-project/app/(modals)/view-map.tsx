import type { LocationWithReports } from "@/types/interfaces"; // adjust path
import { getLocationsWithReports } from "@/utils/api"; // adjust path
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, DataTable, Text } from "react-native-paper";

export default function ViewMapScreen() {
  const [locations, setLocations] = useState<LocationWithReports[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLocationsWithReports(1, 10);
        setLocations(res.locations || []);
      } catch (err) {
        console.error("Error loading locations:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading top locations...</Text>
      </View>
    );
  }

  if (!locations.length) {
    return (
      <View style={styles.center}>
        <Text>No locations found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Top 10 Locations by Reports
      </Text>

      <DataTable>
        <DataTable.Header>
          <DataTable.Title style={styles.colRank}>#</DataTable.Title>
          <DataTable.Title style={styles.colCity}>Location</DataTable.Title>
          <DataTable.Title numeric style={styles.colCount}>
            Reports
          </DataTable.Title>
        </DataTable.Header>

        {locations.map((loc, index) => (
          <DataTable.Row key={loc.id}>
            <DataTable.Cell style={styles.colRank}>
              <Text>{index + 1}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.colCity}>
              <Text>{loc.city}</Text>
            </DataTable.Cell>
            <DataTable.Cell numeric style={styles.colCount}>
              <Text>{loc.report_count ?? 0}</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { marginBottom: 8 },
  colRank: { flex: 0.7 },
  colCity: { flex: 3 },
  colCount: { flex: 1.3 },
});
