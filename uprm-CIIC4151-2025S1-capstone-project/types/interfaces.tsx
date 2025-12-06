import { ViewStyle } from "react-native";

// Enums for strict type checking
export enum ReportStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  DENIED = "denied",
  CLOSED = "closed",
}

export enum ReportCategory {
  POTHOLE = "pothole",
  STREET_LIGHT = "street_light",
  TRAFFIC_SIGNAL = "traffic_signal",
  ROAD_DAMAGE = "road_damage",
  SANITATION = "sanitation",
  SINKHOLE = 'sinkhole',
  ELECTRICAL_HAZARD = 'electrical_hazard',
  FLOODING = 'flooding',
  WATER_OUTAGE = 'water_outage',
  WANDERING_WASTE = 'wandering_waste',
  FALLEN_TREE = 'fallen_tree',
  PIPE_LEAK = 'pipe_leak',
  OTHER = 'other',
}

export enum Department {
  DTOP = "DTOP",
  LUMA = "LUMA",
  AAA = "AAA",
  DDS = "DDS",
}

// Core data types
export interface UserCredentials {
  userId: number;
  email: string;
  password: string;
}

export interface UserSession {
  id: number;
  email: string;
  admin: boolean;
  suspended: boolean;
  // pinned: boolean;
  created_at: string;
}

// Full report from backend - matches your reports table
export interface ReportData {
  id: number;
  title: string;
  description: string;
  status: ReportStatus;
  category: ReportCategory | string;
  created_by: number;
  validated_by?: number;
  resolved_by?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  location_id?: number;
  location?: LocationData;
  image_url?: string;
  rating?: number;
}

// Form submission type - matches createReport API
export interface ReportFormData {
  title: string;
  description: string;
  category: ReportCategory | string;
  location_id?: number;
  image_url?: string;
  occurred_on: string;
  latitude?: number;
  longitude?: number;
}

// Administrator type
export interface AdministratorData {
  id: number;
  user_id: number;
  department: Department;
  user?: UserSession;
  created_at?: string;
}

// Department type
export interface DepartmentData {
  department: Department;
  admin_id?: number;
  administrator?: AdministratorData;
}

// Component Props
export interface UserCardProps {
  user: UserSession | null;
}

export interface ReportStatsProps {
  filed: number;
  resolved: number;
  pending: number;
  pinned: number;
  lastReportDate: string | null;
}

export interface AdminStatsProps {
  assigned: number;
  pending: number;
  resolved: number;
  style?: ViewStyle;
}

export interface StatProps {
  label: string;
  value: number;
  color: string;
  description: string;
  isLastInRow: boolean;
}

export interface StatRowProps {
  label: string;
  value: number;
  isLast?: boolean;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_msg?: string;
}

// Stats and Analytics types
export interface OverviewStats {
  total_reports: number;
  open_reports: number;
  resolved_reports: number;
  avg_rating: number;
  total_users: number;
  pinned_reports_count?: number;
}

export interface UserStats {
  total_reports: number;
  open_reports: number;
  resolved_reports: number;
  pinned_reports_count: number;
  avg_rating: number;
}

export interface AdminStatsData {
  total_assigned_reports: number;
  in_progress_reports: number;
  resolved_personally: number;
  avg_resolution_time: number;
  department?: Department;
}

// Pinned Reports types
export interface PinnedReportData {
  id: number;
  user_id: number;
  report_id: number;
  created_at: string;
  report?: ReportData;
}

export interface PinnedReportsResponse {
  pinned_reports: PinnedReportData[] | ReportData[];
  total?: number;
}

// Modal and Navigation types
export interface ModalScreenProps {
  navigation: any;
  route: any;
}

export interface TabScreenProps {
  navigation: any;
  route: any;
}

// Form and Validation types
export interface ValidationErrors {
  [key: string]: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

// Location-related types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSearchResult {
  id: number;
  latitude: number;
  longitude: number;
  address: string;
  distance?: number;
}

export interface LocationData {
  id: number;
  city: string;
  latitude: number;
  longitude: number;
}

export interface LocationWithReports extends LocationData {
  report_count: number;
}

export interface LocationsWithReportsResponse {
  locations: LocationWithReports[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

// Filter and Search types
export interface ReportFilters {
  status?: ReportStatus;
  category?: ReportCategory | string;
  dateRange?: {
    start: string;
    end: string;
  };
  location?: Coordinates;
  radius?: number;
}

export interface SearchParams {
  query: string;
  filters?: ReportFilters;
  page?: number;
  limit?: number;
}

// Authentication types
export interface LoginResponse {
  success: boolean;
  user_id: number;
  email: string;
  admin?: boolean;
  message?: string;
  error_msg?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserSession | null;
  isLoading: boolean;
  error: string | null;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component-specific prop types for better type safety
export interface ReportListProps {
  reports: ReportData[];
  onReportPress: (reportId: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
}

export interface StatusBadgeProps {
  status: ReportStatus;
  compact?: boolean;
}

export interface CategoryChipProps {
  category: ReportCategory | string;
  onPress?: () => void;
  selected?: boolean;
}

export interface AdminInfo {
  admin: boolean;
  department: string | null;
}

