import {
  useState,
  type FormEvent,
} from "react";

import tourFlowLogo
  from "../assets/tourflow-logo.svg";

import {
  confirmCheckIn,
  findEntranceBooking,
} from "../services/entranceService";

import type {
  AuthUser,
} from "../types/Auth";

import type {
  EntranceBooking,
} from "../types/EntranceBooking";

interface Props {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

function extractReference(
  value: string
) {
  const clean =
    value.trim();

  if (
    clean.startsWith("{")
    && clean.endsWith("}")
  ) {
    try {
      const parsed =
        JSON.parse(clean) as {
          bookingReference?: string;
        };

      if (
        parsed.bookingReference
      ) {
        return parsed
          .bookingReference
          .toUpperCase();
      }
    } catch {
      // Plain reference below.
    }
  }

  return clean.toUpperCase();
}

export default function EntranceOfficerPage({
  user,
  onLogout,
}: Props) {
  const [input, setInput] =
    useState("");

  const [booking, setBooking] =
    useState<EntranceBooking | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function search(
    event: FormEvent
  ) {
    event.preventDefault();

    const reference =
      extractReference(
        input
      );

    if (!reference) {
      setError(
        "Enter booking reference"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const result =
        await findEntranceBooking(
          reference
        );

      setBooking(result);
      setInput(
        result.bookingReference
      );
    } catch (exception) {
      setBooking(null);
      setError(
        exception instanceof Error
          ? exception.message
          : "Booking not found"
      );
    } finally {
      setLoading(false);
    }
  }

  async function checkIn() {
    if (!booking) {
      return;
    }

    try {
      setError("");

      const result =
        await confirmCheckIn(
          booking.bookingReference
        );

      setBooking(result);

      setMessage(
        `Check-in successful for ${result.visitorCount} visitor${result.visitorCount === 1 ? "" : "s"}.`
      );
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Check-in failed"
      );
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">
            <img
              src={tourFlowLogo}
              alt="TourFlow"
            />
          </div>

          <div>
            <h1>TourFlow</h1>
            <p>
              Smart Tourism Management
            </p>
          </div>
        </div>

        <div className="admin-profile">
          <div>
            <strong>
              {user.fullName}
            </strong>
            <span>
              ENTRANCE OFFICER
            </span>
          </div>

          <button
            type="button"
            className="header-logout"
            onClick={() =>
              void onLogout()
            }
          >
            Logout
          </button>
        </div>
      </header>

      <main className="main-content entrance-width">
        <section className="page-heading">
          <div>
            <span className="eyebrow">
              ENTRANCE OPERATIONS
            </span>

            <h2>
              Ticket Verification
            </h2>

            <p>
              Verify a tourist booking
              and confirm entry.
            </p>
          </div>
        </section>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>
                Scan / Enter Ticket
              </h3>
              <p>
                Paste booking reference
                or scanned QR JSON.
              </p>
            </div>
          </div>

          <form
            className="ticket-search"
            onSubmit={search}
          >
            <input
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              placeholder="TF-20260822-5E116316"
            />

            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading
                ? "Searching..."
                : "Search Booking"}
            </button>
          </form>
        </section>

        {booking && (
          <section className="panel">
            <div className="verify-top">
              <div>
                <span className="eyebrow">
                  BOOKING FOUND
                </span>

                <h3>
                  {booking.siteName}
                </h3>

                <p>
                  {booking.bookingReference}
                </p>
              </div>

              <span
                className={
                  `booking-pill ${booking.status.toLowerCase()} large-pill`
                }
              >
                {booking.status.replaceAll(
                  "_",
                  " "
                )}
              </span>
            </div>

            <div className="verify-grid">
              <div>
                <span>
                  Tourist
                </span>
                <b>
                  {booking.touristName}
                </b>
              </div>

              <div>
                <span>Email</span>
                <b>
                  {booking.touristEmail}
                </b>
              </div>

              <div>
                <span>
                  Destination
                </span>
                <b>
                  {booking.siteName}
                </b>
              </div>

              <div>
                <span>
                  District
                </span>
                <b>
                  {booking.district}
                </b>
              </div>

              <div>
                <span>
                  Visit Date
                </span>
                <b>
                  {booking.visitDate}
                </b>
              </div>

              <div>
                <span>
                  Visit Time
                </span>
                <b>
                  {booking.visitTime.slice(
                    0,
                    5
                  )}
                </b>
              </div>

              <div>
                <span>
                  Visitors
                </span>
                <b>
                  {booking.visitorCount}
                </b>
              </div>

              <div>
                <span>
                  Checked In
                </span>
                <b>
                  {booking.checkedInAt
                    ? new Date(
                        booking.checkedInAt
                      ).toLocaleString()
                    : "Not yet"}
                </b>
              </div>
            </div>

            {booking.status
              === "CONFIRMED" ? (
              <button
                type="button"
                className="button button-primary checkin-button"
                onClick={() =>
                  void checkIn()
                }
              >
                Confirm Check-in
              </button>
            ) : (
              <div className="disabled-message">
                {booking.status
                  === "CHECKED_IN"
                  ? "This ticket has already been checked in."
                  : `Check-in unavailable: ${booking.status.replaceAll("_", " ")}.`}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
