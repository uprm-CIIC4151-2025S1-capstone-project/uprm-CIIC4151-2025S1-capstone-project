import type { LocationWithReports } from "@/types/interfaces"; // adjust path
import { getLocationsWithReports } from "@/utils/api"; // adjust path
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, DataTable, Text } from "react-native-paper";

/**
 * Displays a list of the top 10 locations by the number of reports
 * submitted at each location.
 *
 * Uses the `getLocationsWithReports` API to fetch the list of
 * locations with their report counts.
 *
 * Renders a loading indicator while the data is being fetched.
 *
 * If the data fetch fails, it logs an error message to the console.
 *
 * If no locations are found, it displays a message indicating that.
 *
 * @returns A React component that displays a list of the top 10
 * locations by the number of reports.
 */
export default function ViewMapScreen() {
  const [locations, setLocations] = useState<LocationWithReports[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getLocationsWithReports(1, 10);
        setLocations(response.locations || []);
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
          {/* Removed the rank column header */}
          <DataTable.Title style={styles.colCity}>Location</DataTable.Title>
          <DataTable.Title numeric style={styles.colCount}>
            Reports
          </DataTable.Title>
        </DataTable.Header>

        {locations.map((loc, index) => (
          <DataTable.Row key={loc.id}>
            {/* Removed the rank column cell */}
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
  colCity: { flex: 3 },
  colCount: { flex: 1.3 },
});
