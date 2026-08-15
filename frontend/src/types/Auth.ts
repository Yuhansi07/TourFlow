export type UserRole =
  | "TOURIST"
  | "SITE_MANAGER"
  | "ENTRANCE_OFFICER"
  | "SAFETY_OFFICER"
  | "MAINTENANCE_OFFICER"
  | "TOUR_GUIDE"
  | "SYSTEM_ADMIN";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}
