import type {
  GuideRequestStatus,
} from "./StaffOperations";


export interface GuideOption {

  id: number;

  /*
   * Touristට පේන්නේ guide business/service name.
   */
  fullName: string;

  email: string;

  language: string;

  /*
   * Guide rating
   * Example: 4.8
   */
  rating: number;
}


export interface TouristGuideRequest {

  assignmentId: number;

  bookingId: number;

  bookingReference: string;

  guideId: number;

  /*
   * Business/service name
   * Example: Ceylon Heritage Guides
   */
  guideName: string;

  destination: string;

  visitDate: string;

  visitTime: string;

  groupSize: number;

  language: string;

  requestStatus:
    GuideRequestStatus;
}


export interface CreateGuideRequest {

  bookingId: number;

  guideId: number;
}