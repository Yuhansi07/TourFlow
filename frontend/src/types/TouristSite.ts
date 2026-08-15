export type SiteStatus =
  | "OPEN"
  | "CLOSED"
  | "MAINTENANCE";

export interface TouristSite {
  id: number;
  name: string;
  district: string;
  description: string;
  dailyCapacity: number;
  currentVisitors: number;
  status: SiteStatus;
  imageUrl: string;
  createdAt?: string;
}

export interface TouristSiteFormData {
  name: string;
  district: string;
  description: string;
  dailyCapacity: number;
  currentVisitors: number;
  status: SiteStatus;
  imageUrl: string;
}
