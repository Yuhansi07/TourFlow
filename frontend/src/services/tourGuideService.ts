import { API_BASE_URL } from "../config/apiConfig";

import {
  getAuthHeaders,
} from "./authService";

import type {
  GuideDashboard,
  GuideRequest,
  GuideRequestStatus,
} from "../types/StaffOperations";

const API =
  `${API_BASE_URL}/api/guide`;

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

export async function getGuideDashboard():
Promise<GuideDashboard> {
  const response =
    await fetch(
      `${API}/dashboard`,
      {
        headers:
          getAuthHeaders(),
      }
    );

  return parse<GuideDashboard>(
    response
  );
}

export async function respondToGuideRequest(
  bookingId: number,
  status: GuideRequestStatus
): Promise<GuideRequest> {
  const response =
    await fetch(
      `${API}/requests/${bookingId}?status=${status}`,
      {
        method: "PATCH",
        headers:
          getAuthHeaders(),
      }
    );

  return parse<GuideRequest>(
    response
  );
}
