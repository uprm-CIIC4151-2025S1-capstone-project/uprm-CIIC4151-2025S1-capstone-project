import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { List, DataTable, ActivityIndicator, Text } from "react-native-paper";

import {
  getResolutionRateByDepartment,
  getAvgResolutionTimeByDepartment,
  getMonthlyReportVolume,
  getTopCategoriesPercentage,
} from "@/utils/api";

// ---------- Types (match your API) ----------
type TopCategory = {
  category: string;
  count: number;
  percentage: number; // 0–100
};

type MonthlyVolume = {
  month: string; // e.g. "December"
  count: number;
};

type ResolutionRate = {
  department: string;
  resolution_rate: number; // 0–100
};

type AvgResolutionTime = {
  department: string;
  avg_days: number;
  avg_hours: number;
};

const formatNumber = (value: number | null | undefined, fractionDigits = 2) =>
  typeof value === "number" ? value.toFixed(fractionDigits) : "-";

/**
 * GlobalStatsModal is a React component that displays various global statistics.
 *
 * It fetches the following statistics on mount:
 *   1. Top categories of reports
 *   2. Monthly report volume
 *   3. Resolution rate by department
 *   4. Avg resolution time by department
 *
 * If there is an error fetching the statistics, it displays an error message.
 * If the statistics are still loading, it displays an ActivityIndicator.
 */
const GlobalStatsModal = () => {
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [monthlyVolume, setMonthlyVolume] = useState<MonthlyVolume[]>([]);
  const [resolutionRates, setResolutionRates] = useState<ResolutionRate[]>([]);
  const [avgResolutionTimes, setAvgResolutionTimes] = useState<AvgResolutionTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadError(null);

        const [
          topCategoriesRes,
          monthlyVolumeRes,
          resolutionRatesRes,
          avgResolutionTimesRes,
        ] = await Promise.all([
          getTopCategoriesPercentage(),
          getMonthlyReportVolume(),
          getResolutionRateByDepartment(),
          getAvgResolutionTimeByDepartment(),
        ]);

        console.log("topCategoriesRes", topCategoriesRes);
        console.log("monthlyVolumeRes", monthlyVolumeRes);
        console.log("resolutionRatesRes", resolutionRatesRes);
        console.log("avgResolutionTimesRes", avgResolutionTimesRes);

        // topCategoriesRes: { data: [...] }
        setTopCategories(
          Array.isArray((topCategoriesRes as any).data)
            ? ((topCategoriesRes as any).data as TopCategory[])
            : []
        );

        // monthlyVolumeRes: { data: [...] }
        setMonthlyVolume(
          Array.isArray((monthlyVolumeRes as any).data)
            ? ((monthlyVolumeRes as any).data as MonthlyVolume[])
            : []
        );

        // resolutionRatesRes: plain array
        setResolutionRates(
          Array.isArray(resolutionRatesRes)
            ? (resolutionRatesRes as ResolutionRate[])
            : []
        );

        // avgResolutionTimesRes: plain array
        setAvgResolutionTimes(
          Array.isArray(avgResolutionTimesRes)
            ? (avgResolutionTimesRes as AvgResolutionTime[])
            : []
        );
      } catch (error) {
        console.error("Error loading global stats:", error);
        setLoadError("Error loading statistics.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {loadError && (
        <Text style={{ marginBottom: 8 }} variant="bodyMedium">
          {loadError}
        </Text>
      )}

      {/* 1) Top Categories */}
      <List.Accordion title="Top Categories" id="top-categories">
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Category</DataTable.Title>
            <DataTable.Title numeric>Reports</DataTable.Title>
            <DataTable.Title numeric>%</DataTable.Title>
          </DataTable.Header>

          {topCategories.map((item, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{item.category}</DataTable.Cell>
              <DataTable.Cell numeric>{item.count}</DataTable.Cell>
              <DataTable.Cell numeric>{formatNumber(item.percentage)}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </List.Accordion>

      {/* 2) Monthly Report Volume */}
      <List.Accordion title="Monthly Report Volume" id="monthly-volume">
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Month</DataTable.Title>
            <DataTable.Title numeric>Reports</DataTable.Title>
          </DataTable.Header>

          {monthlyVolume.map((item, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{item.month}</DataTable.Cell>
              <DataTable.Cell numeric>{item.count}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </List.Accordion>

      {/* 3) Resolution Rate by Department */}
      <List.Accordion title="Resolution Rate by Department" id="resolution-rate">
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Department</DataTable.Title>
            <DataTable.Title numeric>Resolution %</DataTable.Title>
          </DataTable.Header>

          {resolutionRates.map((item, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{item.department}</DataTable.Cell>
              <DataTable.Cell numeric>
                {formatNumber(item.resolution_rate)}
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </List.Accordion>

      {/* 4) Avg Resolution Time by Department */}
      <List.Accordion title="Avg Resolution Time by Department" id="avg-resolution-time">
        <DataTable>
            <DataTable.Header>
            <DataTable.Title>Department</DataTable.Title>
            <DataTable.Title numeric>Avg Duration</DataTable.Title>
            </DataTable.Header>

            {avgResolutionTimes.map((item, index) => (
            <DataTable.Row key={index}>
                <DataTable.Cell>{item.department}</DataTable.Cell>
                <DataTable.Cell numeric>
                {item.avg_days}d {item.avg_hours}h
                </DataTable.Cell>
            </DataTable.Row>
            ))}
        </DataTable>
        </List.Accordion>

    </ScrollView>
  );
};

export default GlobalStatsModal;
