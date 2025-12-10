// components/UserStatsCard.tsx
import StatsCard, { StatsCardProps } from "./StatsCard";
import { useAppColors } from "@/hooks/useAppColors";
import { ReportStatus } from "@/types/interfaces";
import { calculateResolutionScore, STATUS_SCORES } from "@/utils/scoring";

export interface UserStatsCardProps {
  filed: number; // total_reports
  resolved: number; // resolved_reports
  pending: number; // open_reports
  pinned: number; // pinned_reports_count
  lastReportDate: string | null;
  inProgress?: number; // in_progress_reports
  denied?: number; // denied_reports
  closed?: number; // closed_reports (resolved + denied)
}

/**
 * A component for displaying user statistics with an optional scoring section.
 * It expects a UserStatsCardProps object with the following properties:
 *   - filed: number - Total reports
 *   - resolved: number - Resolved reports
 *   - pending: number - Open reports
 *   - pinned: number - Pinned reports count
 *   - lastReportDate: string | null - Last report date
 *   - inProgress?: number - In progress reports (default 0)
 *   - denied?: number - Denied reports (default 0)
 *   - closed?: number - Closed reports (resolved + denied) (default 0)
 *
 * The scoring section is displayed if showScore is set to true.
 * The resolution metrics are calculated based on the status distribution.
 * The scoring section displays the resolution rate, which is the percentage of closed reports out of the total.
 * The additional footer items are configurable and can be used to display additional information.
 *
 * @param {UserStatsCardProps} props - Properties passed to the component
 * @returns {JSX.Element} - The rendered component
 */
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

  // VERIFICACIÓN: closed debe ser igual a resolved + denied
  const calculatedClosed = resolved + denied;
  const displayClosed = closed > 0 ? closed : calculatedClosed;

  // Calcular total real
  const totalReports = pending + inProgress + displayClosed;

  // Crear distribución por estado REAL para scoring
  // NOTA: No incluimos "closed" porque es solo una suma
  const statusDistribution = {
    [ReportStatus.OPEN]: pending,
    [ReportStatus.IN_PROGRESS]: inProgress,
    [ReportStatus.RESOLVED]: resolved,
    [ReportStatus.DENIED]: denied,
    [ReportStatus.CLOSED]: closed,
  };

  // Calcular métricas de resolución
  const resolutionMetrics = calculateResolutionScore(statusDistribution);

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
      label: "Closed",
      value: displayClosed,
      color: "#673AB7",
      description: "Resolved + Denied",
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
      label: "Denied",
      value: denied,
      color: colors.error,
      description: `+${STATUS_SCORES[ReportStatus.DENIED]} pts`,
    },
  ];

  // Configurar items adicionales del footer
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
    {
      icon: "chart-pie",
      label: "Resolution Rate",
      value: `${Math.round((displayClosed / totalReports) * 100) || 0}%`,
      color: colors.success,
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
