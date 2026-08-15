import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import "./SiteManagerPage.css";

import ConfirmModal
  from "../components/ConfirmModal";

import tourFlowLogo
  from "../assets/tourflow-logo.svg";

import {
  getAllSites,
} from "../services/siteService";

import {
  createTimeSlot,
  deleteTimeSlot,
  getManagerDashboard,
  getTimeSlots,
  updateTimeSlot,
} from "../services/siteManagerService";

import type {
  AuthUser,
} from "../types/Auth";

import type {
  TouristSite,
} from "../types/TouristSite";

import type {
  SiteManagerDashboard,
  TimeSlot,
  TimeSlotRequest,
} from "../types/SiteManager";


interface Props {
  user: AuthUser;
  onLogout: () => Promise<void>;
}


function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


export default function SiteManagerPage({
  user,
  onLogout,
}: Props) {

  const [sites, setSites] =
    useState<TouristSite[]>([]);

  const [siteId, setSiteId] =
    useState<number | "">("");

  const [date, setDate] =
    useState(today());

  const [dashboard, setDashboard] =
    useState<SiteManagerDashboard | null>(
      null
    );

  const [slots, setSlots] =
    useState<TimeSlot[]>([]);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [startTime, setStartTime] =
    useState("08:00");

  const [endTime, setEndTime] =
    useState("10:00");

  const [capacity, setCapacity] =
    useState(300);

  const [active, setActive] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  /*
   * CUSTOM DELETE MODAL
   */
  const [
    slotToDelete,
    setSlotToDelete,
  ] =
    useState<TimeSlot | null>(
      null
    );


  useEffect(() => {

    async function initialLoad() {

      try {

        const result =
          await getAllSites();

        setSites(result);

        if (result.length > 0) {

          setSiteId(
            result[0].id
          );
        }

      } catch (exception) {

        setError(
          exception instanceof Error
            ? exception.message
            : "Failed to load sites"
        );
      }
    }

    void initialLoad();

  }, []);


  useEffect(() => {

    if (siteId === "") {
      return;
    }

    void loadManagerData(
      siteId,
      date
    );

  }, [
    siteId,
    date,
  ]);


  async function loadManagerData(
    selectedSiteId: number,
    selectedDate: string
  ) {

    try {

      setLoading(true);
      setError("");

      const [
        dashboardResult,
        slotResult,
      ] =
        await Promise.all([

          getManagerDashboard(
            selectedSiteId,
            selectedDate
          ),

          getTimeSlots(
            selectedSiteId,
            selectedDate
          ),
        ]);

      setDashboard(
        dashboardResult
      );

      setSlots(
        slotResult
      );

    } catch (exception) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to load manager dashboard"
      );

    } finally {

      setLoading(false);
    }
  }


  function clearForm() {

    setEditingId(null);

    setStartTime(
      "08:00"
    );

    setEndTime(
      "10:00"
    );

    setCapacity(
      300
    );

    setActive(
      true
    );
  }


  function editSlot(
    slot: TimeSlot
  ) {

    /*
     * Make sure no delete modal
     * remains open.
     */
    setSlotToDelete(
      null
    );

    setEditingId(
      slot.id
    );

    setStartTime(
      slot.startTime.slice(
        0,
        5
      )
    );

    setEndTime(
      slot.endTime.slice(
        0,
        5
      )
    );

    setCapacity(
      slot.capacity
    );

    setActive(
      slot.active
    );

    window.scrollTo({
      top: 250,
      behavior: "smooth",
    });
  }


  async function saveSlot(
    event: FormEvent
  ) {

    event.preventDefault();

    if (siteId === "") {

      setError(
        "Select a tourist site"
      );

      return;
    }


    if (
      endTime <= startTime
    ) {

      setError(
        "End time must be after start time"
      );

      return;
    }


    const request:
    TimeSlotRequest = {

      siteId,

      slotDate:
        date,

      startTime,

      endTime,

      capacity,

      active,
    };


    try {

      setSaving(true);

      setError("");

      setMessage("");


      if (
        editingId === null
      ) {

        await createTimeSlot(
          request
        );

        setMessage(
          "Time slot created successfully."
        );

      } else {

        await updateTimeSlot(
          editingId,
          request
        );

        setMessage(
          "Time slot updated successfully."
        );
      }


      clearForm();


      await loadManagerData(
        siteId,
        date
      );

    } catch (exception) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to save time slot"
      );

    } finally {

      setSaving(false);
    }
  }


  /*
   * DELETE BUTTON
   *
   * Only opens our custom modal.
   * NO window.confirm().
   */
  function removeSlot(
    slot: TimeSlot
  ) {

    setError("");

    setMessage("");

    setSlotToDelete(
      slot
    );
  }


  /*
   * CLOSE DELETE MODAL
   */
  function cancelDeleteSlot() {

    setSlotToDelete(
      null
    );
  }


  /*
   * ACTUAL DELETE
   */
  async function confirmDeleteSlot() {

    if (!slotToDelete) {
      return;
    }


    /*
     * Save current slot before
     * closing the modal.
     */
    const slot =
      slotToDelete;


    /*
     * Close the modal immediately.
     * This prevents the page
     * from remaining blurred.
     */
    setSlotToDelete(
      null
    );


    try {

      setError("");

      setMessage("");


      await deleteTimeSlot(
        slot.id
      );


      /*
       * If the same slot was
       * being edited, clear form.
       */
      if (
        editingId === slot.id
      ) {

        clearForm();
      }


      setMessage(
        `Time slot ${slot.startTime.slice(
          0,
          5
        )} - ${slot.endTime.slice(
          0,
          5
        )} deleted successfully.`
      );


      if (
        siteId !== ""
      ) {

        await loadManagerData(
          siteId,
          date
        );
      }

    } catch (exception) {

      console.error(
        "Failed to delete time slot:",
        exception
      );


      setError(
        exception instanceof Error
          ? exception.message
          : "Delete failed"
      );
    }
  }


  const crowdClass =
    dashboard
      ? dashboard.crowdLevel
          .toLowerCase()
      : "low";


  return (

    <div className="manager-page">


      {/* =========================
          HEADER
      ========================== */}

      <header className="manager-header">

        <div className="manager-brand">

          <div className="manager-logo">

            <img
              src={tourFlowLogo}
              alt="TourFlow"
            />

          </div>


          <div>

            <h1>
              TourFlow
            </h1>

            <span>
              Smart Tourism Management
            </span>

          </div>

        </div>


        <div className="manager-user">

          <div>

            <strong>
              {user.fullName}
            </strong>

            <span>
              SITE MANAGER
            </span>

          </div>


          <button
            type="button"
            onClick={() =>
              void onLogout()
            }
          >
            Logout
          </button>

        </div>

      </header>


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="manager-content">


        {/* =======================
            TITLE + FILTERS
        ======================== */}

        <section className="manager-title-row">

          <div>

            <span className="manager-eyebrow">
              SITE OPERATIONS
            </span>

            <h2>
              Site Manager Dashboard
            </h2>

            <p>
              Monitor crowd levels,
              bookings and visitor
              time slots.
            </p>

          </div>


          <div className="manager-filters">


            <label>

              Tourist Site

              <select
                value={siteId}

                onChange={
                  event =>
                    setSiteId(
                      Number(
                        event.target.value
                      )
                    )
                }
              >

                {sites.map(
                  site => (

                    <option
                      value={site.id}
                      key={site.id}
                    >
                      {site.name}
                    </option>

                  )
                )}

              </select>

            </label>


            <label>

              Date

              <input
                type="date"

                value={date}

                onChange={
                  event =>
                    setDate(
                      event.target.value
                    )
                }
              />

            </label>

          </div>

        </section>


        {/* ERROR */}

        {error && (

          <div className="manager-alert error">
            {error}
          </div>

        )}


        {/* SUCCESS */}

        {message && (

          <div className="manager-alert success">
            {message}
          </div>

        )}


        {/* LOADING */}

        {loading && (

          <div className="manager-loading">
            Updating dashboard...
          </div>

        )}


        {/* =======================
            DASHBOARD
        ======================== */}

        {dashboard && (

          <>

            <section className="manager-stats">


              <article>

                <span>
                  Daily Capacity
                </span>

                <strong>
                  {dashboard.dailyCapacity}
                </strong>

              </article>


              <article>

                <span>
                  Reserved Visitors
                </span>

                <strong>
                  {dashboard.reservedVisitors}
                </strong>

              </article>


              <article>

                <span>
                  Current Visitors
                </span>

                <strong className="green">
                  {dashboard.currentVisitors}
                </strong>

              </article>


              <article>

                <span>
                  Remaining Capacity
                </span>

                <strong>
                  {dashboard.remainingCapacity}
                </strong>

              </article>

            </section>


            {/* CROWD */}

            <section className="manager-panel crowd-panel">


              <div className="crowd-main">

                <div>

                  <span className="manager-eyebrow">
                    LIVE CROWD STATUS
                  </span>

                  <h3>
                    {dashboard.siteName}
                  </h3>

                  <p>
                    {dashboard.district}

                    {" • "}

                    {dashboard.date}
                  </p>

                </div>


                <div
                  className={
                    `crowd-badge ${crowdClass}`
                  }
                >
                  {dashboard.crowdLevel}
                </div>

              </div>


              <div className="crowd-progress">

                <div
                  className={
                    crowdClass
                  }

                  style={{
                    width:
                      `${Math.min(
                        dashboard.occupancyPercent,
                        100
                      )}%`,
                  }}
                />

              </div>


              <div className="crowd-footer">

                <span>
                  {dashboard.occupancyPercent}%
                  current occupancy
                </span>

                <span>
                  {dashboard.confirmedBookings}
                  {" confirmed booking(s)"}
                </span>

                <span>
                  {dashboard.checkedInVisitors}
                  {" checked-in visitor(s)"}
                </span>

              </div>

            </section>

          </>

        )}


        {/* =======================
            TIME SLOT FORM
        ======================== */}

        <section className="manager-panel">


          <div className="manager-panel-heading">

            <div>

              <h3>
                Time Slot Management
              </h3>

              <p>
                Configure visitor
                capacity for each
                time period.
              </p>

            </div>


            {editingId !== null && (

              <button
                className="manager-secondary"
                type="button"
                onClick={clearForm}
              >
                Cancel Edit
              </button>

            )}

          </div>


          <form
            className="slot-form"
            onSubmit={saveSlot}
          >


            <label>

              Start Time

              <input
                type="time"

                value={startTime}

                onChange={
                  event =>
                    setStartTime(
                      event.target.value
                    )
                }

                required
              />

            </label>


            <label>

              End Time

              <input
                type="time"

                value={endTime}

                onChange={
                  event =>
                    setEndTime(
                      event.target.value
                    )
                }

                required
              />

            </label>


            <label>

              Slot Capacity

              <input
                type="number"
                min="1"

                value={capacity}

                onChange={
                  event =>
                    setCapacity(
                      Number(
                        event.target.value
                      )
                    )
                }

                required
              />

            </label>


            <label className="active-check">

              <input
                type="checkbox"

                checked={active}

                onChange={
                  event =>
                    setActive(
                      event.target.checked
                    )
                }
              />

              Active

            </label>


            <button
              className="manager-primary"
              type="submit"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : editingId === null
                  ? "Add Time Slot"
                  : "Save Changes"}

            </button>

          </form>

        </section>


        {/* =======================
            TIME SLOT LIST
        ======================== */}

        <section className="manager-panel">


          <div className="manager-panel-heading">

            <div>

              <h3>
                Time Slots
              </h3>

              <p>
                Reserved visitors are
                calculated automatically
                from tourist bookings.
              </p>

            </div>


            <button
              className="manager-secondary"
              type="button"

              onClick={() => {

                if (
                  siteId !== ""
                ) {

                  void loadManagerData(
                    siteId,
                    date
                  );
                }

              }}
            >
              Refresh
            </button>

          </div>


          {slots.length === 0 ? (

            <div className="slot-empty">

              No time slots configured
              for this date.

            </div>

          ) : (

            <div className="slot-list">


              {slots.map(
                slot => (

                  <article
                    className="slot-card"
                    key={slot.id}
                  >


                    {/* TIME */}

                    <div className="slot-time">

                      <span>
                        TIME
                      </span>

                      <strong>

                        {slot.startTime.slice(
                          0,
                          5
                        )}

                        {" – "}

                        {slot.endTime.slice(
                          0,
                          5
                        )}

                      </strong>

                    </div>


                    {/* NUMBERS */}

                    <div className="slot-numbers">


                      <div>

                        <span>
                          Capacity
                        </span>

                        <b>
                          {slot.capacity}
                        </b>

                      </div>


                      <div>

                        <span>
                          Reserved
                        </span>

                        <b>
                          {slot.reservedVisitors}
                        </b>

                      </div>


                      <div>

                        <span>
                          Remaining
                        </span>

                        <b>
                          {slot.remainingPlaces}
                        </b>

                      </div>


                      <div>

                        <span>
                          Utilization
                        </span>

                        <b>
                          {slot.utilizationPercent}%
                        </b>

                      </div>

                    </div>


                    {/* UTILIZATION */}

                    <div className="slot-util">

                      <div
                        style={{
                          width:
                            `${Math.min(
                              slot.utilizationPercent,
                              100
                            )}%`,
                        }}
                      />

                    </div>


                    {/* ACTIONS */}

                    <div className="slot-actions">


                      <span
                        className={
                          slot.active
                            ? "slot-status active"
                            : "slot-status inactive"
                        }
                      >

                        {slot.active
                          ? "ACTIVE"
                          : "INACTIVE"}

                      </span>


                      {/* EDIT */}

                      <button
                        type="button"

                        className={
                          "manager-primary small"
                        }

                        onClick={() =>
                          editSlot(
                            slot
                          )
                        }
                      >
                        Edit
                      </button>


                      {/* DELETE */}

                      <button
                        type="button"

                        className={
                          "manager-danger small"
                        }

                        onClick={() =>
                          removeSlot(
                            slot
                          )
                        }
                      >
                        Delete
                      </button>


                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </main>


      {/* =========================
          CUSTOM DELETE MODAL
      ========================== */}

      <ConfirmModal

        open={
          slotToDelete !== null
        }

        title="Delete Time Slot"

        message={
          slotToDelete
            ? `Are you sure you want to delete the ${slotToDelete.startTime.slice(
                0,
                5
              )} - ${slotToDelete.endTime.slice(
                0,
                5
              )} time slot? This action cannot be undone.`
            : ""
        }

        confirmText="Delete"

        cancelText="Cancel"

        danger

        onConfirm={
          confirmDeleteSlot
        }

        onCancel={
          cancelDeleteSlot
        }

      />


    </div>
  );
}