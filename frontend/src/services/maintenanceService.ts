import { API_BASE_URL } from "../config/apiConfig";

import {
  getAuthHeaders,
} from "./authService";

import type {
  MaintenanceDashboard,
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceTask,
} from "../types/StaffOperations";

const API =
  `${API_BASE_URL}/api/maintenance`;

async function parse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message =
      `Request failed (${response.status})`;

    try {
      const data = await response.json();
      message =
        data.message
        ?? data.error
        ?? message;
    } catch {
      // default
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getMaintenanceDashboard(
  siteId: number
): Promise<MaintenanceDashboard> {
  const response =
    await fetch(
      `${API}/dashboard?siteId=${siteId}`,
      {
        headers:
          getAuthHeaders(),
      }
    );

  return parse<MaintenanceDashboard>(
    response
  );
}

export async function createMaintenanceTask(
  request: {
    siteId: number;
    title: string;
    location: string;
    description: string;
    priority: MaintenancePriority;
  }
): Promise<MaintenanceTask> {
  const response =
    await fetch(
      `${API}/tasks`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body:
          JSON.stringify(request),
      }
    );

  return parse<MaintenanceTask>(
    response
  );
}

export async function updateMaintenanceStatus(
  id: number,
  status: MaintenanceStatus
): Promise<MaintenanceTask> {
  const response =
    await fetch(
      `${API}/tasks/${id}/status?status=${status}`,
      {
        method: "PATCH",
        headers:
          getAuthHeaders(),
      }
    );

  return parse<MaintenanceTask>(
    response
  );
}
