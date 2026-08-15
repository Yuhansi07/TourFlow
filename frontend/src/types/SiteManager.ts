export type CrowdLevel =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "CRITICAL";

export interface SiteManagerDashboard {
  siteId: number;
  siteName: string;
  district: string;
  date: string;
  dailyCapacity: number;
  currentVisitors: number;
  reservedVisitors: number;
  remainingCapacity: number;
  occupancyPercent: number;
  crowdLevel: CrowdLevel;
  confirmedBookings: number;
  checkedInBookings: number;
  checkedInVisitors: number;
}

export interface TimeSlot {
  id: number;
  siteId: number;
  siteName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  reservedVisitors: number;
  remainingPlaces: number;
  utilizationPercent: number;
  active: boolean;
}

export interface TimeSlotRequest {
  siteId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  active: boolean;
}
