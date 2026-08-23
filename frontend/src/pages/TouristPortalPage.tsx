import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import QRCode from "qrcode";

import ConfirmModal
  from "../components/ConfirmModal";

import TouristOperationsPanel
  from "../components/TouristOperationsPanel";

import {
  getAllSites,
} from "../services/siteService";

import {
  cancelBooking,
  createBooking,
  getMyBookings,
} from "../services/bookingService";

import {
  getTimeSlots,
} from "../services/siteManagerService";

import {
  getAvailableGuides,
  getMyGuideRequests,
  requestGuide,
} from "../services/touristGuideService";

import type {
  AuthUser,
} from "../types/Auth";

import type {
  Booking,
} from "../types/Booking";

import type {
  TouristSite,
} from "../types/TouristSite";

import type {
  TimeSlot,
} from "../types/SiteManager";

import type {
  GuideOption,
  TouristGuideRequest,
} from "../types/TouristGuide";

import {
  getDestinationImageCandidates,
} from "../utils/destinationImages";

import tourFlowLogo
  from "../assets/tourflow-logo.svg";


interface Props {
  user: AuthUser;
  onLogout: () => Promise<void>;
}


function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


function crowdLevel(
  currentVisitors: number,
  dailyCapacity: number
) {
  if (dailyCapacity <= 0) {
    return "LOW";
  }

  const percent =
    (
      currentVisitors /
      dailyCapacity
    ) * 100;

  if (percent < 40) {
    return "LOW";
  }

  if (percent < 70) {
    return "MODERATE";
  }

  if (percent < 90) {
    return "HIGH";
  }

  return "CRITICAL";
}


function DestinationImage({
  site,
}: {
  site: TouristSite;
}) {
  const [
    sourceIndex,
    setSourceIndex,
  ] =
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

        <span>
          {site.name}
        </span>
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
          current =>
            current + 1
        )
      }
    />
  );
}


export default function TouristPortalPage({
  user,
  onLogout,
}: Props) {

  /* =========================
     MAIN DATA
  ========================== */

  const [
    sites,
    setSites,
  ] =
    useState<TouristSite[]>([]);

  const [
    bookings,
    setBookings,
  ] =
    useState<Booking[]>([]);


  /* =========================
     BOOKING FORM
  ========================== */

  const [
    siteId,
    setSiteId,
  ] =
    useState<number | "">("");

  const [
    visitDate,
    setVisitDate,
  ] =
    useState(today());

  const [
    visitTime,
    setVisitTime,
  ] =
    useState("");

  const [
    visitorCount,
    setVisitorCount,
  ] =
    useState(1);


  /* =========================
     TIME SLOTS
  ========================== */

  const [
    timeSlots,
    setTimeSlots,
  ] =
    useState<TimeSlot[]>([]);

  const [
    selectedSlotId,
    setSelectedSlotId,
  ] =
    useState<number | null>(
      null
    );

  const [
    slotsLoading,
    setSlotsLoading,
  ] =
    useState(false);

  const [
    slotError,
    setSlotError,
  ] =
    useState("");


  /* =========================
     TOUR GUIDES
  ========================== */

  const [
    guides,
    setGuides,
  ] =
    useState<GuideOption[]>([]);

  const [
    guideRequests,
    setGuideRequests,
  ] =
    useState<
      TouristGuideRequest[]
    >([]);

  const [
    guideBookingId,
    setGuideBookingId,
  ] =
    useState<number | "">("");

  const [
    requestingGuideId,
    setRequestingGuideId,
  ] =
    useState<number | null>(
      null
    );

  const [
    guideLoading,
    setGuideLoading,
  ] =
    useState(false);

  const [
    guideError,
    setGuideError,
  ] =
    useState("");


  /* =========================
     GENERAL
  ========================== */

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");


  /* =========================
     QR
  ========================== */

  const [
    ticket,
    setTicket,
  ] =
    useState<Booking | null>(
      null
    );

  const [
    qr,
    setQr,
  ] =
    useState("");


  /* =========================
     CANCEL
  ========================== */

  const [
    bookingToCancel,
    setBookingToCancel,
  ] =
    useState<Booking | null>(
      null
    );


  const selectedSite =
    sites.find(
      site =>
        site.id === siteId
    ) ?? null;


  const selectedSlot =
    timeSlots.find(
      slot =>
        slot.id ===
        selectedSlotId
    ) ?? null;


  const currentGuideRequest =
    guideBookingId === ""
      ? null
      : guideRequests.find(
          request =>
            request.bookingId ===
            guideBookingId
        ) ?? null;


  /* =========================
     LOAD MAIN DATA
  ========================== */

  async function load() {
    try {
      setError("");

      const [
        siteData,
        bookingData,
      ] =
        await Promise.all([
          getAllSites(),
          getMyBookings(),
        ]);

      const openSites =
        siteData.filter(
          site =>
            site.status === "OPEN"
        );

      setSites(
        openSites
      );

      setBookings(
        bookingData
      );

      if (
        siteId === "" &&
        openSites.length > 0
      ) {
        setSiteId(
          openSites[0].id
        );
      }
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to load portal"
      );
    }
  }


  /* =========================
     LOAD TIME SLOTS
  ========================== */

  async function loadTimeSlots(
    selectedSiteId: number,
    selectedDate: string
  ) {
    try {
      setSlotsLoading(true);
      setSlotError("");

      setSelectedSlotId(
        null
      );

      setVisitTime(
        ""
      );

      const result =
        await getTimeSlots(
          selectedSiteId,
          selectedDate
        );

      const activeSlots =
        result.filter(
          slot =>
            slot.active
        );

      setTimeSlots(
        activeSlots
      );
    } catch (exception) {
      setTimeSlots([]);

      setSlotError(
        exception instanceof Error
          ? exception.message
          : "Failed to load available time slots"
      );
    } finally {
      setSlotsLoading(false);
    }
  }


  /* =========================
     LOAD GUIDES
  ========================== */

  async function loadGuideData(
    selectedBookingId:
      number | "" =
        guideBookingId,
    selectedSiteId?: number
  ) {
    try {
      setGuideLoading(true);
      setGuideError("");

      const requests =
        await getMyGuideRequests();

      setGuideRequests(
        requests
      );

      /*
       * No booking selected:
       * do not call the site-specific
       * available-guides endpoint.
       */
      if (
        selectedBookingId === ""
      ) {
        setGuides([]);
        return;
      }

      /*
       * For a newly-created booking we can
       * pass the siteId directly. Otherwise
       * find the selected booking locally.
       */
      let bookingSiteId =
        selectedSiteId;

      if (
        bookingSiteId === undefined
      ) {
        const booking =
          bookings.find(
            item =>
              item.id ===
              selectedBookingId
          );

        if (!booking) {
          setGuides([]);

          setGuideError(
            "Selected booking was not found"
          );

          return;
        }

        bookingSiteId =
          booking.siteId;
      }

      const availableGuides =
        await getAvailableGuides(
          bookingSiteId
        );

      setGuides(
        availableGuides
      );
    } catch (exception) {
      setGuides([]);

      setGuideError(
        exception instanceof Error
          ? exception.message
          : "Failed to load tour guides"
      );
    } finally {
      setGuideLoading(false);
    }
  }


  /* =========================
     INITIAL LOAD
  ========================== */

  useEffect(() => {
    void load();
    void loadGuideData();
  }, []);


  /* =========================
     SITE / DATE CHANGED
  ========================== */

  useEffect(() => {
    if (
      siteId === "" ||
      !visitDate
    ) {
      setTimeSlots([]);
      setSelectedSlotId(null);
      setVisitTime("");

      return;
    }

    void loadTimeSlots(
      siteId,
      visitDate
    );
  }, [
    siteId,
    visitDate,
  ]);


  /* =========================
     MESSAGE TIMER
  ========================== */

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

    return () =>
      window.clearTimeout(
        timer
      );
  }, [message]);


  /* =========================
     SELECT SLOT
  ========================== */

  function selectTimeSlot(
    slot: TimeSlot
  ) {
    if (
      !slot.active ||
      slot.remainingPlaces <= 0
    ) {
      return;
    }

    setSelectedSlotId(
      slot.id
    );

    setVisitTime(
      slot.startTime.slice(
        0,
        5
      )
    );

    setError("");
  }


  /* =========================
     SHOW QR
  ========================== */

  async function showTicket(
    booking: Booking
  ) {
    const qrValue =
      JSON.stringify({
        bookingReference:
          booking.bookingReference,

        bookingId:
          booking.id,

        siteId:
          booking.siteId,

        visitDate:
          booking.visitDate,
      });

    const image =
      await QRCode.toDataURL(
        qrValue,
        {
          width: 280,
          margin: 2,
        }
      );

    setQr(
      image
    );

    setTicket(
      booking
    );
  }


  /* =========================
     CREATE BOOKING
  ========================== */

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      siteId === ""
    ) {
      setError(
        "Select a destination"
      );

      return;
    }

    if (
      !selectedSlot
    ) {
      setError(
        "Select an available time slot"
      );

      return;
    }

    if (
      selectedSlot.remainingPlaces <
      visitorCount
    ) {
      setError(
        `Only ${selectedSlot.remainingPlaces} places are available`
      );

      return;
    }

    try {
      setError("");
      setMessage("");

      const booking =
        await createBooking({
          siteId,
          visitDate,
          visitTime,
          visitorCount,
        });

      setMessage(
        `Booking confirmed: ${booking.bookingReference}`
      );

      setGuideBookingId(
        booking.id
      );

      await load();

      await loadTimeSlots(
        siteId,
        visitDate
      );

      await loadGuideData(
        booking.id,
        booking.siteId
      );

      await showTicket(
        booking
      );
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Booking failed"
      );
    }
  }


  /* =========================
     GUIDE REQUEST
  ========================== */

  async function sendGuideRequest(
    guideId: number
  ) {
    if (
      guideBookingId === ""
    ) {
      setGuideError(
        "Select a confirmed booking first"
      );

      return;
    }

    try {
      setRequestingGuideId(
        guideId
      );

      setGuideError("");
      setMessage("");

      const result =
        await requestGuide({
          bookingId:
            guideBookingId,

          guideId,
        });

      setMessage(
        `Guide request sent to ${result.guideName}.`
      );

      await loadGuideData(
        guideBookingId
      );
    } catch (exception) {
      setGuideError(
        exception instanceof Error
          ? exception.message
          : "Failed to request guide"
      );
    } finally {
      setRequestingGuideId(
        null
      );
    }
  }


  /* =========================
     CANCEL BOOKING
  ========================== */

  function cancel(
    booking: Booking
  ) {
    setError("");
    setMessage("");

    setBookingToCancel(
      booking
    );
  }


  function closeCancelModal() {
    setBookingToCancel(
      null
    );
  }


  async function confirmCancelBooking() {
    if (!bookingToCancel) {
      return;
    }

    const booking =
      bookingToCancel;

    setBookingToCancel(
      null
    );

    try {
      setError("");
      setMessage("");

      await cancelBooking(
        booking.id
      );

      setMessage(
        `Booking ${booking.bookingReference} cancelled successfully.`
      );

      if (
        ticket?.id ===
        booking.id
      ) {
        setTicket(
          null
        );
      }

      const cancelledSelectedGuideBooking =
        guideBookingId ===
        booking.id;

      if (
        cancelledSelectedGuideBooking
      ) {
        setGuideBookingId(
          ""
        );

        setGuides([]);
      }

      await load();

      await loadGuideData(
        cancelledSelectedGuideBooking
          ? ""
          : guideBookingId
      );

      if (
        siteId !== ""
      ) {
        await loadTimeSlots(
          siteId,
          visitDate
        );
      }
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Cancel failed"
      );
    }
  }


  return (
    <div className="app">


      {/* ========================
          HEADER
      ========================= */}

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
              TOURIST
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


      <main className="main-content">


        {/* ========================
            HERO
        ========================= */}

        <section className="tourist-hero">

          <div>

            <span className="eyebrow">
              EXPLORE SRI LANKA
            </span>

            <h2>
              Book your next visit.
            </h2>

            <p>
              Select a destination,
              check crowd information,
              choose an available time
              slot and request a tour guide.
            </p>

          </div>


          <div className="stat-card">

            <strong>
              {sites.length}
            </strong>

            <span>
              Open destinations
            </span>

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


        {/* ========================
            DESTINATIONS
        ========================= */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <h3>
                Available Destinations
              </h3>

              <p>
                Select a destination
                for your visit.
              </p>

            </div>

          </div>


          <div className="destination-grid">

            {sites.map(
              site => {

                const level =
                  crowdLevel(
                    site.currentVisitors,
                    site.dailyCapacity
                  );

                return (

                  <button
                    key={site.id}
                    type="button"

                    className={
                      siteId === site.id
                        ? "destination-card selected"
                        : "destination-card"
                    }

                    onClick={() =>
                      setSiteId(
                        site.id
                      )
                    }
                  >

                    <div className="destination-photo">

                      <DestinationImage
                        site={site}
                      />

                    </div>


                    <div className="destination-body">

                      <h4>
                        {site.name}
                      </h4>

                      <p>
                        {site.district}
                      </p>


                      <div className="crowd-line destination-crowd">

                        <span>
                          Crowd
                        </span>

                        <strong>
                          {site.currentVisitors}
                          {" / "}
                          {site.dailyCapacity}
                        </strong>

                      </div>


                      <div
                        style={{
                          marginTop:
                            "10px",

                          fontWeight:
                            700,

                          fontSize:
                            "12px",
                        }}
                      >
                        Crowd Level:
                        {" "}
                        {level}
                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </section>


        {/* ========================
            SITE STATUS
        ========================= */}

        {selectedSite && (

          <section className="panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Site & Crowd Status
                </h3>

                <p>
                  Live information
                  for the selected site.
                </p>

              </div>

            </div>


            <div className="admin-summary-grid">

              <article className="admin-summary-card">

                <span>
                  Site Status
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "14px",
                  }}
                >
                  <i
                    aria-hidden="true"
                    style={{
                      display: "block",
                      width: "10px",
                      height: "10px",
                      flex: "0 0 10px",
                      borderRadius: "50%",
                      background:
                        selectedSite.status === "OPEN"
                          ? "#12b76a"
                          : selectedSite.status === "CLOSED"
                            ? "#f04438"
                            : "#f79009",
                      boxShadow:
                        selectedSite.status === "OPEN"
                          ? "0 0 0 5px rgba(18,183,106,0.12)"
                          : selectedSite.status === "CLOSED"
                            ? "0 0 0 5px rgba(240,68,56,0.12)"
                            : "0 0 0 5px rgba(247,144,9,0.12)",
                    }}
                  />

                  <strong
                    style={{
                      margin: 0,
                      fontSize: "27px",
                      lineHeight: 1.05,
                      fontWeight: 850,
                      letterSpacing: "0.2px",
                      color:
                        selectedSite.status === "OPEN"
                          ? "#079455"
                          : selectedSite.status === "CLOSED"
                            ? "#d92d20"
                            : "#b54708",
                    }}
                  >
                    {selectedSite.status}
                  </strong>
                </div>

                <div
                  aria-hidden="true"
                  style={{
                    width: "46px",
                    height: "3px",
                    marginTop: "11px",
                    borderRadius: "999px",
                    background:
                      selectedSite.status === "OPEN"
                        ? "#12b76a"
                        : selectedSite.status === "CLOSED"
                          ? "#f04438"
                          : "#f79009",
                  }}
                />

              </article>


              <article className="admin-summary-card">

                <span>
                  Current Visitors
                </span>

                <strong className="blue">
                  {selectedSite.currentVisitors}
                </strong>

              </article>


              <article className="admin-summary-card">

                <span>
                  Daily Capacity
                </span>

                <strong>
                  {selectedSite.dailyCapacity}
                </strong>

              </article>


              <article className="admin-summary-card">

                <span>
                  Crowd Level
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "14px",
                  }}
                >
                  <i
                    aria-hidden="true"
                    style={{
                      display: "block",
                      width: "10px",
                      height: "10px",
                      flex: "0 0 10px",
                      borderRadius: "50%",
                      background:
                        crowdLevel(
                          selectedSite.currentVisitors,
                          selectedSite.dailyCapacity
                        ) === "LOW"
                          ? "#12b76a"
                          : crowdLevel(
                              selectedSite.currentVisitors,
                              selectedSite.dailyCapacity
                            ) === "MODERATE"
                            ? "#fdb022"
                            : crowdLevel(
                                selectedSite.currentVisitors,
                                selectedSite.dailyCapacity
                              ) === "HIGH"
                              ? "#f97316"
                              : "#f04438",
                      boxShadow:
                        crowdLevel(
                          selectedSite.currentVisitors,
                          selectedSite.dailyCapacity
                        ) === "LOW"
                          ? "0 0 0 5px rgba(18,183,106,0.12)"
                          : crowdLevel(
                              selectedSite.currentVisitors,
                              selectedSite.dailyCapacity
                            ) === "MODERATE"
                            ? "0 0 0 5px rgba(253,176,34,0.13)"
                            : crowdLevel(
                                selectedSite.currentVisitors,
                                selectedSite.dailyCapacity
                              ) === "HIGH"
                              ? "0 0 0 5px rgba(249,115,22,0.12)"
                              : "0 0 0 5px rgba(240,68,56,0.12)",
                    }}
                  />

                  <strong
                    style={{
                      margin: 0,
                      fontSize: "27px",
                      lineHeight: 1.05,
                      fontWeight: 850,
                      letterSpacing: "0.2px",
                      color:
                        crowdLevel(
                          selectedSite.currentVisitors,
                          selectedSite.dailyCapacity
                        ) === "LOW"
                          ? "#079455"
                          : crowdLevel(
                              selectedSite.currentVisitors,
                              selectedSite.dailyCapacity
                            ) === "MODERATE"
                            ? "#b54708"
                            : crowdLevel(
                                selectedSite.currentVisitors,
                                selectedSite.dailyCapacity
                              ) === "HIGH"
                              ? "#e04f16"
                              : "#d92d20",
                    }}
                  >
                    {crowdLevel(
                      selectedSite.currentVisitors,
                      selectedSite.dailyCapacity
                    )}
                  </strong>
                </div>

                <div
                  aria-hidden="true"
                  style={{
                    width: "46px",
                    height: "3px",
                    marginTop: "11px",
                    borderRadius: "999px",
                    background:
                      crowdLevel(
                        selectedSite.currentVisitors,
                        selectedSite.dailyCapacity
                      ) === "LOW"
                        ? "#12b76a"
                        : crowdLevel(
                            selectedSite.currentVisitors,
                            selectedSite.dailyCapacity
                          ) === "MODERATE"
                          ? "#fdb022"
                          : crowdLevel(
                              selectedSite.currentVisitors,
                              selectedSite.dailyCapacity
                            ) === "HIGH"
                            ? "#f97316"
                            : "#f04438",
                  }}
                />

              </article>

            </div>

          </section>

        )}


        {/* ========================
            BOOK VISIT
        ========================= */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <h3>
                Book Your Visit
              </h3>

              <p>
                Choose a manager-approved
                time slot.
              </p>

            </div>

          </div>


          <form
            className="two-column-form"
            onSubmit={submit}
          >

            <div className="field">

              <label>
                Destination
              </label>

              <select
                value={siteId}

                onChange={
                  event => {

                    const value =
                      event.target.value;

                    setSiteId(
                      value
                        ? Number(value)
                        : ""
                    );
                  }
                }
              >

                <option value="">
                  Select
                </option>

                {sites.map(
                  site => (

                    <option
                      key={site.id}
                      value={site.id}
                    >
                      {site.name}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="field">

              <label>
                Visit date
              </label>

              <input
                type="date"
                min={today()}
                value={visitDate}

                onChange={
                  event =>
                    setVisitDate(
                      event.target.value
                    )
                }
              />

            </div>


            <div className="field">

              <label>
                Number of visitors
              </label>

              <input
                type="number"
                min="1"
                max="20"
                value={visitorCount}

                onChange={
                  event =>
                    setVisitorCount(
                      Number(
                        event.target.value
                      )
                    )
                }
              />

            </div>


            <div className="field">

              <label>
                Selected time
              </label>

              <input
                readOnly

                value={
                  selectedSlot
                    ? `${selectedSlot.startTime.slice(
                        0,
                        5
                      )} - ${selectedSlot.endTime.slice(
                        0,
                        5
                      )}`
                    : "Select a slot below"
                }
              />

            </div>


            <div className="field full-field">

              <label>
                Available Time Slots
              </label>


              {slotsLoading ? (

                <div className="empty-box">
                  Loading time slots...
                </div>

              ) : slotError ? (

                <div className="alert alert-error">
                  {slotError}
                </div>

              ) : timeSlots.length === 0 ? (

                <div className="empty-box">
                  No time slots available
                  for this date.
                </div>

              ) : (

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",

                    gap:
                      "14px",

                    marginTop:
                      "8px",
                  }}
                >

                  {timeSlots.map(
                    slot => {

                      const full =
                        slot.remainingPlaces <=
                        0;

                      const selected =
                        selectedSlotId ===
                        slot.id;

                      return (

                        <button
                          key={slot.id}
                          type="button"
                          disabled={full}

                          className={
                            selected
                              ? "button button-primary"
                              : "button button-secondary"
                          }

                          onClick={() =>
                            selectTimeSlot(
                              slot
                            )
                          }

                          style={{
                            minHeight:
                              "110px",

                            textAlign:
                              "left",
                          }}
                        >

                          <div>

                            <strong>

                              {slot.startTime.slice(
                                0,
                                5
                              )}

                              {" - "}

                              {slot.endTime.slice(
                                0,
                                5
                              )}

                            </strong>


                            <div>
                              Capacity:
                              {" "}
                              {slot.capacity}
                            </div>


                            <div>
                              Reserved:
                              {" "}
                              {slot.reservedVisitors}
                            </div>


                            <div>
                              {full
                                ? "FULL"
                                : `Remaining: ${slot.remainingPlaces}`}
                            </div>

                          </div>

                        </button>

                      );
                    }
                  )}

                </div>

              )}

            </div>


            <button
              type="submit"
              className="button button-primary full-field"

              disabled={
                !selectedSlot ||
                selectedSlot.remainingPlaces <
                  visitorCount
              }
            >
              Confirm Booking
            </button>

          </form>

        </section>


        {/* ========================
            TOUR GUIDES
        ========================= */}

        <section
          className="panel"
          id="tour-guides"
        >

          <div className="panel-heading">

            <div>

              <h3>
                Tour Guides
              </h3>

              <p>
                Select a confirmed booking
                and request an available
                tour guide.
              </p>

            </div>


            <button
              type="button"
              className="button button-secondary"

              onClick={() =>
                void loadGuideData()
              }
            >
              Refresh Guides
            </button>

          </div>


          {guideError && (

            <div className="alert alert-error">
              {guideError}
            </div>

          )}


          <div className="field">

            <label>
              Booking
            </label>

            <select
              value={guideBookingId}

              onChange={
                event => {

                  const value =
                    event.target.value;

                  const nextBookingId:
                    number | "" =
                      value
                        ? Number(value)
                        : "";

                  setGuideBookingId(
                    nextBookingId
                  );

                  setGuideError("");

                  void loadGuideData(
                    nextBookingId
                  );
                }
              }
            >

              <option value="">
                Select confirmed booking
              </option>


              {bookings
                .filter(
                  booking =>
                    booking.status ===
                    "CONFIRMED"
                )
                .map(
                  booking => (

                    <option
                      key={booking.id}
                      value={booking.id}
                    >

                      {booking.siteName}

                      {" - "}

                      {booking.visitDate}

                      {" - "}

                      {booking.visitTime.slice(
                        0,
                        5
                      )}

                    </option>

                  )
                )}

            </select>

          </div>


          {currentGuideRequest && (

            <div
              className="alert alert-success"
              style={{
                marginTop:
                  "16px",
              }}
            >

              Guide:
              {" "}

              <strong>
                {currentGuideRequest.guideName}
              </strong>

              {" · Status: "}

              <strong>
                {currentGuideRequest.requestStatus}
              </strong>

            </div>

          )}


          {guideBookingId === "" ? (

            <div
              className="empty-box"
              style={{
                marginTop:
                  "18px",
              }}
            >
              Select a booking to view
              available tour guides.
            </div>

          ) : guideLoading ? (

            <div
              className="empty-box"
              style={{
                marginTop:
                  "18px",
              }}
            >
              Loading tour guides...
            </div>

          ) : guides.length === 0 ? (

            <div
              className="empty-box"
              style={{
                marginTop:
                  "18px",
              }}
            >
              No active tour guides available.
            </div>

          ) : (

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",

                gap:
                  "16px",

                marginTop:
                  "20px",
              }}
            >

              {guides.map(
                guide => {

                  const sameGuide =
                    currentGuideRequest
                      ?.guideId ===
                      guide.id;

                  const accepted =
                    currentGuideRequest
                      ?.requestStatus ===
                      "ACCEPTED";

                  const pending =
                    sameGuide &&
                    currentGuideRequest
                      ?.requestStatus ===
                      "PENDING";

                  return (

                    <article
                      key={guide.id}
                      className="admin-summary-card guide-service-card"
                    >

                      <span>
                        TOUR GUIDE SERVICE
                      </span>


                      <strong
                        style={{
                          display: "block",
                          marginTop: "12px",
                          color: "#103f37",
                          fontSize: "23px",
                          lineHeight: 1.12,
                          fontWeight: 850,
                          letterSpacing: "-0.45px",
                        }}
                      >
                        {guide.fullName}
                      </strong>


                      <div
                        style={{
                          display: "block",
                          width: "fit-content",
                          marginTop: "11px",
                          color: "#e5a400",
                          fontSize: "14px",
                          lineHeight: 1,
                          fontWeight: 800,
                          letterSpacing: "0.1px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ★ {guide.rating.toFixed(1)}
                      </div>


                      <small>
                        Language:
                        {" "}
                        {guide.language === "EN"
                          ? "English"
                          : guide.language}
                      </small>


                      <button
                        type="button"

                        className={
                          sameGuide
                            ? "button button-secondary"
                            : "button button-primary"
                        }

                        style={{
                          marginTop:
                            "16px",
                        }}

                        disabled={
                          requestingGuideId !==
                            null ||
                          accepted ||
                          pending
                        }

                        onClick={() =>
                          void sendGuideRequest(
                            guide.id
                          )
                        }
                      >

                        {requestingGuideId ===
                        guide.id
                          ? "Sending..."
                          : accepted &&
                              sameGuide
                            ? "Guide Confirmed"
                            : pending
                              ? "Request Pending"
                              : accepted
                                ? "Another Guide Confirmed"
                                : "Request Guide"}

                      </button>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* ========================
            SAFETY + MAINTENANCE
        ========================= */}

        <TouristOperationsPanel
          siteId={
            selectedSite?.id ??
            null
          }

          siteName={
            selectedSite?.name ??
            ""
          }
        />


        {/* ========================
            MY BOOKINGS
        ========================= */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <h3>
                My Bookings
              </h3>

              <p>
                View QR tickets and
                manage reservations.
              </p>

            </div>


            <button
              type="button"
              className="button button-secondary"

              onClick={() => {
                void load();
                void loadGuideData();
              }}
            >
              Refresh
            </button>

          </div>


          {bookings.length === 0 ? (

            <div className="empty-box">
              No bookings yet.
            </div>

          ) : (

            <div className="booking-list">

              {bookings.map(
                booking => {

                  const guideRequest =
                    guideRequests.find(
                      request =>
                        request.bookingId ===
                        booking.id
                    );

                  return (

                    <article
                      className="booking-row"
                      key={booking.id}
                    >

                      <div>

                        <span
                          className={
                            `booking-pill ${booking.status.toLowerCase()}`
                          }
                        >
                          {booking.status.replaceAll(
                            "_",
                            " "
                          )}
                        </span>


                        <h4>
                          {booking.siteName}
                        </h4>


                        <p>
                          {booking.bookingReference}
                        </p>

                      </div>


                      <div className="booking-meta">

                        <div>

                          <span>
                            Date
                          </span>

                          <b>
                            {booking.visitDate}
                          </b>

                        </div>


                        <div>

                          <span>
                            Time
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
                            Tour Guide
                          </span>

                          <b>
                            {guideRequest
                              ? `${guideRequest.guideName} (${guideRequest.requestStatus})`
                              : "Not requested"}
                          </b>

                        </div>

                      </div>


                      <div className="booking-buttons">


                        {booking.status !==
                          "CANCELLED" && (

                          <button
                            type="button"
                            className="button button-primary"

                            onClick={() =>
                              void showTicket(
                                booking
                              )
                            }
                          >
                            View QR
                          </button>

                        )}


                        {booking.status ===
                          "CONFIRMED" && (

                          <button
                            type="button"
                            className="button button-secondary"

                            onClick={() => {

                              setGuideBookingId(
                                booking.id
                              );

                              setGuideError(
                                ""
                              );

                              void loadGuideData(
                                booking.id,
                                booking.siteId
                              );

                              document
                                .getElementById(
                                  "tour-guides"
                                )
                                ?.scrollIntoView({
                                  behavior:
                                    "smooth",
                                });
                            }}
                          >
                            Choose Guide
                          </button>

                        )}


                        {booking.status ===
                          "CONFIRMED" && (

                          <button
                            type="button"
                            className="button button-danger"

                            onClick={() =>
                              cancel(
                                booking
                              )
                            }
                          >
                            Cancel
                          </button>

                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>


      {/* ========================
          QR MODAL
      ========================= */}

      {ticket && (

        <div
          className="modal-backdrop"

          onClick={() =>
            setTicket(
              null
            )
          }
        >

          <div
            className="qr-modal"

            onClick={
              event =>
                event.stopPropagation()
            }
          >

            <span className="eyebrow">
              TOURFLOW DIGITAL TICKET
            </span>


            <h3>
              {ticket.siteName}
            </h3>


            <p>
              {ticket.bookingReference}
            </p>


            <img
              src={qr}
              alt="QR ticket"
              className="qr-image"
            />


            <div className="ticket-grid">

              <div>

                <span>
                  Date
                </span>

                <b>
                  {ticket.visitDate}
                </b>

              </div>


              <div>

                <span>
                  Time
                </span>

                <b>
                  {ticket.visitTime.slice(
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
                  {ticket.visitorCount}
                </b>

              </div>


              <div>

                <span>
                  Status
                </span>

                <b>
                  {ticket.status}
                </b>

              </div>


              <div>

                <span>
                  Tour Guide
                </span>

                <b>
                  {guideRequests.find(
                    request =>
                      request.bookingId ===
                      ticket.id
                  )?.guideName ??
                    "Not requested"}
                </b>

              </div>


              <div>

                <span>
                  Guide Status
                </span>

                <b>
                  {guideRequests.find(
                    request =>
                      request.bookingId ===
                      ticket.id
                  )?.requestStatus ??
                    "N/A"}
                </b>

              </div>

            </div>


            <p className="ticket-note">
              Present this QR ticket
              at the entrance.
            </p>


            <button
              type="button"
              className="button button-secondary"

              onClick={() =>
                setTicket(
                  null
                )
              }
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* ========================
          CANCEL MODAL
      ========================= */}

      <ConfirmModal
        open={
          bookingToCancel !==
          null
        }

        title="Cancel Booking"

        message={
          bookingToCancel
            ? `Are you sure you want to cancel booking "${bookingToCancel.bookingReference}"? This action cannot be undone.`
            : ""
        }

        confirmText="Cancel Booking"

        cancelText="Keep Booking"

        danger

        onConfirm={
          confirmCancelBooking
        }

        onCancel={
          closeCancelModal
        }
      />

    </div>
  );
}