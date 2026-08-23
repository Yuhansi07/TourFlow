import {
  API_BASE_URL,
} from "../config/apiConfig";

import {
  getAuthHeaders,
} from "./authService";

import type {
  CreateGuideRequest,
  GuideOption,
  TouristGuideRequest,
} from "../types/TouristGuide";


const API =
  `${API_BASE_URL}/api/tourist/guides`;


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
   AVAILABLE GUIDES FOR ONE SITE
   ========================================================= */

export async function getAvailableGuides(
  siteId: number
): Promise<GuideOption[]> {

  if (
    !Number.isFinite(siteId)
  ) {
    throw new Error(
      "Select a booking first"
    );
  }


  const response =
    await fetch(
      `${API}/available?siteId=${siteId}`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",

          ...getAuthHeaders(),
        },
      }
    );


  return handleResponse<GuideOption[]>(
    response
  );
}


/* =========================================================
   TOURIST GUIDE REQUESTS
   ========================================================= */

export async function getMyGuideRequests():
Promise<TouristGuideRequest[]> {

  const response =
    await fetch(
      `${API}/requests`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",

          ...getAuthHeaders(),
        },
      }
    );


  return handleResponse<
    TouristGuideRequest[]
  >(
    response
  );
}


/* =========================================================
   REQUEST GUIDE
   ========================================================= */

export async function requestGuide(
  request: CreateGuideRequest
): Promise<TouristGuideRequest> {

  const response =
    await fetch(
      `${API}/requests`,
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
          JSON.stringify(
            request
          ),
      }
    );


  return handleResponse<
    TouristGuideRequest
  >(
    response
  );
}