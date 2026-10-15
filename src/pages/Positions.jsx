import { useEffect, useState } from "react";
import { Activity, History, Search } from "lucide-react";

import { getPositions } from "../services/api";

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value) || 0);

const pnlClass = (value) =>
  Number(value) >= 0 ? "text-green-600" : "text-red-600";

export default function Positions() {
  const [activeTab, setActiveTab] = useState("open");
  const [search, setSearch] = useState("");

  const [openPositions, setOpenPositions] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getPositions();

        if (!cancelled) {
          setOpenPositions(data.open);
          setClosedTrades(data.closed);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load positions.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = activeTab === "open" ? openPositions : closedTrades;

  const filteredRows = rows.filter((row) =>
    String(row.symbol || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const isOpen = activeTab === "open";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track open positions and closed trades.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity size={18} />
            Open Positions
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {openPositions.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <History size={18} />
            Closed Trades
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {closedTrades.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("open")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                isOpen
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Open
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("closed")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                !isOpen
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Closed / History
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search instrument"
              className="w-40 text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">Instrument</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                {isOpen ? (
                  <>
                    <th className="px-4 py-3">Avg. Price</th>
                    <th className="px-4 py-3">LTP</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3">Buy Price</th>
                    <th className="px-4 py-3">Sell Price</th>
                  </>
                )}
                <th className="px-4 py-3">P&L</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Loading positions...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="font-medium text-red-600">
                      Positions load nahi ho paye
                    </p>
                    <p className="mt-1 text-gray-500">{error}</p>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Activity
                      size={28}
                      className="mx-auto mb-3 text-gray-400"
                    />
                    <p className="font-medium text-gray-700">
                      No {isOpen ? "open positions" : "closed trades"} yet
                    </p>
                    <p className="mt-1 text-gray-500">
                      Your trades will appear here once they are recorded.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.symbol}
                    </td>
                    <td className="px-4 py-3">{row.product || "-"}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    {isOpen ? (
                      <>
                        <td className="px-4 py-3">{inr(row.averagePrice)}</td>
                        <td className="px-4 py-3">{inr(row.ltp)}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{inr(row.buyPrice)}</td>
                        <td className="px-4 py-3">{inr(row.sellPrice)}</td>
                      </>
                    )}
                    <td className={`px-4 py-3 font-semibold ${pnlClass(row.pnl)}`}>
                      {inr(row.pnl)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}