import {
  useState,
  type FormEvent,
} from "react";

import tourFlowLogo
  from "../assets/tourflow-logo.svg";

import {
  login,
} from "../services/authService";

import type {
  AuthUser,
} from "../types/Auth";

interface Props {
  onLogin:
    (user: AuthUser) => void;
}

export default function LoginPage({
  onLogin,
}: Props) {
  const [email, setEmail] =
    useState(
      "admin@tourflow.local"
    );

  const [password, setPassword] =
    useState(
      "Admin@123"
    );

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function fill(
    newEmail: string,
    newPassword: string
  ) {
    setEmail(newEmail);
    setPassword(newPassword);
    setError("");
  }

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result =
        await login({
          email,
          password,
        });

      onLogin(
        result.user
      );
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <div className="logo-mark">
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

        <div className="login-message">
          <div className="login-location-pill">
            SRI LANKA · SMART DESTINATION OPERATIONS
          </div>

          <span className="eyebrow login-eyebrow">
            SMART DESTINATIONS
          </span>

          <h2>
            Manage tourism safely
            and intelligently.
          </h2>

          <p>
            Visitor capacity, bookings,
            QR ticketing and site operations
            in one connected platform.
          </p>

          <div className="login-capabilities">
            <span>
              <i />
              Capacity-aware visits
            </span>

            <span>
              <i />
              Secure QR entry
            </span>

            <span>
              <i />
              Live site operations
            </span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <form
          className="login-card"
          onSubmit={submit}
        >
          <span className="eyebrow">
            WELCOME BACK
          </span>

          <h2>
            Sign in to TourFlow
          </h2>

          <p className="login-subtitle">
            Enter your authorized
            account details.
          </p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="field">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
            />
          </div>

          <div className="field">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          <button
            type="submit"
            className="button button-primary login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

          <div className="dev-accounts">
            <p>
              Development accounts
            </p>

            <button
              type="button"
              onClick={() =>
                fill(
                  "admin@tourflow.local",
                  "Admin@123"
                )
              }
            >
              <strong>
                System Administrator
              </strong>
              <span>
                admin@tourflow.local
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                fill(
                  "tourist@tourflow.local",
                  "Tourist@123"
                )
              }
            >
              <strong>
                Tourist
              </strong>
              <span>
                tourist@tourflow.local
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                fill(
                  "manager@tourflow.local",
                  "Manager@123"
                )
              }
            >
              <strong>
                Site Manager
              </strong>
              <span>
                manager@tourflow.local
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                fill(
                  "safety@tourflow.local",
                  "Safety@123"
                )
              }
            >
              <strong>
                Safety Officer
              </strong>
              <span>
                safety@tourflow.local
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                fill(
                  "maintenance@tourflow.local",
                  "Maintenance@123"
                )
              }
            >
              <strong>
                Maintenance Officer
              </strong>
              <span>
                maintenance@tourflow.local
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                fill(
                  "guide@tourflow.local",
                  "Guide@123"
                )
              }
            >
              <strong>
                Tour Guide
              </strong>
              <span>
                guide@tourflow.local
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                fill(
                  "entrance@tourflow.local",
                  "Entrance@123"
                )
              }
            >
              <strong>
                Entrance Officer
              </strong>
              <span>
                entrance@tourflow.local
              </span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
