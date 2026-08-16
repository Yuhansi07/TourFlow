import {
  API_BASE_URL,
} from "../config/apiConfig";

import {
  getAuthHeaders,
} from "./authService";

import type {
  AdminUser,
  CreateAdminUserRequest,
} from "../types/AdminUser";


const API =
  `${API_BASE_URL}/api/admin/users`;


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

    throw new Error(message);
  }


  if (response.status === 204) {
    return undefined as T;
  }


  return response.json() as Promise<T>;
}


export async function getAdminUsers():
Promise<AdminUser[]> {

  const response =
    await fetch(
      API,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",

          ...getAuthHeaders(),
        },
      }
    );


  return handleResponse<AdminUser[]>(
    response
  );
}


export async function createAdminUser(
  request: CreateAdminUserRequest
): Promise<AdminUser> {

  const response =
    await fetch(
      API,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",

          ...getAuthHeaders(),
        },

        body:
          JSON.stringify(request),
      }
    );


  return handleResponse<AdminUser>(
    response
  );
}