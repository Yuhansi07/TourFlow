import { API_BASE_URL } from "../config/apiConfig";

import type {
  TouristSite,
  TouristSiteFormData,
} from "../types/TouristSite";

import {
  getAuthHeaders,
} from "./authService";

const API =
  `${API_BASE_URL}/api/sites`;

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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getAllSites():
Promise<TouristSite[]> {
  const response =
    await fetch(API);

  return handleResponse<TouristSite[]>(
    response
  );
}

export async function createSite(
  site: TouristSiteFormData
): Promise<TouristSite> {
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
          site
        ),
      }
    );

  return handleResponse<TouristSite>(
    response
  );
}

export async function updateSite(
  id: number,
  site: TouristSiteFormData
): Promise<TouristSite> {
  const response =
    await fetch(
      `${API}/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(
          site
        ),
      }
    );

  return handleResponse<TouristSite>(
    response
  );
}

export async function deleteSite(
  id: number
): Promise<void> {
  const response =
    await fetch(
      `${API}/${id}`,
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
