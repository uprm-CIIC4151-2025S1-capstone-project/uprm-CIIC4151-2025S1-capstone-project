// utils/scoring.ts
import { ReportStatus } from "@/types/interfaces";

// Solo los estados REALES del reporte
export const STATUS_SCORES: Record<ReportStatus, number> = {
  [ReportStatus.RESOLVED]: 5,
  [ReportStatus.IN_PROGRESS]: 3,
  [ReportStatus.OPEN]: 2,
  [ReportStatus.DENIED]: 1,
  [ReportStatus.CLOSED]: 0,
};

export const MAX_SCORE_PER_REPORT = 5;

export interface ResolutionMetrics {
  score: number;
  maxPossibleScore: number;
  percentage: number;
  grade: "A" | "B" | "C" | "D" | "F";
  gradeColor: string;
}

export function calculateResolutionScore(
  reportsByStatus: Record<ReportStatus, number>
): ResolutionMetrics {
  let totalScore = 0;
  let totalReports = 0;

  Object.entries(reportsByStatus).forEach(([status, count]) => {
    const score = STATUS_SCORES[status as ReportStatus];
    totalScore += score * count;
    totalReports += count;
  });

  const maxPossibleScore = totalReports * MAX_SCORE_PER_REPORT;
  const percentage =
    maxPossibleScore > 0
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 0;

  let grade: "A" | "B" | "C" | "D" | "F";
  let gradeColor: string;

  if (percentage >= 90) {
    grade = "A";
    gradeColor = "#4CAF50";
  } else if (percentage >= 75) {
    grade = "B";
    gradeColor = "#8BC34A";
  } else if (percentage >= 60) {
    grade = "C";
    gradeColor = "#FFC107";
  } else if (percentage >= 40) {
    grade = "D";
    gradeColor = "#FF9800";
  } else {
    grade = "F";
    gradeColor = "#F44336";
  }

  return {
    score: totalScore,
    maxPossibleScore,
    percentage,
    grade,
    gradeColor,
  };
}
