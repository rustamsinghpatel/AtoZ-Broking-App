
import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000";

const menuItems = [
  "Overview",
  "Clients",
  "Transactions",
  "Deposits",
  "Withdrawals",
  "Reports",
];

function getSavedToken() {
  const savedSession =
    localStorage.getItem("a2z_session") ||
    sessionStorage.getItem("a2z_session");

  if (!savedSession) {
    throw new Error("Login session nahi mila. Dobara login karein.");
  }

  const session = JSON.parse(savedSession);

  if (!session?.token) {
    throw new Error("Authentication token nahi mila. Dobara login karein.");
  }

  return session.token;
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-red-50 text-red-700 border-red-200",
  };

  const currentStatus = ["pending", "active", "inactive"].includes(status)
    ? status
    : "pending";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        styles[currentStatus]
      }`}
    >
      {currentStatus}
    </span>
  );
}

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingClient, setUpdatingClient] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch clients for Overview and Clients sections.
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getSavedToken();

      const response = await fetch(`${API_BASE}/api/admin/clients`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Clients load nahi ho sake.");
      }

      setClients(result.data?.clients || []);
    } catch (err) {
      setError(err.message || "Backend se connect nahi ho pa raha hai.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.role === "admin" &&
      (activeMenu === "Overview" || activeMenu === "Clients")
    ) {
      fetchClients();
    }
  }, [activeMenu, isAuthenticated, user?.role, fetchClients]);

  // Change a client's status through the protected admin API.
  const handleStatusChange = async (client, nextStatus) => {
    setActionError("");
    setSuccessMessage("");

    let reason = "";

    if (nextStatus === "inactive") {
      reason = window.prompt(
        `Deactivate ${client.fullName} (${client.clientId}).\nReason dena compulsory hai:`
      );

      if (reason === null) {
        return;
      }

      reason = reason.trim();

      if (!reason) {
        setActionError("Deactivate karne ke liye reason dena zaroori hai.");
        return;
      }

      const confirmed = window.confirm(
        `Kya aap ${client.clientId} ko deactivate karna chahte hain?`
      );

      if (!confirmed) {
        return;
      }
    }

    if (
      nextStatus === "active" &&
      !window.confirm(
        `Kya aap ${client.clientId} ko Active karna chahte hain?`
      )
    ) {
      return;
    }

    if (
      nextStatus === "pending" &&
      !window.confirm(
        `Kya aap ${client.clientId} ka status Pending karna chahte hain?`
      )
    ) {
      return;
    }

    setUpdatingClient(client._id);

    try {
      const token = getSavedToken();

      const response = await fetch(
        `${API_BASE}/api/admin/clients/${client._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
            reason,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Client status update nahi hua.");
      }

      setSuccessMessage(
        `${client.clientId} ka status ${nextStatus} ho gaya.`
      );

      // Reload data from the backend to show the saved status.
      await fetchClients();
    } catch (err) {
      setActionError(err.message || "Status update nahi ho saka.");
    } finally {
      setUpdatingClient("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const activeCount = clients.filter(
    (client) => client.status === "active"
  ).length;

  const pendingCount = clients.filter(
    (client) => !client.status || client.status === "pending"
  ).length;

  const stats = [
    {
      label: "Total Clients",
      value: clients.length,
      icon: "👥",
      description: "Registered client records",
    },
    {
      label: "Active Accounts",
      value: activeCount,
      icon: "🟢",
      description: "Approved client accounts",
    },
    {
      label: "Pending Deposits",
      value: "—",
      icon: "💰",
      description: "Backend integration pending",
    },
    {
      label: "Pending Withdrawals",
      value: "—",
      icon: "↗️",
      description: "Backend integration pending",
    },
  ];

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-800">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-4 text-2xl font-bold">
            Admin Access Required
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Is account ke paas admin permission nahi hai.
            Kripya authorized admin account se login karein.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {/* Sidebar */}
      <aside className="w-full border-b border-slate-200 bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <h1 className="text-2xl font-bold tracking-wide text-slate-900">
          ATOZ <span className="text-cyan-600">Broking</span>
        </h1>

        <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">
          Administration
        </p>

        <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-cyan-700">
            SIGNED IN AS
          </p>
          <p className="mt-2 truncate font-semibold">
            {user?.fullName || user?.name || "Administrator"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Administrator</p>
        </div>

        <nav className="mt-7 flex gap-2 overflow-x-auto md:flex-col">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm transition ${
                activeMenu === item
                  ? "bg-cyan-500 font-semibold text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-7 rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold">Admin Workspace</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Manage client accounts and review activity.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-5 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm text-slate-500">
              ATOZ Broking / Admin
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              {activeMenu}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Administration portal
            </p>
          </div>

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            ● Admin Workspace
          </span>
        </header>

        {/* Overview */}
        {activeMenu === "Overview" && (
          <>
            <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                  <p className="mt-5 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick Actions
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Select a section to review its information.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {menuItems.slice(1, 5).map((item) => (
                    <button
                      key={item}
                      onClick={() => setActiveMenu(item)}
                      className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-50"
                    >
                      <span className="font-medium text-slate-800">
                        {item}
                      </span>
                      <p className="mt-1 text-sm text-slate-500">
                        Open {item.toLowerCase()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  System Status
                </h3>
                <div className="mt-5 flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      error ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">Client API</p>
                    <p className="text-xs text-slate-500">
                      {loading
                        ? "Loading client data..."
                        : error
                          ? "Connection needs attention"
                          : "Request completed"}
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">
                    {error}
                  </p>
                )}

                <button
                  onClick={() => setActiveMenu("Clients")}
                  className="mt-5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
                >
                  View Clients
                </button>
              </div>
            </section>
          </>
        )}

        {/* Clients */}
        {activeMenu === "Clients" && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Registered Clients
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Manage client approval and account access.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Pending: {pendingCount} · Active: {activeCount} · Inactive:{" "}
                  {clients.filter((client) => client.status === "inactive").length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700">
                  Total: {clients.length}
                </span>
                <button
                  onClick={fetchClients}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="mx-6 mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            {actionError && (
              <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            {loading && (
              <p className="p-6 text-sm text-slate-500">
                Clients load ho rahe hain, please wait...
              </p>
            )}

            {!loading && error && (
              <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                  Clients load nahi hue
                </p>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchClients}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && clients.length === 0 && (
              <p className="p-6 text-sm text-slate-500">
                Abhi database mein koi client record nahi mila.
              </p>
            )}

            {!loading && !error && clients.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Client ID</th>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Mobile</th>
                      <th className="px-6 py-4">Registered On</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {clients.map((client) => {
                      const status = client.status || "pending";
                      const isUpdating = updatingClient === client._id;

                      return (
                        <tr
                          key={client._id || client.clientId}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-cyan-700">
                            {client.clientId || "—"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">
                            {client.fullName || "—"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {client.email || "—"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {client.mobile || "—"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {client.createdAt
                              ? new Date(client.createdAt).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <StatusBadge status={status} />
                            {status === "inactive" && client.statusReason && (
                              <p
                                className="mt-2 max-w-48 whitespace-normal text-xs text-red-600"
                                title={client.statusReason}
                              >
                                Reason: {client.statusReason}
                              </p>
                            )}
                          </td>
                          <td className="min-w-48 px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {status !== "active" && (
                                <button
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleStatusChange(client, "active")
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : status === "inactive"
                                      ? "Activate"
                                      : "Approve"}
                                </button>
                              )}

                              {status !== "inactive" && (
                                <button
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleStatusChange(client, "inactive")
                                  }
                                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating ? "Updating..." : "Deactivate"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Other sections are not connected yet */}
        {!["Overview", "Clients"].includes(activeMenu) && (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              {activeMenu}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This section is not connected to a backend API yet.
              We will connect it after completing the Clients section.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}