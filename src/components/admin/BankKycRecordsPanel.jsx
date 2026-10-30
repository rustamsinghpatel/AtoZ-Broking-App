import { useCallback, useEffect, useState } from "react";

import { getBankKycRecords } from "../../services/api";
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

// Every bank KYC whatever its status, with document re-open and history.
export default function BankKycRecordsPanel({ onViewDocument }) {
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await getBankKycRecords(status));
    } catch (e) {
      setError(e.message || "Could not load bank KYC records.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Bank KYC records &amp; history
      </h3>
      <p className="text-sm text-slate-500">
        Reopen bank proof documents at any time, including after review.
      </p>

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
        <p className="mt-4 text-sm text-slate-500">No bank KYC records found.</p>
      )}

      {!error && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Bank details</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Submitted / Reviewed</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r._id} className="align-top">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-slate-900">{r.user?.fullName || "—"}</p>
                    <p className="text-xs text-slate-500">{r.user?.clientId}</p>
                  </td>
                  <td className="py-3 pr-3 text-xs text-slate-600">
                    <p>{r.bankName || "—"}</p>
                    <p>
                      {r.accountNumberMasked || r.accountMasked || ""}{" "}
                      {r.ifsc ? `· ${r.ifsc}` : ""}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <StatusPill status={r.status} />
                    {r.status === "rejected" && r.rejectionReason && (
                      <p className="mt-1 max-w-[200px] text-xs text-red-700">
                        {r.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-xs text-slate-600">
                    {formatDateTime(r.submittedAt)}
                    {r.reviewedAt && (
                      <>
                        <br />
                        {formatDateTime(r.reviewedAt)} by {r.reviewedByName || "admin"}
                      </>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => onViewDocument(r)}
                        className="text-xs font-medium text-cyan-700 underline"
                      >
                        View proof
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistory(r)}
                        className="text-xs font-medium text-slate-700 underline"
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {history && (
        <KycHistoryModal
          userId={history.user?._id}
          title={`${history.user?.fullName || ""} (${history.user?.clientId || ""})`}
          onClose={() => setHistory(null)}
        />
      )}
    </section>
  );
}
