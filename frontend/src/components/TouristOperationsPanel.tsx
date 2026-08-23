import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createEmergencyAlert,
  getSafetyDashboard,
} from "../services/safetyService";

import {
  createMaintenanceTask,
  getMaintenanceDashboard,
} from "../services/maintenanceService";

import type {
  EmergencyAlert,
  EmergencySeverity,
  MaintenancePriority,
  MaintenanceTask,
} from "../types/StaffOperations";


interface Props {
  siteId: number | null;
  siteName: string;
}


/* =========================================================
   SAFE TYPE CHECKS
   ========================================================= */

function isEmergencySeverity(
  value: string
): value is EmergencySeverity {

  return (
    value === "LOW" ||
    value === "MEDIUM" ||
    value === "HIGH" ||
    value === "CRITICAL"
  );
}


function isMaintenancePriority(
  value: string
): value is MaintenancePriority {

  return (
    value === "LOW" ||
    value === "MEDIUM" ||
    value === "HIGH"
  );
}


/* =========================================================
   STATUS CLASS HELPERS
   ========================================================= */

export default function TouristOperationsPanel({
  siteId,
  siteName,
}: Props) {

  /* =========================================================
     SAFETY ALERTS
     ========================================================= */

  const [
    alerts,
    setAlerts,
  ] =
    useState<EmergencyAlert[]>([]);


  const [
    safetyLoading,
    setSafetyLoading,
  ] =
    useState(false);


  const [
    safetyError,
    setSafetyError,
  ] =
    useState("");


  const [
    safetyMessage,
    setSafetyMessage,
  ] =
    useState("");


  /* =========================================================
     SAFETY REPORT FORM
     ========================================================= */

  const [
    safetyTitle,
    setSafetyTitle,
  ] =
    useState(
      "Safety Hazard"
    );


  const [
    safetyLocation,
    setSafetyLocation,
  ] =
    useState("");


  const [
    safetyDescription,
    setSafetyDescription,
  ] =
    useState("");


  const [
    safetySeverity,
    setSafetySeverity,
  ] =
    useState<EmergencySeverity>(
      "MEDIUM"
    );


  const [
    safetySubmitting,
    setSafetySubmitting,
  ] =
    useState(false);


  /* =========================================================
     MAINTENANCE ISSUES
     ========================================================= */

  const [
    maintenanceTasks,
    setMaintenanceTasks,
  ] =
    useState<MaintenanceTask[]>([]);


  const [
    maintenanceLoading,
    setMaintenanceLoading,
  ] =
    useState(false);


  /* =========================================================
     MAINTENANCE REPORT FORM
     ========================================================= */

  const [
    maintenanceTitle,
    setMaintenanceTitle,
  ] =
    useState(
      "Cleanliness Issue"
    );


  const [
    maintenanceLocation,
    setMaintenanceLocation,
  ] =
    useState("");


  const [
    maintenanceDescription,
    setMaintenanceDescription,
  ] =
    useState("");


  const [
    maintenancePriority,
    setMaintenancePriority,
  ] =
    useState<MaintenancePriority>(
      "MEDIUM"
    );


  const [
    maintenanceSubmitting,
    setMaintenanceSubmitting,
  ] =
    useState(false);


  const [
    maintenanceError,
    setMaintenanceError,
  ] =
    useState("");


  const [
    maintenanceMessage,
    setMaintenanceMessage,
  ] =
    useState("");


  /* =========================================================
     LOAD SAFETY ALERTS
     ========================================================= */

  async function loadSafetyAlerts() {

    if (!siteId) {

      setAlerts([]);

      return;
    }


    try {

      setSafetyLoading(
        true
      );

      setSafetyError(
        ""
      );


      const dashboard =
        await getSafetyDashboard(
          siteId
        );


      /*
       * The backend filters by siteId.
       * Tourist sees only active alerts.
       */
      setAlerts(
        dashboard.alerts.filter(
          alert =>
            alert.status !==
            "RESOLVED"
        )
      );

    } catch (exception) {

      setAlerts(
        []
      );


      setSafetyError(
        exception instanceof Error
          ? exception.message
          : "Failed to load safety alerts"
      );

    } finally {

      setSafetyLoading(
        false
      );
    }
  }


  /* =========================================================
     LOAD MAINTENANCE ISSUES
     ========================================================= */

  async function loadMaintenanceIssues() {

    if (!siteId) {

      setMaintenanceTasks(
        []
      );

      return;
    }


    try {

      setMaintenanceLoading(
        true
      );

      setMaintenanceError(
        ""
      );


      const dashboard =
        await getMaintenanceDashboard(
          siteId
        );


      /*
       * The backend filters by siteId.
       * Tourist sees only current issues.
       */
      setMaintenanceTasks(
        dashboard.tasks.filter(
          task =>
            task.status !==
            "COMPLETED"
        )
      );

    } catch (exception) {

      setMaintenanceTasks(
        []
      );


      setMaintenanceError(
        exception instanceof Error
          ? exception.message
          : "Failed to load maintenance issues"
      );

    } finally {

      setMaintenanceLoading(
        false
      );
    }
  }


  /* =========================================================
     SITE CHANGED
     ========================================================= */

  useEffect(() => {

    setSafetyMessage(
      ""
    );

    setMaintenanceMessage(
      ""
    );

    void loadSafetyAlerts();

    void loadMaintenanceIssues();

  }, [siteId]);


  /* =========================================================
     REPORT SAFETY ISSUE
     ========================================================= */

  async function submitSafetyIssue(
    event: FormEvent
  ) {

    event.preventDefault();


    if (!siteId) {

      setSafetyError(
        "Select a destination first"
      );

      return;
    }


    if (
      !safetyLocation.trim() ||
      !safetyDescription.trim()
    ) {

      setSafetyError(
        "Location and description are required"
      );

      return;
    }


    try {

      setSafetySubmitting(
        true
      );

      setSafetyError(
        ""
      );

      setSafetyMessage(
        ""
      );


      await createEmergencyAlert({

        siteId,

        title:
          safetyTitle,

        location:
          safetyLocation.trim(),

        description:
          safetyDescription.trim(),

        severity:
          safetySeverity,
      });


      setSafetyMessage(
        "Safety issue reported successfully. The Safety Officer can now review it."
      );


      setSafetyLocation(
        ""
      );

      setSafetyDescription(
        ""
      );

      setSafetySeverity(
        "MEDIUM"
      );


      await loadSafetyAlerts();

    } catch (exception) {

      setSafetyError(
        exception instanceof Error
          ? exception.message
          : "Failed to report safety issue"
      );

    } finally {

      setSafetySubmitting(
        false
      );
    }
  }


  /* =========================================================
     REPORT MAINTENANCE ISSUE
     ========================================================= */

  async function submitMaintenanceIssue(
    event: FormEvent
  ) {

    event.preventDefault();


    if (!siteId) {

      setMaintenanceError(
        "Select a destination first"
      );

      return;
    }


    if (
      !maintenanceLocation.trim() ||
      !maintenanceDescription.trim()
    ) {

      setMaintenanceError(
        "Location and description are required"
      );

      return;
    }


    try {

      setMaintenanceSubmitting(
        true
      );

      setMaintenanceError(
        ""
      );

      setMaintenanceMessage(
        ""
      );


      await createMaintenanceTask({

        siteId,

        title:
          maintenanceTitle,

        location:
          maintenanceLocation.trim(),

        description:
          maintenanceDescription.trim(),

        priority:
          maintenancePriority,
      });


      setMaintenanceMessage(
        "Site issue reported successfully. The Maintenance Officer can now review it."
      );


      setMaintenanceLocation(
        ""
      );

      setMaintenanceDescription(
        ""
      );

      setMaintenancePriority(
        "MEDIUM"
      );


      await loadMaintenanceIssues();

    } catch (exception) {

      setMaintenanceError(
        exception instanceof Error
          ? exception.message
          : "Failed to report site issue"
      );

    } finally {

      setMaintenanceSubmitting(
        false
      );
    }
  }


  return (
    <>


      {/* =====================================================
          SAFETY & ALERTS
      ====================================================== */}

      <section
        className="panel"
        id="safety-alerts"
      >

        <div className="panel-heading">

          <div>

            <h3>
              Safety & Alerts
            </h3>


            <p>

              {siteId
                ? `Current safety information for ${siteName}.`
                : "Select a destination to view current safety alerts."}

            </p>

          </div>


          {siteId && (

            <button
              type="button"

              className="button button-secondary"

              onClick={() =>
                void loadSafetyAlerts()
              }
            >
              Refresh Alerts
            </button>

          )}

        </div>


        {safetyError && (

          <div className="alert alert-error">
            {safetyError}
          </div>

        )}


        {safetyMessage && (

          <div className="alert alert-success">
            {safetyMessage}
          </div>

        )}


        {!siteId ? (

          <div className="empty-box">
            Select a destination first.
          </div>

        ) : safetyLoading ? (

          <div className="empty-box">
            Loading safety alerts...
          </div>

        ) : alerts.length === 0 ? (

          <div className="empty-box">
            No active safety alerts for {siteName}.
          </div>

        ) : (

          <div className="tourist-operation-grid">

            {alerts.map(
              alert => (

                <article
                  key={alert.id}
                  style={{
                    padding: "22px",
                    borderRadius: "18px",
                    border: "1px solid #d7e8e2",
                    background: "#ffffff",
                    boxShadow: "0 10px 28px rgba(15, 57, 50, 0.06)",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "3px 7px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        color:
                          alert.severity === "CRITICAL"
                            ? "#b42318"
                            : alert.severity === "HIGH"
                              ? "#c4320a"
                              : alert.severity === "MEDIUM"
                                ? "#b54708"
                                : "#067647",
                        background:
                          alert.severity === "CRITICAL"
                            ? "#fef3f2"
                            : alert.severity === "HIGH"
                              ? "#fff6ed"
                              : alert.severity === "MEDIUM"
                                ? "#fffaeb"
                                : "#ecfdf3",
                        border:
                          alert.severity === "CRITICAL"
                            ? "1px solid #fecdca"
                            : alert.severity === "HIGH"
                              ? "1px solid #fedf89"
                              : alert.severity === "MEDIUM"
                                ? "1px solid #fedf89"
                                : "1px solid #abefc6",
                      }}
                    >
                      {alert.severity}
                    </span>

                    <span
                      style={{
                        color: "#667085",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.8px",
                      }}
                    >
                      SAFETY ALERT
                    </span>

                  </div>


                  <strong
                    style={{
                      display: "block",
                      marginTop: "15px",
                      color: "#102f3b",
                      fontSize: "25px",
                      lineHeight: 1.18,
                      fontWeight: 850,
                      letterSpacing: "-0.45px",
                    }}
                  >
                    {alert.title}
                  </strong>


                  <div
                    style={{
                      marginTop: "10px",
                      color: "#087a55",
                      fontSize: "12px",
                      fontWeight: 750,
                    }}
                  >
                    {siteName}
                  </div>


                  <small
                    style={{
                      display: "block",
                      marginTop: "10px",
                      color: "#667085",
                      fontSize: "12px",
                    }}
                  >
                    Location: {alert.location}
                  </small>


                  <p
                    style={{
                      margin: "14px 0 18px",
                      color: "#344054",
                      lineHeight: 1.65,
                    }}
                  >
                    {alert.description}
                  </p>


                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        width: "fit-content",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "0.55px",
                        color:
                          alert.status === "RESOLVED"
                            ? "#067647"
                            : alert.status === "IN_PROGRESS"
                              ? "#175cd3"
                              : "#b54708",
                        background:
                          alert.status === "RESOLVED"
                            ? "#ecfdf3"
                            : alert.status === "IN_PROGRESS"
                              ? "#eff8ff"
                              : "#fffaeb",
                        border:
                          alert.status === "RESOLVED"
                            ? "1px solid #abefc6"
                            : alert.status === "IN_PROGRESS"
                              ? "1px solid #b2ddff"
                              : "1px solid #fedf89",
                      }}
                    >
                      {alert.status.replaceAll(
                        "_",
                        " "
                      )}
                    </span>


                    <small
                      style={{
                        color: "#98a2b3",
                        fontSize: "11px",
                      }}
                    >
                      {new Date(
                        alert.reportedAt
                      ).toLocaleString()}
                    </small>

                  </div>

                </article>

              )
            )}

          </div>

        )}


        {/* =================================================
            REPORT SAFETY ISSUE
        ================================================== */}

        <div className="operation-form-section">

          <div className="panel-heading">

            <div>

              <h3>
                Report Safety Issue
              </h3>

              <p>
                Report a safety concern
                for {siteName || "the selected destination"}.
              </p>

            </div>

          </div>


          <form
            className="two-column-form"

            onSubmit={
              submitSafetyIssue
            }
          >

            <div className="field">

              <label>
                Issue type
              </label>


              <select
                value={
                  safetyTitle
                }

                onChange={
                  event =>
                    setSafetyTitle(
                      event.target.value
                    )
                }
              >

                <option value="Safety Hazard">
                  Safety Hazard
                </option>

                <option value="Dangerous Area">
                  Dangerous Area
                </option>

                <option value="Medical Assistance">
                  Medical Assistance
                </option>

                <option value="Crowd Safety Concern">
                  Crowd Safety Concern
                </option>

                <option value="Weather / Environmental Risk">
                  Weather / Environmental Risk
                </option>

                <option value="Other Safety Issue">
                  Other Safety Issue
                </option>

              </select>

            </div>


            <div className="field">

              <label>
                Severity
              </label>


              <select
                value={
                  safetySeverity
                }

                onChange={
                  event => {

                    const value =
                      event.target.value;


                    if (
                      isEmergencySeverity(
                        value
                      )
                    ) {

                      setSafetySeverity(
                        value
                      );
                    }
                  }
                }
              >

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="CRITICAL">
                  Critical
                </option>

              </select>

            </div>


            <div className="field full-field">

              <label>
                Location
              </label>


              <input
                value={
                  safetyLocation
                }

                placeholder="Example: Main entrance, hiking trail, observation deck"

                onChange={
                  event =>
                    setSafetyLocation(
                      event.target.value
                    )
                }
              />

            </div>


            <div className="field full-field">

              <label>
                Description
              </label>


              <textarea
                value={
                  safetyDescription
                }

                rows={4}

                placeholder="Describe the safety issue clearly..."

                onChange={
                  event =>
                    setSafetyDescription(
                      event.target.value
                    )
                }
              />

            </div>


            <button
              type="submit"

              className="button button-primary full-field"

              disabled={
                !siteId ||
                safetySubmitting
              }
            >

              {safetySubmitting
                ? "Reporting..."
                : "Report Safety Issue"}

            </button>

          </form>

        </div>

      </section>


      {/* =====================================================
          SITE / MAINTENANCE ISSUES
      ====================================================== */}

      <section
        className="panel"
        id="site-issue"
      >

        <div className="panel-heading">

          <div>

            <h3>
              Site Issues
            </h3>


            <p>

              {siteId
                ? `Current maintenance issues for ${siteName}.`
                : "Select a destination to view current site issues."}

            </p>

          </div>


          {siteId && (

            <button
              type="button"
              className="button button-secondary"

              onClick={() =>
                void loadMaintenanceIssues()
              }
            >
              Refresh Issues
            </button>

          )}

        </div>


        {maintenanceError && (

          <div className="alert alert-error">
            {maintenanceError}
          </div>

        )}


        {maintenanceMessage && (

          <div className="alert alert-success">
            {maintenanceMessage}
          </div>

        )}


        {!siteId ? (

          <div className="empty-box">
            Select a destination first.
          </div>

        ) : maintenanceLoading ? (

          <div className="empty-box">
            Loading maintenance issues...
          </div>

        ) : maintenanceTasks.length === 0 ? (

          <div className="empty-box">
            No active maintenance issues for {siteName}.
          </div>

        ) : (

          <div className="tourist-operation-grid">

            {maintenanceTasks.map(
              task => (

                <article
                  key={task.id}
                  style={{
                    padding: "22px",
                    borderRadius: "18px",
                    border: "1px solid #d7e8e2",
                    background: "#ffffff",
                    boxShadow: "0 10px 28px rgba(15, 57, 50, 0.06)",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "3px 7px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        color:
                          task.priority === "HIGH"
                            ? "#c4320a"
                            : task.priority === "MEDIUM"
                              ? "#b54708"
                              : "#067647",
                        background:
                          task.priority === "HIGH"
                            ? "#fff6ed"
                            : task.priority === "MEDIUM"
                              ? "#fffaeb"
                              : "#ecfdf3",
                        border:
                          task.priority === "HIGH"
                            ? "1px solid #fedf89"
                            : task.priority === "MEDIUM"
                              ? "1px solid #fedf89"
                              : "1px solid #abefc6",
                      }}
                    >
                      {task.priority}
                    </span>

                    <span
                      style={{
                        color: "#667085",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.8px",
                      }}
                    >
                      SITE ISSUE
                    </span>

                  </div>


                  <strong
                    style={{
                      display: "block",
                      marginTop: "15px",
                      color: "#102f3b",
                      fontSize: "25px",
                      lineHeight: 1.18,
                      fontWeight: 850,
                      letterSpacing: "-0.45px",
                    }}
                  >
                    {task.title}
                  </strong>


                  <div
                    style={{
                      marginTop: "10px",
                      color: "#087a55",
                      fontSize: "12px",
                      fontWeight: 750,
                    }}
                  >
                    {task.siteName}
                  </div>


                  <small
                    style={{
                      display: "block",
                      marginTop: "10px",
                      color: "#667085",
                      fontSize: "12px",
                    }}
                  >
                    Location: {task.location}
                  </small>


                  <p
                    style={{
                      margin: "14px 0 18px",
                      color: "#344054",
                      lineHeight: 1.65,
                    }}
                  >
                    {task.description}
                  </p>


                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        width: "fit-content",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "0.55px",
                        color:
                          task.status === "COMPLETED"
                            ? "#067647"
                            : task.status === "IN_PROGRESS"
                              ? "#175cd3"
                              : "#b54708",
                        background:
                          task.status === "COMPLETED"
                            ? "#ecfdf3"
                            : task.status === "IN_PROGRESS"
                              ? "#eff8ff"
                              : "#fffaeb",
                        border:
                          task.status === "COMPLETED"
                            ? "1px solid #abefc6"
                            : task.status === "IN_PROGRESS"
                              ? "1px solid #b2ddff"
                              : "1px solid #fedf89",
                      }}
                    >
                      {task.status.replaceAll(
                        "_",
                        " "
                      )}
                    </span>


                    <small
                      style={{
                        color: "#98a2b3",
                        fontSize: "11px",
                      }}
                    >
                      {new Date(
                        task.createdAt
                      ).toLocaleString()}
                    </small>

                  </div>

                </article>

              )
            )}

          </div>

        )}


        {/* =================================================
            REPORT MAINTENANCE ISSUE
        ================================================== */}

        <div className="operation-form-section">

          <div className="panel-heading">

            <div>

              <h3>
                Report a Site Issue
              </h3>


              <p>
                Report a maintenance problem
                for {siteName || "the selected destination"}.
              </p>

            </div>

          </div>


          <form
            className="two-column-form"

            onSubmit={
              submitMaintenanceIssue
            }
          >

            <div className="field">

              <label>
                Issue type
              </label>


              <select
                value={
                  maintenanceTitle
                }

                onChange={
                  event =>
                    setMaintenanceTitle(
                      event.target.value
                    )
                }
              >

                <option value="Cleanliness Issue">
                  Cleanliness Issue
                </option>

                <option value="Broken Facility">
                  Broken Facility
                </option>

                <option value="Lighting Issue">
                  Lighting Issue
                </option>

                <option value="Toilet Issue">
                  Toilet Issue
                </option>

                <option value="Damaged Path / Railing">
                  Damaged Path / Railing
                </option>

                <option value="Signage Issue">
                  Signage Issue
                </option>

                <option value="Other Maintenance Issue">
                  Other Maintenance Issue
                </option>

              </select>

            </div>


            <div className="field">

              <label>
                Priority
              </label>


              <select
                value={
                  maintenancePriority
                }

                onChange={
                  event => {

                    const value =
                      event.target.value;


                    if (
                      isMaintenancePriority(
                        value
                      )
                    ) {

                      setMaintenancePriority(
                        value
                      );
                    }
                  }
                }
              >

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

              </select>

            </div>


            <div className="field full-field">

              <label>
                Location
              </label>


              <input
                value={
                  maintenanceLocation
                }

                placeholder="Example: Visitor centre, toilet block, pathway"

                onChange={
                  event =>
                    setMaintenanceLocation(
                      event.target.value
                    )
                }
              />

            </div>


            <div className="field full-field">

              <label>
                Description
              </label>


              <textarea
                value={
                  maintenanceDescription
                }

                rows={4}

                placeholder="Describe the maintenance problem..."

                onChange={
                  event =>
                    setMaintenanceDescription(
                      event.target.value
                    )
                }
              />

            </div>


            <button
              type="submit"

              className="button button-primary full-field"

              disabled={
                !siteId ||
                maintenanceSubmitting
              }
            >

              {maintenanceSubmitting
                ? "Submitting..."
                : "Submit Site Issue"}

            </button>

          </form>

        </div>

      </section>

    </>
  );
}