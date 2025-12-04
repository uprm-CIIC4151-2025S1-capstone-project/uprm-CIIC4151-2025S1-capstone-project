// components/SystemStatsCard.tsx
import StatsCard, { StatsCardProps } from "@/components/StatsCard";
import { useAppColors } from "@/hooks/useAppColors";
import { ReportStatus } from "@/types/interfaces";
import { calculateResolutionScore, STATUS_SCORES } from "@/utils/scoring";

interface SystemStatsCardProps {
  stats: any;
}

export default function SystemStatsCard({ stats }: SystemStatsCardProps) {
  const { colors } = useAppColors();

  if (!stats) return null;

  // Extraer valores
  const totalReports = stats.total_reports || 0;
  const openReports = stats.open_reports || 0;
  const inProgressReports = stats.in_progress_reports || 0;
  const resolvedReports = stats.resolved_reports || 0;
  const deniedReports = stats.denied_reports || 0;
  const closedReports = stats.closed_reports || 0; // Suma de resolved + denied
  const pinnedReports = stats.pinned_reports_count || 0;

  // Verificar que closed sea consistente
  const calculatedClosed = resolvedReports + deniedReports;
  const displayClosed = closedReports > 0 ? closedReports : calculatedClosed;

  // Calcular total real (debe coincidir con total_reports del backend)
  const calculatedTotal = openReports + inProgressReports + displayClosed;

  // Usar total del backend si está disponible, sino calcularlo
  const displayTotal = totalReports > 0 ? totalReports : calculatedTotal;

  // Distribución para scoring (sin "closed" porque es suma)
  const statusDistribution = {
    [ReportStatus.OPEN]: openReports,
    [ReportStatus.IN_PROGRESS]: inProgressReports,
    [ReportStatus.RESOLVED]: resolvedReports,
    [ReportStatus.DENIED]: deniedReports,
    [ReportStatus.CLOSED]: closedReports,
  };

  const resolutionMetrics = calculateResolutionScore(statusDistribution);

  // Stats para mostrar
  const statsData: StatsCardProps["stats"] = [
    {
      label: "Total",
      value: displayTotal,
      color: colors.primary,
      description: "All reports",
    },
    {
      label: "Resolved",
      value: resolvedReports,
      color: colors.success,
      description: `+${STATUS_SCORES[ReportStatus.RESOLVED]} pts`,
    },
    {
      label: "Closed",
      value: displayClosed,
      color: "#673AB7",
      description: "Resolved + Denied",
    },
    {
      label: "In Progress",
      value: inProgressReports,
      color: colors.info,
      description: `+${STATUS_SCORES[ReportStatus.IN_PROGRESS]} pts`,
    },
    {
      label: "Open",
      value: openReports,
      color: colors.warning,
      description: `+${STATUS_SCORES[ReportStatus.OPEN]} pts`,
    },
    {
      label: "Denied",
      value: deniedReports,
      color: colors.error,
      description: `+${STATUS_SCORES[ReportStatus.DENIED]} pts`,
    },
  ];

  const additionalFooterItems: StatsCardProps["additionalFooterItems"] = [
    {
      icon: "account-group",
      label: "Total Users",
      value: stats.total_users || 0,
      color: colors.info,
    },
    {
      icon: "star",
      label: "Avg Rating",
      value: stats.avg_rating ? stats.avg_rating.toFixed(1) : "0.0",
      color: colors.warning,
    },
    {
      icon: "pin",
      label: "Pinned",
      value: pinnedReports,
      color: "#9C27B0",
    },
    {
      icon: "chart-pie",
      label: "Resolution Rate",
      value: `${Math.round((displayClosed / displayTotal) * 100) || 0}%`,
      color: colors.success,
    },
  ];

  return (
    <StatsCard
      title="System Overview"
      icon="earth"
      stats={statsData}
      showScore={true}
      resolutionMetrics={resolutionMetrics}
      additionalFooterItems={additionalFooterItems}
    />
  );
}
