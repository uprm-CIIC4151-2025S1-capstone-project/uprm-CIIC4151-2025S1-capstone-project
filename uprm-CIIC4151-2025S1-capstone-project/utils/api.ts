import type { AdminInfo, ReportFormData } from "@/types/interfaces";
import { getStoredCredentials } from "@/utils/auth";
import { Platform } from "react-native";

// =============================================================================
// BASE URL (per platform)
// =============================================================================
const getApiBaseUrl = () => {
  if (__DEV__) {
    console.log("Platform:", Platform.OS);

    // Android emulator -> host machine
    if (Platform.OS === "android") {
      const androidUrl = "http://10.0.2.2:5000";
      console.log("Using Android URL:", androidUrl);
      return androidUrl;
    }

    // iOS (Expo Go on physical device)
    if (Platform.OS === "ios") {
      const iosUrl = "http://192.168.4.112:5000";
      console.log("Using iOS URL:", iosUrl);
      return iosUrl;
    }

    // Web
    const webUrl = "http://localhost:5000";
    console.log("Using Web URL:", webUrl);
    return webUrl;
  }

  // Para producción
  return "https://reporte-ciudadano-15eb46ea2557.herokuapp.com";
};

export const API_BASE_URL = getApiBaseUrl();

// =============================================================================
// IMAGE UPLOAD (NEW)
// =============================================================================

/**
 * Upload a local file:/// URI from expo-image-picker to Flask /upload.
 * Returns a relative URL like "/uploads/<uuid>.jpg".
 */
export async function uploadImageFromUri(uri: string): Promise<string> {
  const formData = new FormData();

  const filename = uri.split("/").pop() || "image.jpg";
  const extMatch = /\.(\w+)$/.exec(filename);
  const ext = extMatch?.[1]?.toLowerCase();

  const mimeType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  formData.append("image", {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  const uploadUrl = `${API_BASE_URL}/upload`;

  try {
    console.log("Uploading image:", uri);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      // ⚠️ DO NOT set Content-Type manually.
    });

    console.log("Upload status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("Upload failed:", text);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Upload JSON:", data);

    if (!data.url) {
      throw new Error("Upload returned no URL");
    }

    return data.url; // e.g. "/uploads/<uuid>.jpg"
  } catch (err) {
    console.error("uploadImageFromUri error:", err);
    throw err;
  }
}

/**
 * Convert backend relative paths into full URLs.
 * Useful for <Image source={{ uri: buildImageUrl(report.image_url) }} />
 */
export function buildImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
}

// =============================================================================
// REQUEST WRAPPER
// =============================================================================
async function request(endpoint: string, method = "GET", body?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    console.log(`API Request: ${method} ${url}`);
    if (body) console.log("Request Body:", body);

    const response = await fetch(url, options);
    console.log("Response Status:", response.status);

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed - Please log in again");
      if (response.status === 403) throw new Error("Access forbidden");
      if (response.status === 404) throw new Error("Resource not found");
      if (response.status >= 500) throw new Error("Server error");
      // try to parse body for error message
      try {
        const errJson = await response.json();
        throw new Error(errJson.error || errJson.error_msg || response.statusText);
      } catch {
      throw new Error(`API error: ${response.status}`);
      }
    }

    if (response.status === 204) return null;

    const json = await response.json();
    console.log("API Response:", json);
    return json;
  } catch (error: any) {
    console.error(`API Error (${method} ${endpoint}):`, error);

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to server at ${url}. Please check if the backend is running.`
      );
    }

    throw error;
  }
}

// =============================================================================
// AUTH
// =============================================================================
export async function login(data: { email: string; password: string }) {
  const result = await request("/login", "POST", data);
  if (result && (result.success || result.token || result.id)) return result;
  throw new Error(result?.error_msg || "Login failed");
}

export async function logout() {
  return request("/logout", "POST");
}

export async function getSystemHealth() {
  return request("/system/health");
}

// =============================================================================
// USERS
// =============================================================================
export async function getUsers(page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());

  return request(`/users?${params.toString()}`);
}

export async function getUser(id: number) {
  return request(`/users/${id}`);
}

export async function createUser(data: {
  email: string;
  password: string;
  admin: boolean;
}) {
  const result = await request("/users", "POST", data);
  if (result && result.id) return result;
  throw new Error(result?.error_msg || "User creation failed");
}

export async function updateUser(id: number, data: any) {
  return request(`/users/${id}`, "PUT", data);
}

export async function deleteUser(id: number) {
  return request(`/users/${id}`, "DELETE");
}

// =============================================================================
// USER MGMT
// =============================================================================
export async function upgradeToAdmin(userId: number, code: string) {
  return request(`/users/${userId}/upgrade-admin`, "POST", { code });
}

// =============================================================================
// REPORTS
// =============================================================================
export async function getReports(
  page?: number,
  limit?: number,
  sort?: "asc" | "desc",
  location_id?: number,
  city?: string
) {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (sort) params.append("sort", sort);

  const creds = await getStoredCredentials();
  if (creds) params.append("admin_id", creds.userId.toString());

  if (location_id) params.append("location_id", String(location_id));
  if (city) params.append("city", city);

  return request(`/reports?${params.toString()}`);
}

export async function getReport(id: number) {
  return request(`/reports/${id}`);
}

export async function createReport(data: ReportFormData) {
  const creds = await getStoredCredentials();
  if (!creds) throw new Error("User not authenticated");

  const payload = {
    ...data,
    user_id: creds.userId,
    image_url: data.image_url?.trim() || null,
    location_id: data.location_id ?? null,
  };

  return request("/reports", "POST", payload);
}

export async function updateReport(id: number, data: any) {
  return request(`/reports/${id}`, "PUT", data);
}

export async function deleteReport(id: number) {
  return request(`/reports/${id}`, "DELETE");
}

// =============================================================================
// REPORT ACTIONS
// =============================================================================
export async function validateReport(
  reportId: number,
  data: { admin_id: number }
) {
  return request(`/reports/${reportId}/validate`, "POST", data);
}

export async function resolveReport(
  reportId: number,
  data: { admin_id: number }
) {
  return request(`/reports/${reportId}/resolve`, "POST", data);
}

export async function rateReport(reportId: number) {
  // Toggle the one-star rating (like) for the current user.
  const credentials = await getStoredCredentials();
  if (!credentials) throw new Error("User not authenticated");

  // Use the toggle endpoint implemented in the backend
  const result = await request(`/reports/${reportId}/toggle-rate`, "POST", {
    user_id: credentials.userId,
  });

  // result will contain rated / rating / total_ratings etc.
  return result;
}

// =============================================================================
// SEARCH & FILTER
// =============================================================================
export async function searchReports(
  query: string,
  status?: string,
  category?: string,
  page?: number,
  limit?: number,
  sort?: "asc" | "desc",
  location_id?: number,
  city?: string
) {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (status) params.append("status", status);
  if (category) params.append("category", category);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (sort) params.append("sort", sort);

  const creds = await getStoredCredentials();
  if (creds) params.append("admin_id", creds.userId.toString());

  if (location_id) params.append("location_id", String(location_id));
  if (city) params.append("city", city);

  return request(`/reports/search?${params.toString()}`);
}

export async function filterReports(
  status?: string,
  category?: string,
  page?: number,
  limit?: number,
  sort?: "asc" | "desc",
  location_id?: number,
  city?: string
) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (category) params.append("category", category);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (sort) params.append("sort", sort);

  const creds = await getStoredCredentials();
  if (creds) params.append("admin_id", creds.userId.toString());

  if (location_id) params.append("location_id", String(location_id));
  if (city) params.append("city", city);

  return request(`/reports/filter?${params.toString()}`);
}

export async function getUserReports(
  userId: number,
  page?: number,
  limit?: number
) {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());

  return request(`/reports/user/${userId}?${params.toString()}`);
}

// =============================================================================
// LOCATIONS
// =============================================================================
export async function getLocations(page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());

  return request(`/locations?${params.toString()}`);
}

export async function getLocation(id: number) {
  return request(`/locations/${id}`);
}

export async function createLocation(data: {
  //city: string;
  latitude: number;
  longitude: number;
}) {
  return request("/locations", "POST", data);
}

export async function updateLocation(id: number, data: any) {
  return request(`/locations/${id}`, "PUT", data);
}

export async function deleteLocation(id: number) {
  return request(`/locations/${id}`, "DELETE");
}

// =============================================================================
// LOCATION SEARCH
// =============================================================================
export async function getLocationsNearby(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  qs.append("latitude", params.latitude.toString());
  qs.append("longitude", params.longitude.toString());
  if (params.radius) qs.append("radius", params.radius.toString());
  if (params.limit) qs.append("limit", params.limit.toString());

  return request(`/locations/nearby?${qs.toString()}`);
}

export async function getLocationsWithReports(page?: number, limit?: number) {
  const qs = new URLSearchParams();
  if (page) qs.append("page", page.toString());
  if (limit) qs.append("limit", limit.toString());

  return request(`/locations/with-reports?${qs.toString()}`);
}

export async function getLocationStats() {
  return request("/locations/stats");
}

export async function searchLocations(params: {
  city?: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.city)
    searchParams.append("city", params.city.toString());
  if (params?.latitude)
    searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude)
    searchParams.append("longitude", params.longitude.toString());
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  const query = searchParams.toString();
  return request(`/locations/search${query ? `?${query}` : ""}`);
}

// =============================================================================
// LOCATION AUTOCOMPLETE / CITY SEARCH (NEW)
// =============================================================================

/**
 * Autocomplete locations by city name.
 * Calls your backend `/locations/search?q=...&limit=...&prefix=1`
 * Returns: { locations: [{ id, city }, ...] } or similar - the request wrapper returns parsed JSON.
 */
export async function autocompleteLocations(
  q: string,
  limit = 20,
  prefix = true
): Promise<any> {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  params.append("limit", String(limit));
  params.append("prefix", prefix ? "1" : "0");
  // backend route currently is /locations/search
  return request(`/locations/search?${params.toString()}`);
}

/**
 * Search distinct cities (optionally include counts).
 * If your backend supports include_counts, it returns [{city, count}, ...].
 */
export async function searchCities(
  q = "",
  limit = 20,
  prefix = true,
  include_counts = false
) {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  params.append("limit", String(limit));
  params.append("prefix", prefix ? "1" : "0");
  if (include_counts) params.append("include_counts", "1");
  return request(`/locations/search?${params.toString()}`);
}

// =============================================================================
// ADMINISTRATORS
// =============================================================================
export async function getAdministrators(page?: number, limit?: number) {
  const qs = new URLSearchParams();
  if (page) qs.append("page", page.toString());
  if (limit) qs.append("limit", limit.toString());
  return request(`/administrators?${qs.toString()}`);
}

export async function getAdministrator(id: number) {
  return request(`/administrators/${id}`);
}

export async function createAdministrator(data: {
  user_id: number;
  department: string;
}) {
  return request("/administrators", "POST", data);
}

export async function updateAdministrator(id: number, data: any) {
  return request(`/administrators/${id}`, "PUT", data);
}

export async function deleteAdministrator(id: number) {
  return request(`/administrators/${id}`, "DELETE");
}

export async function getReportsForAdmin(adminId: number) {
  return request(`/api/admin/${adminId}/reports`);
}

// =============================================================================
// ADMIN MGMT
// =============================================================================
export async function getAdministratorsByDepartment(department: string) {
  return request(`/administrators/department/${department}`);
}

export async function getAdministratorWithDetails(id: number) {
  return request(`/administrators/${id}/details`);
}

export async function getAvailableAdministrators() {
  return request("/administrators/available");
}

// 🔹 Uses /me/admin?user_id=...
export async function checkUserIsAdministrator(
  userId: number
): Promise<AdminInfo> {
  const qs = new URLSearchParams();
  qs.append("user_id", userId.toString());
  return request(`/me/admin?${qs.toString()}`);
}

export async function getAdministratorPerformanceReport(days?: number) {
  const qs = new URLSearchParams();
  if (days) qs.append("days", days.toString());
  return request(`/administrators/performance?${qs.toString()}`);
}

// =============================================================================
// DEPARTMENTS
// =============================================================================
export async function getDepartments() {
  return request("/departments");
}

export async function getDepartment(name: string) {
  return request(`/departments/${name}`);
}

export async function createDepartment(data: {
  department: string;
  admin_id?: number;
}) {
  return request("/departments", "POST", data);
}

export async function updateDepartment(name: string, data: any) {
  return request(`/departments/${name}`, "PUT", data);
}

export async function deleteDepartment(name: string) {
  return request(`/departments/${name}`, "DELETE");
}

export async function getDepartmentAdmin(departmentName: string) {
  return request(`/departments/${departmentName}/admin`);
}

export async function assignDepartmentAdmin(
  departmentName: string,
  data: { admin_id: number }
) {
  return request(`/departments/${departmentName}/admin`, "POST", data);
}

export async function removeDepartmentAdmin(departmentName: string) {
  return request(`/departments/${departmentName}/admin`, "DELETE");
}

// =============================================================================
// DEPARTMENT MANAGEMENT
// =============================================================================
export async function getDepartmentsWithAdminInfo() {
  return request("/departments/with-admin-info");
}

export async function getDepartmentsByAdmin(adminId: number) {
  return request(`/departments/admin/${adminId}`);
}

export async function getAvailableDepartments() {
  return request("/departments/available");
}

export async function getDepartmentDetailedStats(departmentName: string) {
  return request(`/departments/${departmentName}/department-stats`);
}

export async function getAllDepartmentsStats() {
  return request("/departments/stats/all");
}

export async function checkAdminAssignment(
  adminId: number,
  departmentName: string
) {
  return request(`/departments/check-assignment/${adminId}/${departmentName}`);
}

// =============================================================================
// PINNED REPORTS
// =============================================================================
export async function getPinnedReports(
  userId?: number,
  page?: number,
  limit?: number
) {
  if (!userId) {
    const creds = await getStoredCredentials();
    if (!creds) throw new Error("Not authenticated");
    userId = creds.userId;
  }

  const qs = new URLSearchParams();
  qs.append("user_id", userId.toString());
  if (page) qs.append("page", page.toString());
  if (limit) qs.append("limit", limit.toString());

  return request(`/pinned-reports?${qs.toString()}`);
}

export async function pinReport(data: { user_id: number; report_id: number }) {
  const creds = await getStoredCredentials();
  if (!creds) throw new Error("Not authenticated");
  if (creds.userId !== data.user_id) throw new Error("User ID mismatch");

  return request("/pinned-reports", "POST", data);
}

export async function unpinReport(userId: number, reportId: number) {
  const creds = await getStoredCredentials();
  if (!creds) throw new Error("Not authenticated");
  if (creds.userId !== userId) throw new Error("User ID mismatch");

  const qs = new URLSearchParams();
  qs.append("user_id", userId.toString());

  return request(`/pinned-reports/${reportId}?${qs.toString()}`, "DELETE");
}

export async function getUserPinnedReports(
  userId: number,
  page?: number,
  limit?: number
) {
  const credentials = await getStoredCredentials();
  if (!credentials) throw new Error("User not authenticated");
  if (userId !== credentials.userId) throw new Error("User ID mismatch");

  const qs = new URLSearchParams();
  if (page) qs.append("page", page.toString());
  if (limit) qs.append("limit", limit.toString());

  return request(`/users/${userId}/pinned-reports?${qs.toString()}`);
}

export async function checkPinnedStatus(userId: number, reportId: number) {
  const creds = await getStoredCredentials();
  if (!creds) throw new Error("Not authenticated");
  if (creds.userId !== userId) throw new Error("User ID mismatch");

  return request(`/pinned-reports/check/${userId}/${reportId}`);
}

export async function getPinnedReportDetail(userId: number, reportId: number) {
  const creds = await getStoredCredentials();
  if (!creds) throw new Error("Not authenticated");
  if (creds.userId !== userId) throw new Error("User ID mismatch");

  return request(`/pinned-reports/${userId}/${reportId}/details`);
}

// =============================================================================
// STATS & ADMIN
// =============================================================================
export async function getOverviewStats() {
  return request("/stats/overview");
}

export async function getDepartmentOverviewStats(department: string) {
  return request(`/stats/department/${department}`);
}

export async function getUserStats(userId: number) {
  const creds = await getStoredCredentials();
  if (!creds) throw new Error("Not authenticated");
  if (creds.userId !== userId) throw new Error("User ID mismatch");

  return request(`/stats/user/${userId}`);
}

export async function getAdminStats(adminId: number) {
  return request(`/stats/admin/${adminId}`);
}

export async function getAllAdminStats() {
  return request("/administrators/stats/all");
}

export async function getResolutionRateByDepartment() {
  console.log("Fetching resolution rate by department");
  return request("/stats/resolution-rate-by-department");
}

export async function getAvgResolutionTimeByDepartment() {
  console.log("Fetching avg resolution time by department");
  return request("/stats/avg-resolution-time-by-department");
}

export async function getMonthlyReportVolume() {
  console.log("Fetching monthly report volume");
  return request("/stats/monthly-report-volume");
}

export async function getTopCategoriesPercentage() {
  console.log("Fetching top categories percentage");
  return request("/stats/top-categories-percentage");
}

// =============================================================================
// ADMIN DASHBOARD
// =============================================================================
export async function getAdminDashboard() {
  return request("/admin/dashboard");
}

export async function getPendingReports(page?: number, limit?: number) {
  const qs = new URLSearchParams();
  if (page) qs.append("page", page.toString());
  if (limit) qs.append("limit", limit.toString());
  return request(`/admin/reports/pending?${qs.toString()}`);
}

export async function getAssignedReports(
  adminId: number,
  page?: number,
  limit?: number
) {
  const params = new URLSearchParams();
  params.append("admin_id", adminId.toString());
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  return request(`/admin/reports/assigned?${params.toString()}`);
}

// =============================================================================
// DEBUG
// =============================================================================
export async function testConnection() {
  console.log("Testing API connection:", API_BASE_URL);
  try {
    const res = await fetch(`${API_BASE_URL}/`);
    return res.ok;
  } catch (err) {
    console.error("Connection test failed:", err);
    return false;
  }
}

// =============================================================================
// TODO REPORT ACTIONS - MISSING ROUTES IN BACKEND (in progress)
// =============================================================================

// Toggle rating (like) for a report
// Toggle rating (like) for a report
export async function toggleRating(
  reportId: number
): Promise<{ rating: number; rated: boolean }> {
  const credentials = await getStoredCredentials();
  if (!credentials) throw new Error("User not authenticated");

  // Matches Flask handler /reports/<id>/toggle-rate
  const result = await request(`/reports/${reportId}/toggle-rate`, "POST", {
    user_id: credentials.userId,
  });

  return result; // { rating: total_rating, rated: true/false }
}

// Remove user rating from a report
export async function unrateReport(
  reportId: number
): Promise<{ rating: number; rated: false }> {
  const credentials = await getStoredCredentials();
  if (!credentials) throw new Error("User not authenticated");

  const result = await request(`/reports/${reportId}/unrate`, "POST", {
    user_id: credentials.userId,
  });

  return result; // { rating: total_rating, rated: false }
}

// TODO Check if user rated the report
export async function checkReportRated(
  reportId: number
): Promise<{ rated: boolean; rating: number }> {
  const credentials = await getStoredCredentials();
  if (!credentials) throw new Error("User not authenticated");

  // Matches Flask handler /reports/<id>/rating-status?user_id=<user_id>
  return request(
    `/reports/${reportId}/rating-status?user_id=${credentials.userId}`
  );
}

// TODO Get rating count for report


// TODO Check if report is pinned by current user
export async function checkReportPinned(
  reportId: number
): Promise<{ pinned: boolean }> {
  const credentials = await getStoredCredentials();
  if (!credentials) throw new Error("User not authenticated");

  return request(
    `/reports/${reportId}/pinned-status?user_id=${credentials.userId}`
  );
}

// TODO Pin/Unpin report
export async function togglePinReport(reportId: number, pin: boolean) {
  console.log("[togglePinReport]", { reportId, pin });
  const credentials = await getStoredCredentials();
  if (!credentials) throw new Error("User not authenticated");

  if (pin) {
    return request("/pinned-reports", "POST", {
      user_id: credentials.userId,
      report_id: reportId,
    });
  } else {
    return unpinReport(credentials.userId, reportId);
  }
}

// TODO Edit report (author only)
export async function editReport(
  reportId: number,
  data: {
    title?: string;
    description?: string;
    category?: string;
  }
) {
  return request(`/reports/${reportId}`, "PUT", data);
}

// TODO Admin status changes
export async function changeReportStatus(
  reportId: number,
  status: string,
  adminId: number
) {
  return request(`/reports/${reportId}/status`, "PUT", {
    status,
    admin_id: adminId,
  });
}

// TODO Get available status options (for admin)
export async function getStatusOptions() {
  return request("/reports/status-options");
}

// TODO Get location details with address
export async function getLocationDetails(locationId: number): Promise<{
  id: number;
  city?: string;
  latitude: number;
  longitude: number;
  address?: string;
  country?: string;
}> {
  return request(`/locations/${locationId}/details`);
}
