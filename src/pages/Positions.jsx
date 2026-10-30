import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, History, RefreshCw, Search, TrendingUp, Wallet } from "lucide-react";

import { getPositions } from "../services/api";

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value) || 0);

const pnlClass = (value) =>
  Number(value) >= 0 ? "text-green-600" : "text-red-600";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function ManualBadge({ source }) {
  if (source !== "admin_manual") return null;
  return (
    <span
      title="Recorded by AtoZ Broking. This is a record entry, not a live market execution."
      className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200"
    >
      Recorded by AtoZ
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, valueClass = "text-gray-900" }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Icon size={18} />
        {label}
      </div>
      <p className={`mt-3 text-xl font-semibold sm:text-2xl ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function Positions() {
  const [activeTab, setActiveTab] = useState("open");
  const [search, setSearch] = useState("");

  const [openPositions, setOpenPositions] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPositions();
      setOpenPositions(data.open);
      setClosedTrades(data.closed);
    } catch (err) {
      setError(err.message || "Unable to load positions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isOpen = activeTab === "open";
  const rows = isOpen ? openPositions : closedTrades;

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        String(row.symbol || "").toLowerCase().includes(search.trim().toLowerCase())
      ),
    [rows, search]
  );

  // Totals use only the stored quantity / prices; nothing is estimated.
  const totals = useMemo(() => {
    const invested = openPositions.reduce(
      (sum, p) => sum + Number(p.quantity || 0) * Number(p.averagePrice || 0),
      0
    );
    const current = openPositions.reduce(
      (sum, p) => sum + Number(p.quantity || 0) * Number(p.ltp || 0),
      0
    );
    const pnl = openPositions.reduce((sum, p) => sum + Number(p.pnl || 0), 0);
    return { invested, current, pnl };
  }, [openPositions]);

  const hasAny = openPositions.length + closedTrades.length > 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track open positions and closed trades.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button type="button" onClick={load} className="font-medium underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryCard icon={Activity} label="Open positions" value={loading ? "…" : openPositions.length} />
        <SummaryCard icon={History} label="Closed trades" value={loading ? "…" : closedTrades.length} />
        <SummaryCard icon={Wallet} label="Invested" value={loading ? "…" : inr(totals.invested)} />
        <SummaryCard icon={TrendingUp} label="Current value" value={loading ? "…" : inr(totals.current)} />
        <SummaryCard
          icon={TrendingUp}
          label="Open P&L"
          value={loading ? "…" : inr(totals.pnl)}
          valueClass={loading ? "text-gray-900" : pnlClass(totals.pnl)}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
          <div className="flex gap-2">
            {[
              ["open", "Open"],
              ["closed", "Closed / History"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  activeTab === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol"
              aria-label="Search positions by symbol"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        {loading && <p className="p-8 text-center text-sm text-gray-500">Loading positions…</p>}

        {!loading && !error && filteredRows.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            {search
              ? "No positions match your search."
              : !hasAny
              ? "You have no positions yet. Positions are recorded on your account by AtoZ Broking after your trades are confirmed. Contact support if you expect to see one."
              : isOpen
              ? "You have no open positions."
              : "No closed trades yet."}
          </div>
        )}

        {!loading && filteredRows.length > 0 && (
          <>
            {/* Phones: one card per position */}
            <ul className="divide-y divide-gray-100 md:hidden">
              {filteredRows.map((row) => (
                <li key={row.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {row.symbol}
                        <ManualBadge source={row.source} />
                      </p>
                      <p className="text-xs text-gray-500">
                        {row.side} · {row.product} · Qty {row.quantity}
                      </p>
                    </div>
                    <p className={`text-sm font-semibold ${pnlClass(row.pnl)}`}>{inr(row.pnl)}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                    {isOpen ? (
                      <>
                        <dt>Avg price</dt>
                        <dd className="text-right text-gray-800">{inr(row.averagePrice)}</dd>
                        <dt>Last price</dt>
                        <dd className="text-right text-gray-800">{inr(row.ltp)}</dd>
                      </>
                    ) : (
                      <>
                        <dt>Buy price</dt>
                        <dd className="text-right text-gray-800">{inr(row.buyPrice)}</dd>
                        <dt>Sell price</dt>
                        <dd className="text-right text-gray-800">{inr(row.sellPrice)}</dd>
                        <dt>Closed</dt>
                        <dd className="text-right text-gray-800">{formatDate(row.closedAt)}</dd>
                      </>
                    )}
                  </dl>
                </li>
              ))}
            </ul>

            {/* Tablet / desktop: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Instrument</th>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    {isOpen ? (
                      <>
                        <th className="px-4 py-3 text-right">Avg price</th>
                        <th className="px-4 py-3 text-right">Last price</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-right">Buy price</th>
                        <th className="px-4 py-3 text-right">Sell price</th>
                        <th className="px-4 py-3">Closed</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-right">P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{row.symbol}</span>
                        <ManualBadge source={row.source} />
                        <p className="text-xs text-gray-500">{row.product}</p>
                      </td>
                      <td className="px-4 py-3">{row.side}</td>
                      <td className="px-4 py-3 text-right">{row.quantity}</td>
                      {isOpen ? (
                        <>
                          <td className="px-4 py-3 text-right">{inr(row.averagePrice)}</td>
                          <td className="px-4 py-3 text-right">{inr(row.ltp)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-right">{inr(row.buyPrice)}</td>
                          <td className="px-4 py-3 text-right">{inr(row.sellPrice)}</td>
                          <td className="px-4 py-3">{formatDate(row.closedAt)}</td>
                        </>
                      )}
                      <td className={`px-4 py-3 text-right font-medium ${pnlClass(row.pnl)}`}>
                        {inr(row.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
