import {
  API_BASE_URL,
} from "../config/apiConfig";

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
        data.message ??
        data.error ??
        message;

    } catch {
      // Keep default message.
    }

    throw new Error(
      message
    );
  }

  return response.json();
}


/* =========================================================
   TOUR GUIDE DASHBOARD
   ========================================================= */

export async function getGuideDashboard():
Promise<GuideDashboard> {

  const response =
    await fetch(
      `${API}/dashboard`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",

          ...getAuthHeaders(),
        },
      }
    );

  return handleResponse<GuideDashboard>(
    response
  );
}


/* =========================================================
   ACCEPT / REJECT GUIDE REQUEST
   ========================================================= */

export async function respondToGuideRequest(
  bookingId: number,
  status: GuideRequestStatus
): Promise<GuideRequest> {

  const response =
    await fetch(
      `${API}/requests/${bookingId}?status=${encodeURIComponent(
        status
      )}`,
      {
        method: "PATCH",

        headers: {
          Accept:
            "application/json",

          ...getAuthHeaders(),
        },
      }
    );

  return handleResponse<GuideRequest>(
    response
  );
}