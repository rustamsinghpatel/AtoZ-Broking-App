import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createAdminPosition,
  getAdminClients,
  getAdminPositionAudit,
  getAdminPositions,
  updateAdminPosition,
} from "../../services/api";
import {
  FilterTabs,
  ModalShell,
  StatusPill,
  formatDateTime,
  formatMoney,
} from "./adminUi";

const newRequestId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const EMPTY = {
  userId: "",
  symbol: "",
  side: "BUY",
  product: "CNC",
  quantity: "",
  averagePrice: "",
  ltp: "",
  note: "",
};

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none";

function Field({ label, children, hint }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

// ---------- Create ----------
function CreateModal({ clients, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // One id per opened form: a double click or retry cannot create twice.
  const requestId = useRef(newRequestId());
  const busy = useRef(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await createAdminPosition({
        ...form,
        clientRequestId: requestId.current,
      });
      onSaved(result.message || "Position recorded.");
    } catch (err) {
      setError(err.message || "Could not record the position.");
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Record client position" onClose={saving ? () => {} : onClose} wide>
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        This is a manual record. It does not place a market order, fetch prices, or change the
        client&apos;s wallet. Prices are exactly what you enter, so use verified values.
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Field label="Client">
          <select className={inputCls} value={form.userId} onChange={set("userId")} required>
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName} ({c.clientId})
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Instrument symbol">
            <input
              className={inputCls}
              value={form.symbol}
              onChange={set("symbol")}
              placeholder="e.g. RELIANCE"
              maxLength={20}
            />
          </Field>
          <Field label="Side">
            <select className={inputCls} value={form.side} onChange={set("side")}>
              <option>BUY</option>
              <option>SELL</option>
            </select>
          </Field>
          <Field label="Product">
            <select className={inputCls} value={form.product} onChange={set("product")}>
              <option>CNC</option>
              <option>MIS</option>
              <option>NRML</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Quantity">
            <input
              className={inputCls}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.quantity}
              onChange={set("quantity")}
            />
          </Field>
          <Field label="Average price (₹)">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={form.averagePrice}
              onChange={set("averagePrice")}
            />
          </Field>
          <Field label="Last traded price (₹)">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={form.ltp}
              onChange={set("ltp")}
            />
          </Field>
        </div>

        <Field label="Reason / reference" hint="Required (5–300 characters). Saved in the audit history.">
          <textarea
            className={inputCls}
            rows={2}
            maxLength={300}
            value={form.note}
            onChange={set("note")}
          />
        </Field>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Record position"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ---------- Edit ----------
function EditModal({ position, onClose, onSaved }) {
  const [form, setForm] = useState({
    quantity: String(position.quantity),
    averagePrice: String(position.averagePrice),
    ltp: String(position.ltp),
    product: position.product,
    note: position.note || "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await updateAdminPosition(position.id, form);
      onSaved(result.message || "Position updated.");
    } catch (err) {
      setError(err.message || "Could not update the position.");
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={`Edit ${position.symbol} — ${position.clientName}`}
      onClose={saving ? () => {} : onClose}
      wide
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Quantity">
            <input className={inputCls} type="number" min="1" step="1" value={form.quantity} onChange={set("quantity")} />
          </Field>
          <Field label="Average price">
            <input className={inputCls} type="number" min="0" step="any" value={form.averagePrice} onChange={set("averagePrice")} />
          </Field>
          <Field label="Last price">
            <input className={inputCls} type="number" min="0" step="any" value={form.ltp} onChange={set("ltp")} />
          </Field>
          <Field label="Product">
            <select className={inputCls} value={form.product} onChange={set("product")}>
              <option>CNC</option>
              <option>MIS</option>
              <option>NRML</option>
            </select>
          </Field>
        </div>
        <Field label="Reason for this change" hint="Required. Saved with the old and new values.">
          <textarea className={inputCls} rows={2} maxLength={300} value={form.reason} onChange={set("reason")} />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ---------- Audit ----------
function AuditModal({ position, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminPositionAudit(position.id)
      .then((l) => active && setEvents(l))
      .catch((e) => active && setError(e.message || "Could not load history."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [position.id]);

  return (
    <ModalShell title={`History — ${position.symbol} (${position.clientId})`} onClose={onClose} wide>
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-slate-500">No admin changes recorded for this position.</p>
      )}
      <ol className="space-y-3">
        {events.map((ev) => (
          <li key={ev.id} className="rounded-xl border border-slate-200 p-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-medium capitalize text-slate-900">{ev.action}</span>
              <span className="text-xs text-slate-500">
                {formatDateTime(ev.createdAt)} · {ev.performedByName || "admin"}
              </span>
            </div>
            {ev.reason && <p className="mt-1 text-xs text-slate-600">Reason: {ev.reason}</p>}
            <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
              {ev.changes.map((c, i) => (
                <li key={i}>
                  {c.field}: {c.from === null ? "—" : String(c.from)} → <b>{String(c.to)}</b>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </ModalShell>
  );
}

// ---------- Main ----------
export default function PositionManager() {
  const [positions, setPositions] = useState([]);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null); // {type, position?}

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, c] = await Promise.all([getAdminPositions(), getAdminClients()]);
      setPositions(p);
      setClients(c.filter((x) => x.status === "active"));
    } catch (e) {
      setError(e.message || "Could not load positions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => positions.filter((p) => p.status === filter), [positions, filter]);
  const openCount = positions.filter((p) => p.status === "open").length;
  const closedCount = positions.length - openCount;

  const saved = (message) => {
    setModal(null);
    setNotice(message);
    load();
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Client Positions</h2>
          <p className="text-sm text-slate-500">
            Record and manage positions for clients. Every change is audited.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
          >
            + Record position
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total", positions.length],
          ["Open", openCount],
          ["Closed", closedCount],
        ].map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : n}</p>
          </div>
        ))}
      </div>

      <FilterTabs
        value={filter}
        onChange={setFilter}
        options={[
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ]}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}{" "}
          <button type="button" onClick={load} className="underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No {filter} positions yet.
          {filter === "open" && " Use “Record position” to add one for a client."}
        </div>
      )}

      {!error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Instrument</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Avg price</th>
                <th className="px-4 py-3 text-right">Last price</th>
                <th className="px-4 py-3 text-right">P&amp;L</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{p.clientName || "—"}</p>
                    <p className="text-xs text-slate-500">{p.clientId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{p.symbol}</p>
                    <p className="text-xs text-slate-500">
                      {p.side} · {p.product}
                      {p.source === "admin_manual" && " · manual entry"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">{p.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(p.averagePrice)}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(p.ltp)}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      p.pnl >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {formatMoney(p.pnl)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs font-medium">
                      {p.status === "open" && (
                        <button type="button" className="text-cyan-700 underline" onClick={() => setModal({ type: "edit", position: p })}>
                          Edit
                        </button>
                      )}
                      <button type="button" className="text-slate-700 underline" onClick={() => setModal({ type: "audit", position: p })}>
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

      {modal?.type === "create" && (
        <CreateModal clients={clients} onClose={() => setModal(null)} onSaved={saved} />
      )}
      {modal?.type === "edit" && (
        <EditModal position={modal.position} onClose={() => setModal(null)} onSaved={saved} />
      )}
      {modal?.type === "audit" && (
        <AuditModal position={modal.position} onClose={() => setModal(null)} />
      )}
    </section>
  );
}
