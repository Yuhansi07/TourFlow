import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createAdminUser,
  getAdminUsers,
} from "../services/adminUserService";

import type {
  AdminUser,
} from "../types/AdminUser";

import type {
  UserRole,
} from "../types/Auth";


interface Props {
  onUsersChanged?: () => void;
}


const STAFF_ROLES:
Array<{
  value: UserRole;
  label: string;
}> = [

  {
    value:
      "SITE_MANAGER",

    label:
      "Site Manager",
  },

  {
    value:
      "ENTRANCE_OFFICER",

    label:
      "Entrance Officer",
  },

  {
    value:
      "SAFETY_OFFICER",

    label:
      "Safety Officer",
  },

  {
    value:
      "MAINTENANCE_OFFICER",

    label:
      "Maintenance Officer",
  },

  {
    value:
      "TOUR_GUIDE",

    label:
      "Tour Guide",
  },

  {
    value:
      "SYSTEM_ADMIN",

    label:
      "System Administrator",
  },
];


function roleLabel(
  role: UserRole
): string {

  return role
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );
}


function formatCreatedAt(
  value: string
): string {

  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;
  }


  return date.toLocaleString();
}


export default function UserManagementPanel({
  onUsersChanged,
}: Props) {

  const [users, setUsers] =
    useState<AdminUser[]>([]);


  const [fullName, setFullName] =
    useState("");


  const [email, setEmail] =
    useState("");


  const [password, setPassword] =
    useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");


  const [role, setRole] =
    useState<UserRole>(
      "SITE_MANAGER"
    );


  const [loading, setLoading] =
    useState(true);


  const [saving, setSaving] =
    useState(false);


  const [error, setError] =
    useState("");


  const [message, setMessage] =
    useState("");


  async function loadUsers() {

    try {

      setLoading(true);
      setError("");


      const result =
        await getAdminUsers();


      setUsers(
        result
      );

    } catch (exception) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to load users"
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {

    void loadUsers();

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


    return () => {

      window.clearTimeout(
        timer
      );
    };

  }, [message]);


  function resetForm() {

    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setRole(
      "SITE_MANAGER"
    );
  }


  async function submit(
    event: FormEvent
  ) {

    event.preventDefault();


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


    try {

      setSaving(true);
      setError("");
      setMessage("");


      const created =
        await createAdminUser({
          fullName:
            fullName.trim(),

          email:
            email.trim(),

          password,

          role,
        });


      setMessage(
        `${created.fullName} account created successfully.`
      );


      resetForm();


      await loadUsers();


      if (
        onUsersChanged
      ) {

        onUsersChanged();
      }

    } catch (exception) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to create account"
      );

    } finally {

      setSaving(false);
    }
  }


  return (

    <section className="panel user-management-panel">


      <div className="panel-heading">

        <div>

          <h3>
            User Management
          </h3>

          <p>
            Create staff and administrator
            accounts and review existing
            TourFlow users.
          </p>

        </div>


        <button
          type="button"
          className="button button-secondary"
          onClick={() =>
            void loadUsers()
          }
          disabled={loading}
        >
          Refresh Users
        </button>

      </div>


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


      {/* CREATE STAFF ACCOUNT */}

      <div className="admin-user-create-box">

        <div className="admin-user-section-heading">

          <h4>
            Add Staff Account
          </h4>

          <p>
            Staff members can use the
            common TourFlow Sign In page
            after their account is created.
          </p>

        </div>


        <form
          className="two-column-form"
          onSubmit={submit}
        >


          <div className="field">

            <label htmlFor="admin-user-name">
              Full Name
            </label>

            <input
              id="admin-user-name"
              type="text"
              value={fullName}
              maxLength={120}
              placeholder="Enter full name"

              onChange={
                event =>
                  setFullName(
                    event.target.value
                  )
              }

              required
            />

          </div>


          <div className="field">

            <label htmlFor="admin-user-email">
              Email
            </label>

            <input
              id="admin-user-email"
              type="email"
              value={email}
              maxLength={190}
              placeholder="Enter email address"

              onChange={
                event =>
                  setEmail(
                    event.target.value
                  )
              }

              required
            />

          </div>


          <div className="field">

            <label htmlFor="admin-user-role">
              Role
            </label>

            <select
              id="admin-user-role"
              value={role}

              onChange={
                event =>
                  setRole(
                    event.target
                      .value as UserRole
                  )
              }
            >

              {STAFF_ROLES.map(
                option => (

                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>

                )
              )}

            </select>

          </div>


          <div className="field">

            <label htmlFor="admin-user-password">
              Password
            </label>

            <input
              id="admin-user-password"
              type="password"
              value={password}
              minLength={8}
              maxLength={72}
              placeholder="Minimum 8 characters"

              onChange={
                event =>
                  setPassword(
                    event.target.value
                  )
              }

              required
            />

          </div>


          <div className="field">

            <label htmlFor="admin-user-confirm-password">
              Confirm Password
            </label>

            <input
              id="admin-user-confirm-password"
              type="password"
              value={confirmPassword}
              minLength={8}
              maxLength={72}
              placeholder="Enter password again"

              onChange={
                event =>
                  setConfirmPassword(
                    event.target.value
                  )
              }

              required
            />

          </div>


          <div className="form-actions full-field">

            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >

              {saving
                ? "Creating Account..."
                : "Create Account"}

            </button>


            <button
              type="button"
              className="button button-secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Clear
            </button>

          </div>

        </form>

      </div>


      {/* EXISTING USERS */}

      <div className="admin-user-list-section">

        <div className="admin-user-section-heading">

          <h4>
            Existing Users
          </h4>

          <p>
            Tourist and staff accounts
            currently registered in TourFlow.
          </p>

        </div>


        {loading ? (

          <div className="empty-box">
            Loading users...
          </div>

        ) : users.length === 0 ? (

          <div className="empty-box">
            No users found.
          </div>

        ) : (

          <div className="admin-user-table-wrapper">

            <table className="admin-user-table">

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                </tr>

              </thead>


              <tbody>

                {users.map(
                  account => (

                    <tr
                      key={account.id}
                    >

                      <td>

                        <strong>
                          {account.fullName}
                        </strong>

                      </td>


                      <td>
                        {account.email}
                      </td>


                      <td>

                        <span className="admin-user-role">

                          {roleLabel(
                            account.role
                          )}

                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            account.active
                              ? "admin-user-status active"
                              : "admin-user-status inactive"
                          }
                        >

                          {account.active
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>


                      <td>

                        {formatCreatedAt(
                          account.createdAt
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </section>
  );
}