import { API_BASE_URL } from "../config/apiConfig";

import {
  getAuthHeaders,
} from "./authService";

import type {
  EmergencySeverity,
  EmergencyStatus,
  SafetyDashboard,
  EmergencyAlert,
} from "../types/StaffOperations";

const API =
  `${API_BASE_URL}/api/safety`;

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

export async function getSafetyDashboard(
  siteId: number
): Promise<SafetyDashboard> {
  const response =
    await fetch(
      `${API}/dashboard?siteId=${siteId}`,
      {
        headers:
          getAuthHeaders(),
      }
    );

  return parse<SafetyDashboard>(
    response
  );
}

export async function createEmergencyAlert(
  request: {
    siteId: number;
    title: string;
    location: string;
    description: string;
    severity: EmergencySeverity;
  }
): Promise<EmergencyAlert> {
  const response =
    await fetch(
      `${API}/alerts`,
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

  return parse<EmergencyAlert>(
    response
  );
}

export async function updateEmergencyStatus(
  id: number,
  status: EmergencyStatus
): Promise<EmergencyAlert> {
  const response =
    await fetch(
      `${API}/alerts/${id}/status?status=${status}`,
      {
        method: "PATCH",
        headers:
          getAuthHeaders(),
      }
    );

  return parse<EmergencyAlert>(
    response
  );
}
