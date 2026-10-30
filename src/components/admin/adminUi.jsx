import { useEffect, useState } from "react";

import { getKycHistory } from "../../services/api";

// Small shared pieces for the admin panel (light theme, same palette as Admin.jsx).

export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const PILL = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  open: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  closed: "border-slate-200 bg-slate-100 text-slate-600",
};

export function StatusPill({ status }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
        PILL[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {String(status || "unknown").replace("_", " ")}
    </span>
  );
}

export function ModalShell({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-xl ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const ACTION_LABEL = {
  submitted: "Submitted by client",
  approved: "Approved",
  rejected: "Rejected",
  document_viewed: "Document viewed",
};

const DOC_LABEL = { pan: "PAN", aadhaar: "Aadhaar", bank: "Bank proof" };

// KYC audit trail for one client (identity + bank), newest first.
export function KycHistoryModal({ userId, title, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getKycHistory(userId)
      .then((list) => active && setEvents(list))
      .catch((e) => active && setError(e.message || "Could not load history."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <ModalShell title={`KYC history — ${title}`} onClose={onClose} wide>
      {loading && <p className="text-sm text-slate-500">Loading history…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-slate-500">
          No history recorded yet. Activity from before this feature was added is not available.
        </p>
      )}
      <ol className="space-y-3">
        {events.map((e) => (
          <li key={e.id} className="rounded-xl border border-slate-200 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-slate-900">
                {ACTION_LABEL[e.action] || e.action}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {e.scope === "bank" ? "Bank KYC" : "PAN / Aadhaar"}
                  {e.docType ? ` · ${DOC_LABEL[e.docType] || e.docType}` : ""}
                </span>
              </span>
              <span className="text-xs text-slate-500">{formatDateTime(e.createdAt)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              By {e.performedByName || "system"}
              {e.performedById ? ` (${e.performedById})` : ""} · {e.performedByRole}
              {e.previousStatus || e.newStatus
                ? ` · ${e.previousStatus || "—"} → ${e.newStatus || "—"}`
                : ""}
            </p>
            {e.reason && <p className="mt-1 text-xs text-red-700">Reason: {e.reason}</p>}
          </li>
        ))}
      </ol>
    </ModalShell>
  );
}

export function FilterTabs({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            value === o.value
              ? "border-cyan-600 bg-cyan-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
