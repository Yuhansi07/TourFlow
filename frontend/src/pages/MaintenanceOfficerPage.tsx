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
  MaintenanceDashboard,
  MaintenancePriority,
  MaintenanceStatus,
} from "../types/StaffOperations";

import tourFlowLogo
  from "../assets/tourflow-logo.svg";

import {
  getAllSites,
} from "../services/siteService";

import {
  createMaintenanceTask,
  getMaintenanceDashboard,
  updateMaintenanceStatus,
} from "../services/maintenanceService";

interface Props {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

export default function MaintenanceOfficerPage({
  user,
  onLogout,
}: Props) {
  const [sites, setSites] =
    useState<TouristSite[]>([]);

  const [siteId, setSiteId] =
    useState<number | "">("");

  const [dashboard, setDashboard] =
    useState<MaintenanceDashboard | null>(
      null
    );

  const [title, setTitle] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<MaintenancePriority>(
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
        await getMaintenanceDashboard(id)
      );
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to load maintenance dashboard"
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

      await createMaintenanceTask({
        siteId,
        title,
        location,
        description,
        priority,
      });

      setTitle("");
      setLocation("");
      setDescription("");
      setPriority("MEDIUM");

      setMessage(
        "Maintenance task created."
      );

      await load(siteId);
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to create task"
      );
    }
  }

  async function changeStatus(
    id: number,
    status: MaintenanceStatus
  ) {
    if (siteId === "") {
      return;
    }

    try {
      setError("");

      await updateMaintenanceStatus(
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
        onLogout={onLogout}
      />

      <main className="staff-main">
        <section className="staff-title">
          <div>
            <span className="staff-eyebrow">
              MAINTENANCE OPERATIONS
            </span>
            <h2>
              Maintenance Officer Panel
            </h2>
            <p>
              Manage repairs, inspections and
              maintenance work.
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
              title="All Tasks"
              value={dashboard.total}
            />
            <Stat
              title="Pending"
              value={dashboard.pending}
            />
            <Stat
              title="In Progress"
              value={dashboard.inProgress}
              tone="green"
            />
            <Stat
              title="Completed"
              value={dashboard.completed}
              tone="green"
            />
          </section>
        )}

        <section className="staff-panel">
          <div className="staff-panel-heading">
            <div>
              <h3>Report / Add Task</h3>
              <p>
                Create a maintenance job for the
                selected tourist site.
              </p>
            </div>
          </div>

          <form
            className="staff-form"
            onSubmit={submit}
          >
            <label className="staff-field">
              Task Title
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
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
                required
              />
            </label>

            <label className="staff-field">
              Priority
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value as MaintenancePriority
                  )
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
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
              Add Task
            </button>
          </form>
        </section>

        <section className="staff-panel">
          <div className="staff-panel-heading">
            <div>
              <h3>My Tasks</h3>
              <p>
                Update maintenance progress.
              </p>
            </div>
          </div>

          {!dashboard
          || dashboard.tasks.length === 0 ? (
            <div className="staff-empty">
              No maintenance tasks found.
            </div>
          ) : (
            <div className="staff-list">
              {dashboard.tasks.map(task => (
                <article
                  className="staff-item"
                  key={task.id}
                >
                  <div className="staff-item-top">
                    <div>
                      <h4>{task.title}</h4>
                      <p>
                        {task.location}
                        {" • "}
                        {task.description}
                      </p>
                    </div>

                    <span
                      className={
                        `staff-badge ${
                          task.status
                            .toLowerCase()
                        }`
                      }
                    >
                      {task.status.replaceAll(
                        "_",
                        " "
                      )}
                    </span>
                  </div>

                  <div className="staff-meta">
                    <span>
                      Priority: {task.priority}
                    </span>
                    <span>
                      Site: {task.siteName}
                    </span>
                  </div>

                  <div className="staff-actions">
                    {task.status === "PENDING" && (
                      <button
                        className="staff-button"
                        type="button"
                        onClick={() =>
                          void changeStatus(
                            task.id,
                            "IN_PROGRESS"
                          )
                        }
                      >
                        Start Task
                      </button>
                    )}

                    {task.status !== "COMPLETED" && (
                      <button
                        className="staff-button secondary"
                        type="button"
                        onClick={() =>
                          void changeStatus(
                            task.id,
                            "COMPLETED"
                          )
                        }
                      >
                        Mark Completed
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
  onLogout,
}: Props) {
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
          <span>MAINTENANCE OFFICER</span>
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
