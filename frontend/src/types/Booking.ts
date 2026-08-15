export type BookingStatus =
  | "CONFIRMED"
  | "CANCELLED"
  | "CHECKED_IN"
  | "COMPLETED";

export interface Booking {
  id: number;
  bookingReference: string;
  siteId: number;
  siteName: string;
  district: string;
  visitDate: string;
  visitTime: string;
  visitorCount: number;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingRequest {
  siteId: number;
  visitDate: string;
  visitTime: string;
  visitorCount: number;
}
