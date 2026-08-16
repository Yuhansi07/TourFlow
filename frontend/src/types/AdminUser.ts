import type {
  UserRole,
} from "./Auth";

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}