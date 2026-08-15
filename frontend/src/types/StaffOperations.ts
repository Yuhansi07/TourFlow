export type EmergencySeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type EmergencyStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED";

export interface EmergencyAlert {
  id: number;
  siteId: number;
  siteName: string;
  title: string;
  location: string;
  description: string;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  reportedAt: string;
  resolvedAt: string | null;
}

export interface SafetyDashboard {
  siteId: number;
  siteName: string;
  currentVisitors: number;
  activeAlerts: number;
  criticalAlerts: number;
  resolvedToday: number;
  alerts: EmergencyAlert[];
}

export type MaintenancePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type MaintenanceStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface MaintenanceTask {
  id: number;
  siteId: number;
  siteName: string;
  title: string;
  location: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceDashboard {
  siteId: number;
  siteName: string;
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  tasks: MaintenanceTask[];
}

export type GuideRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export interface GuideRequest {
  bookingId: number;
  bookingReference: string;
  touristName: string;
  destination: string;
  visitDate: string;
  visitTime: string;
  groupSize: number;
  language: string;
  requestStatus: GuideRequestStatus;
}

export interface GuideDashboard {
  newRequests: number;
  acceptedTours: number;
  rejectedRequests: number;
  requests: GuideRequest[];
}
