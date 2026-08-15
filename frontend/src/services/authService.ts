import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
} from "../types/Auth";

import { API_BASE_URL } from "../config/apiConfig";
const API = `${API_BASE_URL}/api/auth`;

const TOKEN_KEY =
  "tourflow_auth_token";

const USER_KEY =
  "tourflow_auth_user";

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

export async function login(
  request: LoginRequest
): Promise<AuthResponse> {
  clearStoredAuthentication();

  const response =
    await fetch(
      `${API}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept:
            "application/json",
        },
        body: JSON.stringify(
          request
        ),
      }
    );

  const auth =
    await handleResponse<AuthResponse>(
      response
    );

  localStorage.setItem(
    TOKEN_KEY,
    auth.token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      auth.user
    )
  );

  return auth;
}

export async function logout():
Promise<void> {
  const token =
    getToken();

  try {
    if (token) {
      await fetch(
        `${API}/logout`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );
    }
  } finally {
    clearStoredAuthentication();
  }
}

export function getToken():
string | null {
  return localStorage.getItem(
    TOKEN_KEY
  );
}

export function getStoredUser():
AuthUser | null {
  const value =
    localStorage.getItem(
      USER_KEY
    );

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(
      value
    ) as AuthUser;
  } catch {
    clearStoredAuthentication();
    return null;
  }
}

export function getAuthHeaders():
Record<string, string> {
  const token =
    getToken();

  return token
    ? {
        Authorization:
          `Bearer ${token}`,
      }
    : {};
}

export function clearStoredAuthentication():
void {
  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}
