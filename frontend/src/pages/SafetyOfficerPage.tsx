import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import "./StaffDashboard.css";

import type {
  AuthUser,
} from "../types/Auth";

import type {
  TouristSite,
} from "../types/TouristSite";

import type {
  EmergencySeverity,
  EmergencyStatus,
  SafetyDashboard,
} from "../types/StaffOperations";

import tourFlowLogo
  from "../assets/tourflow-logo.svg";

import {
  getAllSites,
} from "../services/siteService";

import {
  createEmergencyAlert,
  getSafetyDashboard,
  updateEmergencyStatus,
} from "../services/safetyService";

interface Props {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

export default function SafetyOfficerPage({
  user,
  onLogout,
}: Props) {
  const [sites, setSites] =
    useState<TouristSite[]>([]);

  const [siteId, setSiteId] =
    useState<number | "">("");

  const [dashboard, setDashboard] =
    useState<SafetyDashboard | null>(
      null
    );

  const [title, setTitle] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [severity, setSeverity] =
    useState<EmergencySeverity>(
      "MEDIUM"
    );

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    void (async () => {
      try {
        const result =
          await getAllSites();

        setSites(result);

        if (result.length > 0) {
          setSiteId(result[0].id);
        }
      } catch (exception) {
        setError(
          exception instanceof Error
            ? exception.message
            : "Failed to load sites"
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (siteId !== "") {
      void load(siteId);
    }
  }, [siteId]);

  async function load(id: number) {
    try {
      setError("");

      setDashboard(
        await getSafetyDashboard(id)
      );
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to load safety dashboard"
      );
    }
  }

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (siteId === "") {
      return;
    }

    try {
      setError("");
      setMessage("");

      await createEmergencyAlert({
        siteId,
        title,
        location,
        description,
        severity,
      });

      setTitle("");
      setLocation("");
      setDescription("");
      setSeverity("MEDIUM");

      setMessage(
        "Emergency alert created successfully."
      );

      await load(siteId);
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to create alert"
      );
    }
  }

  async function changeStatus(
    id: number,
    status: EmergencyStatus
  ) {
    if (siteId === "") {
      return;
    }

    try {
      setError("");
      await updateEmergencyStatus(
        id,
        status
      );
      await load(siteId);
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Status update failed"
      );
    }
  }

  return (
    <div className="staff-page">
      <Header
        user={user}
        label="SAFETY OFFICER"
        onLogout={onLogout}
      />

      <main className="staff-main">
        <section className="staff-title">
          <div>
            <span className="staff-eyebrow">
              SAFETY & EMERGENCY
            </span>
            <h2>
              Safety Officer Dashboard
            </h2>
            <p>
              Monitor incidents and coordinate
              emergency response.
            </p>
          </div>

          <label className="staff-site-select">
            Tourist Site
            <select
              value={siteId}
              onChange={(event) =>
                setSiteId(
                  Number(event.target.value)
                )
              }
            >
              {sites.map(site => (
                <option
                  key={site.id}
                  value={site.id}
                >
                  {site.name}
                </option>
              ))}
            </select>
          </label>
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
              title="Active Alerts"
              value={dashboard.activeAlerts}
              tone={
                dashboard.activeAlerts > 0
                  ? "red"
                  : "green"
              }
            />
            <Stat
              title="Critical Alerts"
              value={dashboard.criticalAlerts}
              tone="red"
            />
            <Stat
              title="Current Visitors"
              value={dashboard.currentVisitors}
              tone="green"
            />
            <Stat
              title="Resolved Today"
              value={dashboard.resolvedToday}
            />
          </section>
        )}

        <section className="staff-panel">
          <div className="staff-panel-heading">
            <div>
              <h3>Report Incident</h3>
              <p>
                Create a new safety or emergency alert.
              </p>
            </div>
          </div>

          <form
            className="staff-form"
            onSubmit={submit}
          >
            <label className="staff-field">
              Incident Title
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Slippery pathway"
                required
              />
            </label>

            <label className="staff-field">
              Location
              <input
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="e.g. Main staircase"
                required
              />
            </label>

            <label className="staff-field">
              Severity
              <select
                value={severity}
                onChange={(event) =>
                  setSeverity(
                    event.target.value as EmergencySeverity
                  )
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>

            <label className="staff-field full">
              Description
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <button
              className="staff-button"
              type="submit"
            >
              Create Alert
            </button>
          </form>
        </section>

        <section className="staff-panel">
          <div className="staff-panel-heading">
            <div>
              <h3>Incident Alerts</h3>
              <p>
                Track open, in-progress and resolved
                incidents.
              </p>
            </div>
          </div>

          {!dashboard
          || dashboard.alerts.length === 0 ? (
            <div className="staff-empty">
              No emergency alerts found.
            </div>
          ) : (
            <div className="staff-list">
              {dashboard.alerts.map(alert => (
                <article
                  className="staff-item"
                  key={alert.id}
                >
                  <div className="staff-item-top">
                    <div>
                      <h4>{alert.title}</h4>
                      <p>{alert.description}</p>
                    </div>

                    <span
                      className={
                        `staff-badge ${
                          alert.severity
                            .toLowerCase()
                        }`
                      }
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <div className="staff-meta">
                    <span>
                      Location: {alert.location}
                    </span>
                    <span>
                      Status: {alert.status.replaceAll("_", " ")}
                    </span>
                    <span>
                      Reported:{" "}
                      {new Date(
                        alert.reportedAt
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="staff-actions">
                    {alert.status === "OPEN" && (
                      <button
                        className="staff-button"
                        type="button"
                        onClick={() =>
                          void changeStatus(
                            alert.id,
                            "IN_PROGRESS"
                          )
                        }
                      >
                        Start Response
                      </button>
                    )}

                    {alert.status !== "RESOLVED" && (
                      <button
                        className="staff-button secondary"
                        type="button"
                        onClick={() =>
                          void changeStatus(
                            alert.id,
                            "RESOLVED"
                          )
                        }
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Header({
  user,
  label,
  onLogout,
}: {
  user: AuthUser;
  label: string;
  onLogout: () => Promise<void>;
}) {
  return (
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
          <span>{label}</span>
        </div>
        <button
          type="button"
          onClick={() => void onLogout()}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

function Stat({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
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
