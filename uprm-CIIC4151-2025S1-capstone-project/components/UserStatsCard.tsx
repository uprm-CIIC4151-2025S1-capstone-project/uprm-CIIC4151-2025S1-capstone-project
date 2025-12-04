// components/UserStatsCard.tsx
import StatsCard, { StatsCardProps } from "./StatsCard";
import { useAppColors } from "@/hooks/useAppColors";
import { ReportStatus } from "@/types/interfaces";
import { calculateResolutionScore, STATUS_SCORES } from "@/utils/scoring";

export interface UserStatsCardProps {
  filed: number;
  resolved: number;
  pending: number;
  pinned: number;
  lastReportDate: string | null;
  inProgress?: number;
  denied?: number;
  closed?: number;
}

export default function UserStatsCard({
  filed,
  resolved,
  pending,
  pinned,
  lastReportDate,
  inProgress = 0,
  denied = 0,
  closed = 0,
}: UserStatsCardProps) {
  const { colors } = useAppColors();

  // Crear distribución por estado para scoring
  const statusDistribution = {
    [ReportStatus.OPEN]: pending,
    [ReportStatus.IN_PROGRESS]: inProgress,
    [ReportStatus.RESOLVED]: resolved,
    [ReportStatus.DENIED]: denied,
    [ReportStatus.CLOSED]: closed,
  };

  // Calcular métricas de resolución
  const resolutionMetrics = calculateResolutionScore(statusDistribution);

  // Calcular total de reportes
  const totalReports = pending + inProgress + resolved + denied + closed;

  // Configurar estadísticas para el componente base
  const stats: StatsCardProps["stats"] = [
    {
      label: "Total",
      value: totalReports,
      color: colors.primary,
      description: "All reports",
    },
    {
      label: "Resolved",
      value: resolved,
      color: colors.success,
      description: `+${STATUS_SCORES[ReportStatus.RESOLVED]} pts`,
    },
    {
      label: "In Progress",
      value: inProgress,
      color: colors.info,
      description: `+${STATUS_SCORES[ReportStatus.IN_PROGRESS]} pts`,
    },
    {
      label: "Open",
      value: pending,
      color: colors.warning,
      description: `+${STATUS_SCORES[ReportStatus.OPEN]} pts`,
    },
    {
      label: "Closed",
      value: closed,
      color: "#673AB7",
      description: `+${STATUS_SCORES[ReportStatus.CLOSED]} pts`,
    },
    {
      label: "Denied",
      value: denied,
      color: colors.error,
      description: `+${STATUS_SCORES[ReportStatus.DENIED]} pts`,
    },
  ];

  // Configurar items adicionales del footer (detalles personales)
  const additionalFooterItems: StatsCardProps["additionalFooterItems"] = [
    {
      icon: "pin",
      label: "Pinned",
      value: pinned,
      color: "#9C27B0",
    },
    {
      icon: "calendar",
      label: "Last Report",
      value: lastReportDate
        ? new Date(lastReportDate).toLocaleDateString()
        : "Never",
      color: colors.textSecondary,
    },
  ];

  return (
    <StatsCard
      title="Your Report Statistics"
      icon="account-chart"
      stats={stats}
      showScore={true}
      resolutionMetrics={resolutionMetrics}
      additionalFooterItems={additionalFooterItems}
    />
  );
}
