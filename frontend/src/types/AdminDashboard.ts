export type SystemHealthStatus =
  | "OPERATIONAL"
  | "DEGRADED"
  | "NOT_CONFIGURED";

export interface AdminRecentActivity {
  type:
    | "BOOKING"
    | "SAFETY"
    | "MAINTENANCE";
  title: string;
  detail: string;
  occurredAt: string;
}

export interface AdminSystemHealth {
  api: SystemHealthStatus;
  database: SystemHealthStatus;
  authentication: SystemHealthStatus;
  notifications: SystemHealthStatus;
}

export interface AdminDashboard {
  touristSites: number;
  totalUsers: number;
  activeOfficers: number;
  systemAlerts: number;
  recentActivity: AdminRecentActivity[];
  systemHealth: AdminSystemHealth;
}
