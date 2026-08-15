import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import "./App.css";

import LoginPage
  from "./pages/LoginPage";

import SiteManagementPage
  from "./pages/SiteManagementPage";

import TouristPortalPage
  from "./pages/TouristPortalPage";

import EntranceOfficerPage
  from "./pages/EntranceOfficerPage";

import SiteManagerPage
  from "./pages/SiteManagerPage";

import SafetyOfficerPage
  from "./pages/SafetyOfficerPage";

import MaintenanceOfficerPage
  from "./pages/MaintenanceOfficerPage";

import TourGuidePage
  from "./pages/TourGuidePage";

import {
  getStoredUser,
  logout,
} from "./services/authService";

import type {
  AuthUser,
} from "./types/Auth";

import "./ProfessionalInternal.css";


const MOTION_TARGETS = [
  ".page-heading",
  ".tourist-hero",
  ".manager-title-row",
  ".staff-title",
  ".admin-summary-card",
  ".manager-stats article",
  ".staff-stat",
  ".panel",
  ".manager-panel",
  ".staff-panel",
  ".admin-overview-panel",
  ".site-card",
  ".destination-card",
  ".booking-row",
  ".staff-item",
  ".guide-row",
  ".login-card",
  ".login-message",
].join(",");


function MotionBackdrop() {
  return (
    <div
      className="tf-motion-backdrop"
      aria-hidden="true"
    >
      <span className="tf-motion-orb tf-motion-orb-a" />

      <span className="tf-motion-orb tf-motion-orb-b" />

      <span className="tf-motion-orb tf-motion-orb-c" />

      <span className="tf-motion-grid" />
    </div>
  );
}


function useProfessionalMotion(
  sceneKey: string
) {
  useEffect(() => {
    const root =
      document.documentElement;

    const prefersReduced =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;


    const updatePointer = (
      event: PointerEvent
    ) => {
      if (prefersReduced) {
        return;
      }

      const x =
        (
          event.clientX /
          window.innerWidth
        ) * 100;

      const y =
        (
          event.clientY /
          window.innerHeight
        ) * 100;


      root.style.setProperty(
        "--tf-pointer-x",
        `${x.toFixed(2)}%`
      );


      root.style.setProperty(
        "--tf-pointer-y",
        `${y.toFixed(2)}%`
      );


      root.style.setProperty(
        "--tf-pointer-rotate-x",
        `${
          (
            (
              0.5 -
              event.clientY /
                window.innerHeight
            ) * 1.4
          ).toFixed(2)
        }deg`
      );


      root.style.setProperty(
        "--tf-pointer-rotate-y",
        `${
          (
            (
              event.clientX /
                window.innerWidth -
              0.5
            ) * 1.4
          ).toFixed(2)
        }deg`
      );
    };


    window.addEventListener(
      "pointermove",
      updatePointer,
      {
        passive: true,
      }
    );


    if (prefersReduced) {
      document
        .querySelectorAll<HTMLElement>(
          MOTION_TARGETS
        )
        .forEach(
          element => {
            element.classList.add(
              "tf-reveal",
              "tf-reveal-visible"
            );
          }
        );


      return () => {
        window.removeEventListener(
          "pointermove",
          updatePointer
        );
      };
    }


    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(
            entry => {
              if (
                entry.isIntersecting
              ) {
                entry.target
                  .classList
                  .add(
                    "tf-reveal-visible"
                  );

                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.08,

          rootMargin:
            "0px 0px -35px 0px",
        }
      );


    let revealIndex = 0;


    const decorate = (
      parent: ParentNode
    ) => {
      parent
        .querySelectorAll<HTMLElement>(
          MOTION_TARGETS
        )
        .forEach(
          element => {
            if (
              element.dataset
                .tfMotionReady ===
              "true"
            ) {
              return;
            }

            element.dataset
              .tfMotionReady =
              "true";


            element.classList.add(
              "tf-reveal"
            );


            element.style
              .setProperty(
                "--tf-reveal-delay",
                `${
                  Math.min(
                    revealIndex * 38,
                    260
                  )
                }ms`
              );


            revealIndex += 1;

            observer.observe(
              element
            );
          }
        );
    };


    const timer =
      window.setTimeout(
        () => {
          decorate(
            document
          );
        },
        20
      );


    const mutationObserver =
      new MutationObserver(
        mutations => {
          mutations.forEach(
            mutation => {
              mutation
                .addedNodes
                .forEach(
                  node => {
                    if (
                      node instanceof
                      HTMLElement
                    ) {
                      if (
                        node.matches(
                          MOTION_TARGETS
                        )
                      ) {
                        node.dataset
                          .tfMotionReady =
                          "true";

                        node.classList
                          .add(
                            "tf-reveal"
                          );

                        observer.observe(
                          node
                        );
                      }

                      decorate(
                        node
                      );
                    }
                  }
                );
            }
          );
        }
      );


    mutationObserver.observe(
      document.getElementById(
        "root"
      ) ??
        document.body,
      {
        childList: true,
        subtree: true,
      }
    );


    return () => {
      window.clearTimeout(
        timer
      );

      window.removeEventListener(
        "pointermove",
        updatePointer
      );

      observer.disconnect();

      mutationObserver.disconnect();
    };

  }, [sceneKey]);
}


function App() {
  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      getStoredUser()
    );


  useProfessionalMotion(
    user?.role ?? "LOGIN"
  );


  async function handleLogout() {
    await logout();

    setUser(
      null
    );
  }


  let page: ReactNode;


  if (!user) {

    page = (
      <LoginPage
        onLogin={
          setUser
        }
      />
    );

  } else if (
    user.role ===
    "TOURIST"
  ) {

    page = (
      <TouristPortalPage
        user={
          user
        }
        onLogout={
          handleLogout
        }
      />
    );

  } else if (
    user.role ===
    "ENTRANCE_OFFICER"
  ) {

    page = (
      <EntranceOfficerPage
        user={
          user
        }
        onLogout={
          handleLogout
        }
      />
    );

  } else if (
    user.role ===
    "SITE_MANAGER"
  ) {

    page = (
      <SiteManagerPage
        user={
          user
        }
        onLogout={
          handleLogout
        }
      />
    );

  } else if (
    user.role ===
    "SAFETY_OFFICER"
  ) {

    page = (
      <SafetyOfficerPage
        user={
          user
        }
        onLogout={
          handleLogout
        }
      />
    );

  } else if (
    user.role ===
    "MAINTENANCE_OFFICER"
  ) {

    page = (
      <MaintenanceOfficerPage
        user={
          user
        }
        onLogout={
          handleLogout
        }
      />
    );

  } else if (
    user.role ===
    "TOUR_GUIDE"
  ) {

    page = (
      <TourGuidePage
        user={
          user
        }
        onLogout={
          handleLogout
        }
      />
    );

  } else if (
    user.role ===
    "SYSTEM_ADMIN"
  ) {

    page = (
      <SiteManagementPage
        user={
          user
        }
        onLogout={
          handleLogout
        }
      />
    );

  } else {

    /*
     * TypeScript has already checked
     * every valid AuthUser role above.
     *
     * Therefore user.role becomes "never"
     * here, so we must NOT call
     * split(), replaceAll(), etc.
     */
    page = (
      <main className="unsupported-role">

        <div>

          <h1>
            TourFlow
          </h1>

          <h2>
            Unsupported Role
          </h2>

          <p>
            This account does not have
            a supported dashboard.
          </p>

          <button
            type="button"
            className="button button-primary"
            onClick={() =>
              void handleLogout()
            }
          >
            Logout
          </button>

        </div>

      </main>
    );
  }


  return (
    <div className="tf-app-shell">

      <MotionBackdrop />

      <div
        className="tf-page-scene"
        key={
          user?.role ??
          "LOGIN"
        }
      >
        {page}
      </div>

    </div>
  );
}


export default App;