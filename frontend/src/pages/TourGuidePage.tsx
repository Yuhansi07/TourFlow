import {
  useEffect,
  useState,
} from "react";

import "./StaffDashboard.css";

import type {
  AuthUser,
} from "../types/Auth";

import type {
  GuideDashboard,
  GuideRequestStatus,
} from "../types/StaffOperations";

import tourFlowLogo
  from "../assets/tourflow-logo.svg";

import {
  getGuideDashboard,
  respondToGuideRequest,
} from "../services/tourGuideService";

interface Props {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

export default function TourGuidePage({
  user,
  onLogout,
}: Props) {
  const [dashboard, setDashboard] =
    useState<GuideDashboard | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setError("");
      setDashboard(
        await getGuideDashboard()
      );
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to load tour guide dashboard"
      );
    }
  }

  async function respond(
    bookingId: number,
    status: GuideRequestStatus
  ) {
    try {
      setError("");
      setMessage("");

      await respondToGuideRequest(
        bookingId,
        status
      );

      setMessage(
        status === "ACCEPTED"
          ? "Tour request accepted."
          : "Tour request rejected."
      );

      await load();
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Request update failed"
      );
    }
  }

  return (
    <div className="staff-page">
      <header className="staff-header">
        <div className="staff-brand">
          <div className="staff-logo">
          <img
            src={tourFlowLogo}
            alt="TourFlow"
          />
        </div>
          <div>
            <h1>TourFlow</h1>
            <p>Smart Tourism Management</p>
          </div>
        </div>

        <div className="staff-account">
          <div>
            <strong>{user.fullName}</strong>
            <span>TOUR GUIDE</span>
          </div>
          <button
            type="button"
            onClick={() => void onLogout()}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="staff-main">
        <section className="staff-title">
          <div>
            <span className="staff-eyebrow">
              TOUR OPERATIONS
            </span>
            <h2>
              Tour Guide Dashboard
            </h2>
            <p>
              Review tourist requests and manage
              upcoming guided tours.
            </p>
          </div>

          <button
            className="staff-button secondary"
            type="button"
            onClick={() => void load()}
          >
            Refresh
          </button>
        </section>

        {error && (
          <div className="staff-alert error">
            {error}
          </div>
        )}

        {message && (
          <div className="staff-alert success">
            {message}
          </div>
        )}

        {dashboard && (
          <section className="staff-stats">
            <Stat
              title="New Requests"
              value={dashboard.newRequests}
            />
            <Stat
              title="Accepted Tours"
              value={dashboard.acceptedTours}
              tone="green"
            />
            <Stat
              title="Rejected"
              value={dashboard.rejectedRequests}
            />
            <Stat
              title="Average Rating"
              value="4.8"
              tone="green"
            />
          </section>
        )}

        <section className="staff-panel">
          <div className="staff-panel-heading">
            <div>
              <h3>Booking Requests</h3>
              <p>
                Confirm or reject guide requests
                from tourist bookings.
              </p>
            </div>
          </div>

          {!dashboard
          || dashboard.requests.length === 0 ? (
            <div className="staff-empty">
              No confirmed tourist bookings are
              waiting for a guide.
            </div>
          ) : (
            <>
              <div className="guide-grid-head">
                <span>Tourist</span>
                <span>Destination</span>
                <span>Date</span>
                <span>Time</span>
                <span>Group</span>
                <span>Language</span>
                <span>Action</span>
              </div>

              {dashboard.requests.map(
                request => (
                  <div
                    className="guide-row"
                    key={request.bookingId}
                  >
                    <div>
                      <strong>
                        {request.touristName}
                      </strong>
                      <span>
                        {request.bookingReference}
                      </span>
                    </div>

                    <strong>
                      {request.destination}
                    </strong>

                    <span>
                      {request.visitDate}
                    </span>

                    <span>
                      {request.visitTime.slice(
                        0,
                        5
                      )}
                    </span>

                    <span>
                      {request.groupSize}
                    </span>

                    <span>
                      {request.language}
                    </span>

                    <div className="staff-actions">
                      {request.requestStatus
                        === "PENDING" ? (
                        <>
                          <button
                            className="staff-button"
                            type="button"
                            onClick={() =>
                              void respond(
                                request.bookingId,
                                "ACCEPTED"
                              )
                            }
                          >
                            Accept
                          </button>

                          <button
                            className="staff-button secondary"
                            type="button"
                            onClick={() =>
                              void respond(
                                request.bookingId,
                                "REJECTED"
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span
                          className={
                            `staff-badge ${
                              request.requestStatus
                                .toLowerCase()
                            }`
                          }
                        >
                          {request.requestStatus}
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({
  title,
  value,
  tone,
}: {
  title: string;
  value: number | string;
  tone?: string;
}) {
  return (
    <article className="staff-stat">
      <span>{title}</span>
      <strong className={tone ?? ""}>
        {value}
      </strong>
    </article>
  );
}
