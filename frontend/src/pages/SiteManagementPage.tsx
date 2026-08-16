import ConfirmModal from "../components/ConfirmModal";
import UserManagementPanel
  from "../components/UserManagementPanel";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";



import {
  createSite,
  deleteSite,
  getAllSites,
  updateSite,
} from "../services/siteService";

import {
  getAdminDashboard,
} from "../services/adminService";

import type {
  AuthUser,
} from "../types/Auth";

import type {
  AdminDashboard,
  SystemHealthStatus,
} from "../types/AdminDashboard";

import type {
  SiteStatus,
  TouristSite,
  TouristSiteFormData,
} from "../types/TouristSite";

import {
  getDestinationImageCandidates,
} from "../utils/destinationImages";

import tourFlowLogo from "../assets/tourflow-logo.svg";

import "./AdminDashboard.css";


interface Props {
  user: AuthUser;
  onLogout: () => Promise<void>;
}


const emptyForm: TouristSiteFormData = {
  name: "",
  district: "",
  description: "",
  dailyCapacity: 1000,
  currentVisitors: 0,
  status: "OPEN",
  imageUrl: "",
};


/* =========================================================
   SITE IMAGE
   ========================================================= */

function SiteImage({
  site,
}: {
  site: TouristSite;
}) {
  const [sourceIndex, setSourceIndex] =
    useState(0);

  const sources =
    getDestinationImageCandidates(
      site.name,
      site.imageUrl
    );

  useEffect(() => {
    setSourceIndex(0);
  }, [
    site.id,
    site.name,
    site.imageUrl,
  ]);

  const source =
    sources[sourceIndex] || "";

  if (!source) {
    return (
      <div className="image-fallback">
        <b>TF</b>
        <span>{site.name}</span>
      </div>
    );
  }

  return (
    <img
      src={source}
      alt={site.name}
      loading="lazy"
      onError={() =>
        setSourceIndex(
          current => current + 1
        )
      }
    />
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function formatActivityTime(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}


function healthLabel(
  value: SystemHealthStatus
) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );
}


/* =========================================================
   PAGE
   ========================================================= */

export default function SiteManagementPage({
  user,
  onLogout,
}: Props) {

  /* -------------------------
     SITE STATE
     ------------------------- */

  const [sites, setSites] =
    useState<TouristSite[]>([]);

  const [formData, setFormData] =
    useState<TouristSiteFormData>(
      emptyForm
    );

  const [editingId, setEditingId] =
    useState<number | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  /* -------------------------
     DELETE MODAL STATE
     ------------------------- */

  const [
    siteToDelete,
    setSiteToDelete,
  ] =
    useState<TouristSite | null>(
      null
    );


  /* -------------------------
     ADMIN DASHBOARD
     ------------------------- */

  const [
    dashboard,
    setDashboard,
  ] =
    useState<AdminDashboard | null>(
      null
    );

  const [
    dashboardLoading,
    setDashboardLoading,
  ] =
    useState(true);

  const [
    dashboardError,
    setDashboardError,
  ] =
    useState("");


  /* =========================================================
     LOAD SITES
     ========================================================= */

  async function loadSites() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getAllSites();

      setSites(result);

    } catch (exception) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to load sites"
      );

    } finally {

      setLoading(false);
    }
  }


  /* =========================================================
     LOAD DASHBOARD
     ========================================================= */

  async function loadDashboard() {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const result =
        await getAdminDashboard();

      setDashboard(result);

    } catch (exception) {

      setDashboardError(
        exception instanceof Error
          ? exception.message
          : "Failed to load admin dashboard"
      );

    } finally {

      setDashboardLoading(false);
    }
  }


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {

    void loadSites();
    void loadDashboard();

  }, []);


  /* =========================================================
     SUCCESS MESSAGE TIMER
     ========================================================= */

  useEffect(() => {

    if (!message) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setMessage("");
        },
        3500
      );

    return () => {
      window.clearTimeout(timer);
    };

  }, [message]);


  /* =========================================================
     RESET FORM
     ========================================================= */

  function resetForm() {

    setFormData({
      ...emptyForm,
    });

    setEditingId(null);
  }


  /* =========================================================
     CREATE / UPDATE
     ========================================================= */

  async function submit(
    event: FormEvent
  ) {

    event.preventDefault();

    if (
      formData.currentVisitors >
      formData.dailyCapacity
    ) {

      setError(
        "Current visitors cannot exceed daily capacity"
      );

      return;
    }

    try {

      setSaving(true);
      setError("");
      setMessage("");

      if (
        editingId === null
      ) {

        await createSite(
          formData
        );

        setMessage(
          "Tourist site created successfully."
        );

      } else {

        await updateSite(
          editingId,
          formData
        );

        setMessage(
          "Tourist site updated successfully."
        );
      }

      resetForm();

      await Promise.all([
        loadSites(),
        loadDashboard(),
      ]);

    } catch (exception) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to save site"
      );

    } finally {

      setSaving(false);
    }
  }


  /* =========================================================
     EDIT SITE
     ========================================================= */

  function edit(
    site: TouristSite
  ) {

    /*
     * Very important:
     * make sure delete modal is closed
     * before editing.
     */
    setSiteToDelete(null);

    setEditingId(
      site.id
    );

    setFormData({
      name:
        site.name,

      district:
        site.district,

      description:
        site.description ?? "",

      dailyCapacity:
        site.dailyCapacity,

      currentVisitors:
        site.currentVisitors,

      status:
        site.status,

      imageUrl:
        site.imageUrl ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* =========================================================
     OPEN DELETE MODAL
     ========================================================= */

  function remove(
    site: TouristSite
  ) {

    /*
     * Do NOT call delete here.
     * This function only opens
     * the professional confirmation modal.
     */

    setSiteToDelete(site);
  }


  /* =========================================================
     CANCEL DELETE
     ========================================================= */

  function cancelDeleteSite() {

    setSiteToDelete(null);
  }


  /* =========================================================
     CONFIRM DELETE
     ========================================================= */

  async function confirmDeleteSite() {

    if (!siteToDelete) {
      return;
    }

    /*
     * Save the site before
     * closing the modal.
     */
    const site =
      siteToDelete;

    /*
     * Close modal immediately.
     * This prevents the page
     * from staying blurred.
     */
    setSiteToDelete(null);

    try {

      setError("");
      setMessage("");

      await deleteSite(
        site.id
      );

      /*
       * If user was editing the
       * same site, reset form.
       */
      if (
        editingId === site.id
      ) {
        resetForm();
      }

      setMessage(
        `"${site.name}" was deleted successfully.`
      );

      await Promise.all([
        loadSites(),
        loadDashboard(),
      ]);

    } catch (exception) {

      console.error(
        "Failed to delete tourist site:",
        exception
      );

      setError(
        exception instanceof Error
          ? exception.message
          : `Unable to delete "${site.name}".`
      );
    }
  }


  /* =========================================================
     OCCUPANCY
     ========================================================= */

  function occupancy(
    site: TouristSite
  ) {

    if (
      site.dailyCapacity <= 0
    ) {
      return 0;
    }

    return Math.round(
      (
        site.currentVisitors /
        site.dailyCapacity
      ) * 100
    );
  }


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="app">


      {/* =====================================================
          TOP BAR
          ===================================================== */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-logo">

            <img
              src={tourFlowLogo}
              alt="TourFlow"
            />

          </div>


          <div>

            <h1>
              TourFlow
            </h1>

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
              {user.role.replaceAll(
                "_",
                " "
              )}
            </span>

          </div>


          <button
            className="header-logout"
            type="button"
            onClick={() =>
              void onLogout()
            }
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="main-content">


        {/* ===================================================
            PAGE HEADER
            =================================================== */}

        <section className="page-heading">

          <div>

            <span className="eyebrow">
              SYSTEM ADMINISTRATION
            </span>

            <h2>
              System Administrator Dashboard
            </h2>

            <p>
              Monitor users, tourist sites,
              operational alerts and platform
              health.
            </p>

          </div>


          <button
            type="button"
            className={
              "button button-secondary admin-refresh"
            }
            onClick={() => {

              void loadSites();
              void loadDashboard();

            }}
          >
            Refresh
          </button>

        </section>


        {/* ===================================================
            DASHBOARD ERROR
            =================================================== */}

        {dashboardError && (

          <div className="alert alert-error">
            {dashboardError}
          </div>

        )}


        {/* ===================================================
            DASHBOARD
            =================================================== */}

        {dashboardLoading &&
        !dashboard ? (

          <div className="admin-dashboard-loading">

            Loading administrator dashboard...

          </div>

        ) : dashboard ? (

          <>

            {/* ===============================================
                SUMMARY CARDS
                =============================================== */}

            <section className="admin-summary-grid">


              <article className="admin-summary-card">

                <span>
                  Tourist Sites
                </span>

                <strong className="green">
                  {dashboard.touristSites}
                </strong>

                <small>
                  Registered destinations
                </small>

              </article>


              <article className="admin-summary-card">

                <span>
                  Total Users
                </span>

                <strong className="blue">
                  {dashboard.totalUsers}
                </strong>

                <small>
                  Accounts in TourFlow
                </small>

              </article>


              <article className="admin-summary-card">

                <span>
                  Active Officers
                </span>

                <strong className="green">
                  {dashboard.activeOfficers}
                </strong>

                <small>
                  Operational staff accounts
                </small>

              </article>


              <article className="admin-summary-card">

                <span>
                  System Alerts
                </span>

                <strong className="red">
                  {dashboard.systemAlerts}
                </strong>

                <small>
                  Unresolved safety alerts
                </small>

              </article>

            </section>


            {/* ===============================================
                OVERVIEW
                =============================================== */}

            <section className="admin-overview-grid">


              {/* RECENT ACTIVITY */}

              <article className="admin-overview-panel">

                <h3>
                  Recent Activity
                </h3>

                <p>
                  Latest booking, safety
                  and maintenance events.
                </p>


                {dashboard
                  .recentActivity
                  .length === 0 ? (

                  <div className="empty-box">
                    No recent activity.
                  </div>

                ) : (

                  <div className="admin-activity-list">

                    {dashboard
                      .recentActivity
                      .map(
                        (
                          activity,
                          index
                        ) => (

                          <div
                            className="admin-activity-row"
                            key={
                              `${activity.occurredAt}-${activity.type}-${index}`
                            }
                          >

                            <span
                              className={
                                `admin-activity-dot ${
                                  activity
                                    .type
                                    .toLowerCase()
                                }`
                              }
                            />


                            <div>

                              <strong>
                                {activity.title}
                              </strong>

                              <span>
                                {activity.detail}
                              </span>

                            </div>


                            <time>

                              {formatActivityTime(
                                activity.occurredAt
                              )}

                            </time>

                          </div>

                        )
                      )}

                  </div>

                )}

              </article>


              {/* SYSTEM HEALTH */}

              <article className="admin-overview-panel">

                <h3>
                  System Health
                </h3>

                <p>
                  Current platform status.
                </p>


                <div className="admin-health-list">

                  {(
                    [
                      [
                        "API",
                        dashboard
                          .systemHealth
                          .api,
                      ],

                      [
                        "Database",
                        dashboard
                          .systemHealth
                          .database,
                      ],

                      [
                        "Authentication",
                        dashboard
                          .systemHealth
                          .authentication,
                      ],

                      [
                        "Safety Alerts",
                        dashboard
                          .systemHealth
                          .notifications,
                      ],
                    ] as const
                  ).map(
                    (
                      [
                        name,
                        status,
                      ]
                    ) => (

                      <div
                        className="admin-health-row"
                        key={name}
                      >

                        <span>
                          {name}
                        </span>

                        <span
                          className={
                            `admin-health-pill ${
                              status.toLowerCase()
                            }`
                          }
                        >
                          {healthLabel(
                            status
                          )}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </article>

            </section>

          </>

        ) : null}


        {/* ===================================================
            NORMAL ERROR
            =================================================== */}

        {error && (

          <div className="alert alert-error">
            {error}
          </div>

        )}


        {/* ===================================================
            SUCCESS MESSAGE
            =================================================== */}

        {message && (

          <div className="alert alert-success">
            {message}
          </div>

        )}


        {/* ===================================================
            ADD / EDIT TOURIST SITE
            =================================================== */}
            {/* ===================================================
                USER MANAGEMENT
                =================================================== */}

            <UserManagementPanel
              onUsersChanged={() => {
                void loadDashboard();
              }}
            />

        <section className="panel">


          <div className="panel-heading">

            <div>

              <h3>

                {editingId === null
                  ? "Add Tourist Site"
                  : "Update Tourist Site"}

              </h3>

              <p>
                Enter destination
                information below.
              </p>

            </div>


            {editingId !== null && (

              <button
                type="button"
                className={
                  "button button-secondary"
                }
                onClick={resetForm}
              >
                Cancel Edit
              </button>

            )}

          </div>


          <form
            className="two-column-form"
            onSubmit={submit}
          >


            {/* SITE NAME */}

            <div className="field">

              <label>
                Site name
              </label>

              <input
                value={
                  formData.name
                }
                onChange={event =>
                  setFormData(
                    current => ({
                      ...current,

                      name:
                        event
                          .target
                          .value,
                    })
                  )
                }
                required
              />

            </div>


            {/* DISTRICT */}

            <div className="field">

              <label>
                District
              </label>

              <input
                value={
                  formData.district
                }
                onChange={event =>
                  setFormData(
                    current => ({
                      ...current,

                      district:
                        event
                          .target
                          .value,
                    })
                  )
                }
                required
              />

            </div>


            {/* CAPACITY */}

            <div className="field">

              <label>
                Daily capacity
              </label>

              <input
                type="number"
                min="1"

                value={
                  formData.dailyCapacity
                }

                onChange={event =>
                  setFormData(
                    current => ({
                      ...current,

                      dailyCapacity:
                        Number(
                          event
                            .target
                            .value
                        ),
                    })
                  )
                }

                required
              />

            </div>


            {/* CURRENT VISITORS */}

            <div className="field">

              <label>
                Current visitors
              </label>

              <input
                type="number"
                min="0"

                value={
                  formData.currentVisitors
                }

                onChange={event =>
                  setFormData(
                    current => ({
                      ...current,

                      currentVisitors:
                        Number(
                          event
                            .target
                            .value
                        ),
                    })
                  )
                }

                required
              />

            </div>


            {/* STATUS */}

            <div className="field">

              <label>
                Status
              </label>

              <select
                value={
                  formData.status
                }

                onChange={event =>
                  setFormData(
                    current => ({
                      ...current,

                      status:
                        event
                          .target
                          .value as SiteStatus,
                    })
                  )
                }
              >

                <option value="OPEN">
                  Open
                </option>

                <option value="CLOSED">
                  Closed
                </option>

                <option value="MAINTENANCE">
                  Maintenance
                </option>

              </select>

            </div>


            {/* IMAGE URL */}

            <div className="field">

              <label>
                Image URL (optional)
              </label>

              <input
                value={
                  formData.imageUrl
                }

                onChange={event =>
                  setFormData(
                    current => ({
                      ...current,

                      imageUrl:
                        event
                          .target
                          .value,
                    })
                  )
                }

                placeholder={
                  "Leave blank to use the built-in destination image"
                }
              />

            </div>


            {/* DESCRIPTION */}

            <div className="field full-field">

              <label>
                Description
              </label>

              <textarea
                rows={4}

                value={
                  formData.description
                }

                onChange={event =>
                  setFormData(
                    current => ({
                      ...current,

                      description:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

            </div>


            {/* FORM BUTTONS */}

            <div className="form-actions full-field">


              <button
                type="submit"

                className={
                  "button button-primary"
                }

                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingId === null
                    ? "Add Tourist Site"
                    : "Save Changes"}

              </button>


              <button
                type="button"

                className={
                  "button button-secondary"
                }

                onClick={resetForm}
              >
                Clear
              </button>

            </div>

          </form>

        </section>


        {/* ===================================================
            REGISTERED TOURIST SITES
            =================================================== */}

        <section className="panel">


          <div className="panel-heading">

            <div>

              <h3>
                Registered Tourist Sites
              </h3>

              <p>
                Destinations currently
                stored in TourFlow.
              </p>

            </div>


            <button
              type="button"

              className={
                "button button-secondary"
              }

              onClick={() =>
                void loadSites()
              }
            >
              Refresh
            </button>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="empty-box">
              Loading sites...
            </div>

          ) : sites.length === 0 ? (

            <div className="empty-box">
              No tourist sites found.
            </div>

          ) : (

            <div className="site-grid">


              {sites.map(site => {

                const rate =
                  occupancy(site);


                return (

                  <article
                    className="site-card"
                    key={site.id}
                  >


                    {/* IMAGE */}

                    <div className="site-photo">

                      <SiteImage
                        site={site}
                      />

                    </div>


                    {/* BODY */}

                    <div className="site-card-body">


                      <div className="site-title-line">


                        <div>

                          <h4>
                            {site.name}
                          </h4>

                          <p>
                            {site.district}
                          </p>

                        </div>


                        <span
                          className={
                            `status-pill ${
                              site.status
                                .toLowerCase()
                            }`
                          }
                        >
                          {site.status}
                        </span>

                      </div>


                      <p className="site-description">

                        {site.description ||
                          "No description provided."}

                      </p>


                      <div className="crowd-line">

                        <span>
                          Current visitors
                        </span>

                        <strong>

                          {site.currentVisitors}

                          {" / "}

                          {site.dailyCapacity}

                        </strong>

                      </div>


                      <div className="progress">

                        <div
                          style={{
                            width:
                              `${Math.min(
                                rate,
                                100
                              )}%`,
                          }}
                        />

                      </div>


                      <div className="occupancy-text">

                        {rate}% occupancy

                      </div>


                      {/* BUTTONS */}

                      <div className="card-buttons">


                        {/* EDIT */}

                        <button
                          type="button"

                          className={
                            "button button-primary"
                          }

                          onClick={() =>
                            edit(site)
                          }
                        >
                          Edit
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"

                          className={
                            "button button-danger"
                          }

                          onClick={() =>
                            remove(site)
                          }
                        >
                          Delete
                        </button>


                      </div>

                    </div>

                  </article>

                );

              })}

            </div>

          )}

        </section>

      </main>


      {/* =====================================================
          PROFESSIONAL DELETE CONFIRMATION MODAL

          IMPORTANT:
          This is outside <main>.
          It is still inside the main root div.
          ===================================================== */}

      <ConfirmModal
        open={
          siteToDelete !== null
        }

        title={
          "Delete Tourist Site"
        }

        message={
          siteToDelete
            ? `Are you sure you want to delete "${siteToDelete.name}"? This action cannot be undone.`
            : ""
        }

        confirmText="Delete"

        cancelText="Cancel"

        danger

        onConfirm={
          confirmDeleteSite
        }

        onCancel={
          cancelDeleteSite
        }
      />


    </div>

  );
}