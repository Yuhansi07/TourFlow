import type {
  BookingStatus,
} from "./Booking";

export interface EntranceBooking {
  id: number;
  bookingReference: string;
  touristName: string;
  touristEmail: string;
  siteId: number;
  siteName: string;
  district: string;
  visitDate: string;
  visitTime: string;
  visitorCount: number;
  status: BookingStatus;
  checkedInAt: string | null;
}
