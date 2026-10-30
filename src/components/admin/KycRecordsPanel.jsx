import { useCallback, useEffect, useState } from "react";

import { getKycRecords } from "../../services/api";
import {
  FilterTabs,
  KycHistoryModal,
  StatusPill,
  formatDateTime,
} from "./adminUi";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "pending", label: "Pending" },
];

const kb = (n) => (n ? `${Math.max(1, Math.round(n / 1024))} KB` : "");

// Every PAN / Aadhaar KYC whatever its status. "View" only opens the
// document; approve / reject stays in the pending list above.
export default function KycRecordsPanel({ onViewDocument }) {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await getKycRecords(status, search));
    } catch (e) {
      setError(e.message || "Could not load KYC records.");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  // Debounce typing in the search box.
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            KYC records &amp; history
          </h3>
          <p className="text-sm text-slate-500">
            Reopen submitted documents at any time, including after approval or rejection.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, client ID, email"
          aria-label="Search KYC records"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-64"
        />
      </div>

      <div className="mt-4">
        <FilterTabs value={status} onChange={setStatus} options={FILTERS} />
      </div>

      {loading && <p className="mt-4 text-sm text-slate-500">Loading…</p>}
      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}{" "}
          <button type="button" onClick={load} className="underline">
            Retry
          </button>
        </p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No KYC records found.</p>
      )}

      {!error && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Submitted</th>
                <th className="py-2 pr-3">Reviewed</th>
                <th className="py-2 pr-3">Documents</th>
                <th className="py-2">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c._id} className="align-top">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-slate-900">{c.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {c.clientId} · PAN {c.kycPanMasked || "—"} · Aadhaar{" "}
                      {c.kycAadhaarLast4 ? `•••• ${c.kycAadhaarLast4}` : "—"}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <StatusPill status={c.kycStatus} />
                    {c.kycStatus === "rejected" && c.kycRejectionReason && (
                      <p className="mt-1 max-w-[200px] text-xs text-red-700">
                        {c.kycRejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-xs text-slate-600">
                    {formatDateTime(c.kycSubmittedAt)}
                  </td>
                  <td className="py-3 pr-3 text-xs text-slate-600">
                    {c.kycReviewedAt ? (
                      <>
                        {formatDateTime(c.kycReviewedAt)}
                        <br />
                        by {c.kycReviewedBy?.fullName || "admin"}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-2">
                      {["pan", "aadhaar"].map((type) => {
                        const d = c.documents?.[type];
                        return (
                          <button
                            key={type}
                            type="button"
                            disabled={!d?.uploaded}
                            onClick={() => onViewDocument(c, type)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:text-slate-400"
                          >
                            View {type === "pan" ? "PAN" : "Aadhaar"}
                            {d?.uploaded && d.size ? ` (${kb(d.size)})` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => setHistory(c)}
                      className="text-xs font-medium text-slate-700 underline"
                    >
                      View history
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {history && (
        <KycHistoryModal
          userId={history._id}
          title={`${history.fullName} (${history.clientId})`}
          onClose={() => setHistory(null)}
        />
      )}
    </section>
  );
}
