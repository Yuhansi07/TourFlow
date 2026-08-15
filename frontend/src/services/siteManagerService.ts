import { API_BASE_URL } from "../config/apiConfig";

import type {
  SiteManagerDashboard,
  TimeSlot,
  TimeSlotRequest,
} from "../types/SiteManager";

import {
  getAuthHeaders,
} from "./authService";

const API =
  `${API_BASE_URL}/api/manager`;

async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message =
      `Request failed (${response.status})`;

    try {
      const data =
        await response.json();

      message =
        data.message
        ?? data.error
        ?? message;
    } catch {
      // Keep default.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getManagerDashboard(
  siteId: number,
  date: string
): Promise<SiteManagerDashboard> {
  const params =
    new URLSearchParams({
      siteId: String(siteId),
      date,
    });

  const response =
    await fetch(
      `${API}/dashboard?${params.toString()}`,
      {
        headers:
          getAuthHeaders(),
      }
    );

  return handleResponse<SiteManagerDashboard>(
    response
  );
}

export async function getTimeSlots(
  siteId: number,
  date: string
): Promise<TimeSlot[]> {
  const params =
    new URLSearchParams({
      siteId: String(siteId),
      date,
    });

  const response =
    await fetch(
      `${API}/time-slots?${params.toString()}`,
      {
        headers:
          getAuthHeaders(),
      }
    );

  return handleResponse<TimeSlot[]>(
    response
  );
}

export async function createTimeSlot(
  request: TimeSlotRequest
): Promise<TimeSlot> {
  const response =
    await fetch(
      `${API}/time-slots`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body:
          JSON.stringify(
            request
          ),
      }
    );

  return handleResponse<TimeSlot>(
    response
  );
}

export async function updateTimeSlot(
  id: number,
  request: TimeSlotRequest
): Promise<TimeSlot> {
  const response =
    await fetch(
      `${API}/time-slots/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body:
          JSON.stringify(
            request
          ),
      }
    );

  return handleResponse<TimeSlot>(
    response
  );
}

export async function deleteTimeSlot(
  id: number
): Promise<void> {
  const response =
    await fetch(
      `${API}/time-slots/${id}`,
      {
        method: "DELETE",
        headers:
          getAuthHeaders(),
      }
    );

  return handleResponse<void>(
    response
  );
}
