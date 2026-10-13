
import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";

const menuItems = ["Overview", "Clients", "Deposits"];

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-red-50 text-red-700 border-red-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const currentStatus = styles[status] ? status : "pending";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${styles[currentStatus]}`}
    >
      {currentStatus}
    </span>
  );
}

function StatCard({ label, value, description, icon }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="text-2xl" aria-hidden="true">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </article>
  );
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "—";

  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState("Overview");

  const [clients, setClients] = useState([]);
  const [pendingDeposits, setPendingDeposits] = useState([]);

  const [clientsLoading, setClientsLoading] = useState(false);
  const [depositsLoading, setDepositsLoading] = useState(false);

  const [clientsError, setClientsError] = useState("");
  const [depositsError, setDepositsError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [updatingClient, setUpdatingClient] = useState("");
  const [updatingDeposit, setUpdatingDeposit] = useState("");

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Load registered clients from the backend.
  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    setClientsError("");

    try {
      const result = await apiRequest("/api/admin/clients", {
        method: "GET",
        cache: "no-store",
      });

      setClients(result.data?.clients || []);
    } catch (err) {
      setClientsError(
        err.message || "Clients load nahi ho paaye."
      );
    } finally {
      setClientsLoading(false);
    }
  }, []);

  // Load pending deposit requests from the backend.
  const fetchPendingDeposits = useCallback(async () => {
    setDepositsLoading(true);
    setDepositsError("");

    try {
      const result = await apiRequest("/api/admin/deposits/pending", {
        method: "GET",
        cache: "no-store",
      });

      setPendingDeposits(result.data?.deposits || []);
    } catch (err) {
      setDepositsError(
        err.message || "Deposit requests load nahi ho paayi."
      );
    } finally {
      setDepositsLoading(false);
    }
  }, []);

  // Load only the data needed for the selected page.
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return;

    if (activeMenu === "Overview" || activeMenu === "Clients") {
      fetchClients();
    }

    if (activeMenu === "Overview" || activeMenu === "Deposits") {
      fetchPendingDeposits();
    }
  }, [
    activeMenu,
    isAuthenticated,
    user?.role,
    fetchClients,
    fetchPendingDeposits,
  ]);

  // Update client account status.
  const handleStatusChange = async (client, nextStatus) => {
    setActionError("");
    setSuccessMessage("");

    let reason = "";

    if (nextStatus === "inactive") {
      const enteredReason = window.prompt(
        `Deactivate ${client.fullName} (${client.clientId}).\nReason dena zaroori hai:`
      );

      if (enteredReason === null) return;

      reason = enteredReason.trim();

      if (!reason) {
        setActionError(
          "Client deactivate karne ke liye reason zaroori hai."
        );
        return;
      }
    }

    const confirmed = window.confirm(
      `Kya aap ${client.clientId} ka status ${nextStatus} karna chahte hain?`
    );

    if (!confirmed) return;

    setUpdatingClient(client._id);

    try {
      await apiRequest(`/api/admin/clients/${client._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
          reason,
        }),
      });

      setSuccessMessage(
        `${client.clientId} ka status ${nextStatus} ho gaya.`
      );

      await fetchClients();
    } catch (err) {
      setActionError(
        err.message || "Client status update nahi ho saka."
      );
    } finally {
      setUpdatingClient("");
    }
  };

  // Approve or reject a pending deposit request.
  const handleDepositReview = async (deposit, nextStatus) => {
    setActionError("");
    setSuccessMessage("");

    let adminNote = "";

    const clientName =
      deposit.user?.fullName || deposit.user?.clientId || "this client";

    if (nextStatus === "rejected") {
      const enteredReason = window.prompt(
        `Deposit reject karne ka reason likhein.\nClient: ${clientName}`
      );

      if (enteredReason === null) return;

      adminNote = enteredReason.trim();

      if (!adminNote) {
        setActionError(
          "Deposit reject karne ke liye reason zaroori hai."
        );
        return;
      }
    }

    const confirmed = window.confirm(
      nextStatus === "approved"
        ? `Kya aap ${formatAmount(deposit.amount)} ka deposit approve karna chahte hain? Approval par wallet credit hoga.`
        : `Kya aap ${formatAmount(deposit.amount)} ka deposit reject karna chahte hain?`
    );

    if (!confirmed) return;

    setUpdatingDeposit(deposit._id);

    try {
      const result = await apiRequest(
        `/api/admin/deposits/${deposit._id}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: nextStatus,
            adminNote,
          }),
        }
      );

      setSuccessMessage(
        result.message ||
          (nextStatus === "approved"
            ? "Deposit approve ho gaya."
            : "Deposit reject ho gaya.")
      );

      // Refresh the pending list from the backend.
      await fetchPendingDeposits();
    } catch (err) {
      setActionError(
        err.message || "Deposit review complete nahi ho saka."
      );
    } finally {
      setUpdatingDeposit("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const activeCount = clients.filter(
    (client) => client.status === "active"
  ).length;

  const pendingClientCount = clients.filter(
    (client) => !client.status || client.status === "pending"
  ).length;

  const inactiveCount = clients.filter(
    (client) => client.status === "inactive"
  ).length;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl" aria-hidden="true">🔒</div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Admin Access Required
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Is account ke paas admin permission nahi hai.
            Authorized admin account se login karein.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-700"
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
      <aside className="w-full shrink-0 border-b border-slate-200 bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ATOZ <span className="text-cyan-600">Broking</span>
        </h1>

        <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">
          Admin Portal
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Signed in as
          </p>
          <p className="mt-2 truncate font-semibold text-slate-900">
            {user?.fullName || user?.name || "Administrator"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Administrator
          </p>
        </div>

        <nav
          aria-label="Admin navigation"
          className="mt-6 flex gap-2 overflow-x-auto md:flex-col"
        >
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveMenu(item);
                setActionError("");
                setSuccessMessage("");
              }}
              className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm transition ${
                activeMenu === item
                  ? "bg-cyan-600 font-semibold text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item === "Overview" && "▦  "}
              {item === "Clients" && "👥  "}
              {item === "Deposits" && "₹  "}
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Admin Workspace
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Manage client access and review deposit requests.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700"
        >
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm text-slate-500">
              ATOZ Broking / Administration
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              {activeMenu}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage your client accounts and deposit approvals.
            </p>
          </div>

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            ● Admin access
          </span>
        </header>

        {/* Shared feedback messages */}
        {successMessage && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {successMessage}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        {/* Overview */}
        {activeMenu === "Overview" && (
          <>
            <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Clients"
                value={clientsLoading ? "…" : clients.length}
                description="Registered client accounts"
                icon="👥"
              />
              <StatCard
                label="Active Accounts"
                value={clientsLoading ? "…" : activeCount}
                description="Clients with active access"
                icon="🟢"
              />
              <StatCard
                label="Pending Clients"
                value={clientsLoading ? "…" : pendingClientCount}
                description="Waiting for account approval"
                icon="⏳"
              />
              <StatCard
                label="Pending Deposits"
                value={depositsLoading ? "…" : pendingDeposits.length}
                description="Requests waiting for review"
                icon="₹"
              />
            </section>

            {(clientsError || depositsError) && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800">
                  Kuch dashboard data load nahi hua.
                </p>
                {clientsError && (
                  <p className="mt-2 text-sm text-red-700">
                    Clients: {clientsError}
                  </p>
                )}
                {depositsError && (
                  <p className="mt-2 text-sm text-red-700">
                    Deposits: {depositsError}
                  </p>
                )}
              </div>
            )}

            <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Client Accounts
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Review registrations and access status.
                    </p>
                  </div>
                  <span className="text-2xl" aria-hidden="true">👥</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveMenu("Clients")}
                    className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
                  >
                    Manage Clients
                  </button>
                  <button
                    onClick={fetchClients}
                    disabled={clientsLoading}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {clientsLoading ? "Refreshing…" : "Refresh Clients"}
                  </button>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Deposit Requests
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Review requests waiting for admin approval.
                    </p>
                  </div>
                  <span className="text-2xl" aria-hidden="true">₹</span>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-900">
                  {depositsLoading ? "…" : pendingDeposits.length}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Pending requests
                </p>

                <button
                  onClick={() => setActiveMenu("Deposits")}
                  className="mt-4 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
                >
                  Review Deposits
                </button>
              </article>
            </section>

            <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent Pending Deposits
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Requests that still need your attention.
                  </p>
                </div>
                <button
                  onClick={fetchPendingDeposits}
                  disabled={depositsLoading}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  {depositsLoading ? "Loading…" : "Refresh"}
                </button>
              </div>

              {depositsError && (
                <p className="mt-4 text-sm text-red-600">{depositsError}</p>
              )}

              {depositsLoading ? (
                <p className="mt-5 text-sm text-slate-500">
                  Deposit requests load ho rahi hain…
                </p>
              ) : !depositsError && pendingDeposits.length === 0 ? (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Abhi koi pending deposit request nahi hai.
                </p>
              ) : (
                !depositsError && (
                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Client</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingDeposits.slice(0, 5).map((deposit) => (
                          <tr key={deposit._id}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-800">
                                {deposit.user?.fullName || "Unknown client"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {deposit.user?.clientId || "—"}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-semibold">
                              {formatAmount(deposit.amount)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                              {formatDate(deposit.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={deposit.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pendingDeposits.length > 5 && (
                      <button
                        onClick={() => setActiveMenu("Deposits")}
                        className="mt-4 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                      >
                        View all {pendingDeposits.length} requests →
                      </button>
                    )}
                  </div>
                )
              )}
            </section>
          </>
        )}

        {/* Clients */}
        {activeMenu === "Clients" && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Registered Clients
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Manage client approvals and account access.
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Pending: {pendingClientCount} · Active: {activeCount} · Inactive: {inactiveCount}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
                  Total: {clients.length}
                </span>
                <button
                  onClick={fetchClients}
                  disabled={clientsLoading}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  {clientsLoading ? "Loading…" : "Refresh"}
                </button>
              </div>
            </div>

            {clientsLoading && (
              <p className="p-6 text-sm text-slate-500">
                Clients load ho rahe hain…
              </p>
            )}

            {!clientsLoading && clientsError && (
              <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800">
                  Clients load nahi hue.
                </p>
                <p className="mt-2 text-sm text-red-700">{clientsError}</p>
                <button
                  onClick={fetchClients}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!clientsLoading && !clientsError && clients.length === 0 && (
              <p className="p-6 text-sm text-slate-500">
                Database mein abhi koi client record nahi mila.
              </p>
            )}

            {!clientsLoading && !clientsError && clients.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Client</th>
                      <th className="px-5 py-4">Contact</th>
                      <th className="px-5 py-4">Registered</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.map((client) => {
                      const status = client.status || "pending";
                      const isUpdating = updatingClient === client._id;

                      return (
                        <tr
                          key={client._id || client.clientId}
                          className="hover:bg-slate-50"
                        >
                          <td className="min-w-44 px-5 py-4">
                            <p className="font-semibold text-cyan-700">
                              {client.clientId || "—"}
                            </p>
                            <p className="mt-1 font-medium text-slate-800">
                              {client.fullName || "—"}
                            </p>
                          </td>
                          <td className="min-w-52 px-5 py-4">
                            <p className="text-slate-700">
                              {client.email || "—"}
                            </p>
                            <p className="mt-1 text-slate-500">
                              {client.mobile || "—"}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {formatDate(client.createdAt)}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={status} />
                            {status === "inactive" && client.statusReason && (
                              <p className="mt-2 max-w-48 text-xs text-red-600">
                                Reason: {client.statusReason}
                              </p>
                            )}
                          </td>
                          <td className="min-w-48 px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              {status !== "active" && (
                                <button
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleStatusChange(client, "active")
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {isUpdating
                                    ? "Updating…"
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
                                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                  {isUpdating ? "Updating…" : "Deactivate"}
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

        {/* Deposits */}
        {activeMenu === "Deposits" && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Deposit Requests
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Verify requests and approve or reject them.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Pending requests: {pendingDeposits.length}
                </p>
              </div>

              <button
                onClick={fetchPendingDeposits}
                disabled={depositsLoading}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {depositsLoading ? "Refreshing…" : "Refresh Requests"}
              </button>
            </div>

            <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm leading-6 text-amber-800">
              Approve karne se pehle payment ko apne authorized payment/bank records se verify karein. Sirf request submit hone se payment confirm nahi hoti.
            </div>

            {depositsLoading && (
              <p className="p-6 text-sm text-slate-500">
                Deposit requests load ho rahi hain…
              </p>
            )}

            {!depositsLoading && depositsError && (
              <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800">
                  Deposit requests load nahi hui.
                </p>
                <p className="mt-2 text-sm text-red-700">{depositsError}</p>
                <button
                  onClick={fetchPendingDeposits}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!depositsLoading &&
              !depositsError &&
              pendingDeposits.length === 0 && (
                <div className="p-10 text-center">
                  <div className="text-4xl" aria-hidden="true">✓</div>
                  <h4 className="mt-3 font-semibold text-slate-800">
                    No pending deposits
                  </h4>
                  <p className="mt-2 text-sm text-slate-500">
                    Jab client deposit request submit karega, woh yahan dikhegi.
                  </p>
                </div>
              )}

            {!depositsLoading &&
              !depositsError &&
              pendingDeposits.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Client</th>
                        <th className="px-5 py-4">Amount</th>
                        <th className="px-5 py-4">Payment Details</th>
                        <th className="px-5 py-4">Requested On</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingDeposits.map((deposit) => {
                        const isUpdating =
                          updatingDeposit === deposit._id;

                        return (
                          <tr
                            key={deposit._id}
                            className="align-top hover:bg-slate-50"
                          >
                            <td className="min-w-44 px-5 py-4">
                              <p className="font-semibold text-slate-800">
                                {deposit.user?.fullName || "Unknown client"}
                              </p>
                              <p className="mt-1 text-xs text-cyan-700">
                                {deposit.user?.clientId || "—"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {deposit.user?.email || ""}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {deposit.user?.mobile || ""}
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <p className="text-base font-bold text-slate-900">
                                {formatAmount(deposit.amount)}
                              </p>
                            </td>

                            <td className="min-w-44 px-5 py-4">
                              <p className="font-medium text-slate-800">
                                {deposit.method || "—"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Reference:
                              </p>
                              <p className="mt-1 break-all text-xs text-slate-700">
                                {deposit.referenceNumber || "Not provided"}
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                              {formatDate(deposit.createdAt)}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge status={deposit.status} />
                            </td>

                            <td className="min-w-48 px-5 py-4">
                              <div className="flex flex-col gap-2">
                                <button
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleDepositReview(deposit, "approved")
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating ? "Processing…" : "✓ Approve"}
                                </button>
                                <button
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleDepositReview(deposit, "rejected")
                                  }
                                  className="rounded-lg border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Reject
                                </button>
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
      </main>
    </div>
  );
}
