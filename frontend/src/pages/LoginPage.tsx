import {
  useState,
  type FormEvent,
} from "react";

import tourFlowLogo
  from "../assets/tourflow-logo.svg";

import {
  login,
  register,
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

  const [registerMode, setRegisterMode] =
    useState(false);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  function clearForm() {

    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }


  function switchMode() {

    clearForm();

    setRegisterMode(
      current => !current
    );
  }


  async function submit(
    event: FormEvent
  ) {

    event.preventDefault();


    try {

      setLoading(true);
      setError("");


      /*
       * CREATE NEW TOURIST ACCOUNT
       */
      if (registerMode) {

        if (
          password !==
          confirmPassword
        ) {

          setError(
            "Passwords do not match"
          );

          return;
        }


        if (
          password.length < 8
        ) {

          setError(
            "Password must contain at least 8 characters"
          );

          return;
        }


        const result =
          await register({
            fullName:
              fullName.trim(),

            email:
              email.trim(),

            password,
          });


        /*
         * Backend automatically creates
         * this account as TOURIST.
         *
         * Registration also returns
         * an authentication token,
         * therefore the new tourist
         * can immediately enter
         * the Tourist Portal.
         */
        onLogin(
          result.user
        );

        return;
      }


      /*
       * NORMAL LOGIN
       */
      const result =
        await login({
          email:
            email.trim(),

          password,
        });


      /*
       * The backend returns the role.
       * App.tsx automatically opens
       * the correct dashboard.
       */
      onLogin(
        result.user
      );


    } catch (exception) {

      setError(
        exception instanceof Error
          ? exception.message
          : registerMode
            ? "Registration failed"
            : "Login failed"
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <main className="login-page">


      {/* LEFT SIDE */}

      <section className="login-visual">

        <div className="login-brand">

          <div className="logo-mark">

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


      {/* RIGHT SIDE */}

      <section className="login-panel">

        <form
          className="login-card"
          onSubmit={submit}
        >


          <span className="eyebrow">

            {registerMode
              ? "JOIN TOURFLOW"
              : "WELCOME BACK"}

          </span>


          <h2>

            {registerMode
              ? "Create your account"
              : "Sign in to TourFlow"}

          </h2>


          <p className="login-subtitle">

            {registerMode
              ? "Create a tourist account to discover and book destinations."
              : "Enter your authorized account details."}

          </p>


          {error && (

            <div className="alert alert-error">
              {error}
            </div>

          )}


          {/* FULL NAME - REGISTER ONLY */}

          {registerMode && (

            <div className="field">

              <label htmlFor="register-name">
                Full Name
              </label>

              <input
                id="register-name"
                type="text"
                value={fullName}

                onChange={
                  event =>
                    setFullName(
                      event.target.value
                    )
                }

                autoComplete="name"
                placeholder="Enter your full name"
                maxLength={120}
                required
              />

            </div>

          )}


          {/* EMAIL */}

          <div className="field">

            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              value={email}

              onChange={
                event =>
                  setEmail(
                    event.target.value
                  )
              }

              autoComplete="email"
              placeholder="Enter your email"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="field">

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}

              onChange={
                event =>
                  setPassword(
                    event.target.value
                  )
              }

              autoComplete={
                registerMode
                  ? "new-password"
                  : "current-password"
              }

              placeholder={
                registerMode
                  ? "Minimum 8 characters"
                  : "Enter your password"
              }

              minLength={
                registerMode
                  ? 8
                  : undefined
              }

              maxLength={72}
              required
            />

          </div>


          {/* CONFIRM PASSWORD */}

          {registerMode && (

            <div className="field">

              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}

                onChange={
                  event =>
                    setConfirmPassword(
                      event.target.value
                    )
                }

                autoComplete="new-password"
                placeholder="Enter password again"
                minLength={8}
                maxLength={72}
                required
              />

            </div>

          )}


          {/* MAIN BUTTON */}

          <button
            type="submit"
            className="button button-primary login-button"
            disabled={loading}
          >

            {loading
              ? registerMode
                ? "Creating account..."
                : "Signing in..."
              : registerMode
                ? "Create Account"
                : "Sign In"}

          </button>


          {/* SWITCH LOGIN / REGISTER */}

          <div
            style={{
              marginTop: "18px",
              textAlign: "center",
            }}
          >

            <p
              style={{
                marginBottom: "8px",
              }}
            >

              {registerMode
                ? "Already have an account?"
                : "New tourist?"}

            </p>


            <button
              type="button"
              className="button"
              onClick={switchMode}
              disabled={loading}
            >

              {registerMode
                ? "Back to Sign In"
                : "Create Tourist Account"}

            </button>

          </div>

        </form>

      </section>

    </main>
  );
}