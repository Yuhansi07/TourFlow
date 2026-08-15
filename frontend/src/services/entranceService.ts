import { API_BASE_URL } from "../config/apiConfig";

import type {
  EntranceBooking,
} from "../types/EntranceBooking";

import {
  getAuthHeaders,
} from "./authService";

const API =
  `${API_BASE_URL}/api/entrance`;

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
      // Keep default.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function findEntranceBooking(
  reference: string
): Promise<EntranceBooking> {
  const response =
    await fetch(
      `${API}/bookings/${encodeURIComponent(reference)}`,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

  return handleResponse<EntranceBooking>(
    response
  );
}

export async function confirmCheckIn(
  reference: string
): Promise<EntranceBooking> {
  const response =
    await fetch(
      `${API}/bookings/${encodeURIComponent(reference)}/check-in`,
      {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

  return handleResponse<EntranceBooking>(
    response
  );
}
