import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import QRCode from "qrcode";

import ConfirmModal
  from "../components/ConfirmModal";

import {
  getAllSites,
} from "../services/siteService";

import {
  cancelBooking,
  createBooking,
  getMyBookings,
} from "../services/bookingService";

import type {
  AuthUser,
} from "../types/Auth";

import type {
  Booking,
} from "../types/Booking";

import type {
  TouristSite,
} from "../types/TouristSite";

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


function DestinationImage({
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
          current => current + 1
        )
      }
    />
  );
}


export default function TouristPortalPage({
  user,
  onLogout,
}: Props) {

  const [sites, setSites] =
    useState<TouristSite[]>([]);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [siteId, setSiteId] =
    useState<number | "">("");

  const [visitDate, setVisitDate] =
    useState(today());

  const [visitTime, setVisitTime] =
    useState("10:00");

  const [
    visitorCount,
    setVisitorCount,
  ] =
    useState(1);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [ticket, setTicket] =
    useState<Booking | null>(
      null
    );

  const [qr, setQr] =
    useState("");


  /*
   * Booking selected for
   * cancellation confirmation.
   */
  const [
    bookingToCancel,
    setBookingToCancel,
  ] =
    useState<Booking | null>(
      null
    );


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

      const open =
        siteData.filter(
          site =>
            site.status === "OPEN"
        );

      setSites(
        open
      );

      setBookings(
        bookingData
      );

      if (
        siteId === "" &&
        open.length > 0
      ) {
        setSiteId(
          open[0].id
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


  useEffect(() => {
    void load();
  }, []);


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


      await load();


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


  /*
   * Clicking Cancel only opens
   * our custom confirmation modal.
   *
   * No window.confirm() is used.
   */
  function cancel(
    booking: Booking
  ) {

    setError("");
    setMessage("");

    setBookingToCancel(
      booking
    );
  }


  /*
   * Close custom cancellation modal.
   */
  function closeCancelModal() {

    setBookingToCancel(
      null
    );
  }


  /*
   * Actual booking cancellation.
   */
  async function confirmCancelBooking() {

    if (!bookingToCancel) {
      return;
    }


    /*
     * Save booking before
     * clearing modal state.
     */
    const booking =
      bookingToCancel;


    /*
     * Close modal immediately.
     *
     * Therefore even if backend
     * takes time, screen will not
     * remain blurred or stuck.
     */
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


      /*
       * Close QR ticket if the same
       * booking was currently open.
       */
      if (
        ticket?.id === booking.id
      ) {
        setTicket(
          null
        );
      }


      await load();

    } catch (exception) {

      console.error(
        "Failed to cancel booking:",
        exception
      );


      setError(
        exception instanceof Error
          ? exception.message
          : "Cancel failed"
      );
    }
  }


  return (

    <div className="app">


      {/* =========================
          TOP BAR
      ========================== */}

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


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="main-content">


        {/* =======================
            HERO
        ======================== */}

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
              reserve your visit and
              keep your digital QR
              ticket ready for entry.
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


        {/* =======================
            ERROR
        ======================== */}

        {error && (

          <div className="alert alert-error">
            {error}
          </div>

        )}


        {/* =======================
            SUCCESS MESSAGE
        ======================== */}

        {message && (

          <div className="alert alert-success">
            {message}
          </div>

        )}


        {/* =======================
            DESTINATIONS
        ======================== */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <h3>
                Available Destinations
              </h3>

              <p>
                Select a destination
                to begin your booking.
              </p>

            </div>

          </div>


          <div className="destination-grid">

            {sites.map(
              site => (

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

                  </div>

                </button>

              )
            )}

          </div>

        </section>


        {/* =======================
            BOOK VISIT
        ======================== */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <h3>
                Book Your Visit
              </h3>

              <p>
                Choose destination,
                date, time and visitors.
              </p>

            </div>

          </div>


          <form
            className="two-column-form"
            onSubmit={submit}
          >


            {/* DESTINATION */}

            <div className="field">

              <label>
                Destination
              </label>

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


            {/* DATE */}

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


            {/* TIME */}

            <div className="field">

              <label>
                Visit time
              </label>

              <input
                type="time"
                value={visitTime}

                onChange={
                  event =>
                    setVisitTime(
                      event.target.value
                    )
                }
              />

            </div>


            {/* VISITOR COUNT */}

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


            <button
              type="submit"
              className="button button-primary full-field"
            >
              Confirm Booking
            </button>

          </form>

        </section>


        {/* =======================
            MY BOOKINGS
        ======================== */}

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

              onClick={() =>
                void load()
              }
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
                booking => (

                  <article
                    className="booking-row"
                    key={booking.id}
                  >


                    {/* BOOKING INFO */}

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


                    {/* META */}

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

                    </div>


                    {/* BUTTONS */}

                    <div className="booking-buttons">


                      {/* VIEW QR */}

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


                      {/* CANCEL BOOKING */}

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

                )
              )}

            </div>

          )}

        </section>

      </main>


      {/* =========================
          QR TICKET MODAL
      ========================== */}

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

            {/* Duplicate title removed */}

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


      {/* =========================
          CANCEL BOOKING MODAL
      ========================== */}

      <ConfirmModal

        open={
          bookingToCancel !== null
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