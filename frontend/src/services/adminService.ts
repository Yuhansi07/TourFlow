import { API_BASE_URL } from "../config/apiConfig";
import {
  getAuthHeaders,
} from "./authService";

import type {
  AdminDashboard,
} from "../types/AdminDashboard";

const API =
  `${API_BASE_URL}/api/admin`;

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
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getAdminDashboard():
Promise<AdminDashboard> {
  const response = await fetch(
    `${API}/dashboard`,
    {
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    }
  );

  return handleResponse<AdminDashboard>(
    response
  );
}
