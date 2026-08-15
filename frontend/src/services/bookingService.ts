import { API_BASE_URL } from "../config/apiConfig";

import type {
  Booking,
  CreateBookingRequest,
} from "../types/Booking";

import {
  getAuthHeaders,
} from "./authService";

const API =
  `${API_BASE_URL}/api/bookings`;

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

export async function createBooking(
  request: CreateBookingRequest
): Promise<Booking> {
  const response =
    await fetch(
      API,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(
          request
        ),
      }
    );

  return handleResponse<Booking>(
    response
  );
}

export async function getMyBookings():
Promise<Booking[]> {
  const response =
    await fetch(
      `${API}/my`,
      {
        headers:
          getAuthHeaders(),
      }
    );

  return handleResponse<Booking[]>(
    response
  );
}

export async function cancelBooking(
  id: number
): Promise<Booking> {
  const response =
    await fetch(
      `${API}/${id}/cancel`,
      {
        method: "PATCH",
        headers:
          getAuthHeaders(),
      }
    );

  return handleResponse<Booking>(
    response
  );
}
