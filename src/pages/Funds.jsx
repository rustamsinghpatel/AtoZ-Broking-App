
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  TrendingUp,
  Banknote,
  ChevronRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { getMyFunds } from "../services/api";

export default function Funds() {
  const navigate = useNavigate();

  const [fundSummary, setFundSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadFunds = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getMyFunds();

        if (cancelled) return;

        if (!result || typeof result.walletBalance !== "number") {
          throw new Error("Backend se valid fund balance nahi mila.");
        }

        setFundSummary({
          available: result.walletBalance,
        });

        setActivities(
          Array.isArray(result.transactions)
            ? result.transactions.map((tx) => ({
                id: tx.id,
                date: tx.date,
                type: tx.type,
                method: tx.asset || tx.method || "Not specified",
                amount: Number(tx.amount) || 0,
                status: tx.status,
              }))
            : []
        );
      } catch (err) {
        if (cancelled) return;

        setFundSummary(null);
        setActivities([]);
        setError(
          err?.message ||
            "Funds load nahi ho sake. Please dobara try karein."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFunds();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const balanceText = loading
    ? "Loading..."
    : error || !fundSummary
      ? "Unavailable"
      : formatCurrency(fundSummary.available);

  const statusClass = (status) => {
    if (status === "Completed") {
      return "bg-green-50 text-green-700";
    }

    if (status === "Rejected" || status === "Failed") {
      return "bg-red-50 text-red-700";
    }

    return "bg-yellow-50 text-yellow-700";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Funds Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your funds, deposits and withdrawals.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-900">
              Funds data load nahi hua
            </p>
            <p className="mt-1 text-sm text-red-700">
              API connection, login session aur backend status check karein.
              {` ${error}`}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-semibold text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Wallet size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Available Balance</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {balanceText}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Invested Amount</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                Unavailable
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Backend data required
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Banknote size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Withdrawable Amount</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                Unavailable
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Backend data required
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Portfolio</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                Unavailable
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Backend data required
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/deposit")}
          className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-green-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ArrowDownToLine size={23} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Add Funds</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Deposit money into your trading account.
                </p>
              </div>
            </div>
            <ChevronRight
              size={20}
              className="text-slate-400 transition group-hover:translate-x-1"
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/withdrawal")}
          className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <ArrowUpFromLine size={23} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Withdraw Funds
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Transfer available funds to your bank.
                </p>
              </div>
            </div>
            <ChevronRight
              size={20}
              className="text-slate-400 transition group-hover:translate-x-1"
            />
          </div>
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Fund Activity
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your latest deposits and withdrawals.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">
            Loading fund activity...
          </p>
        ) : error ? (
          <p className="p-6 text-sm text-slate-500">
            Fund activity is unavailable until the API connection is restored.
          </p>
        ) : activities.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            Abhi koi deposit ya withdrawal record nahi hai.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Method
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {item.type === "Deposit" ? (
                            <ArrowDownToLine
                              size={16}
                              className="text-green-600"
                            />
                          ) : (
                            <ArrowUpFromLine
                              size={16}
                              className="text-orange-600"
                            />
                          )}
                          <span className="font-medium text-slate-800">
                            {item.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {item.method}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            item.status
                          )}`}
                        >
                          {item.status === "Completed" ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <Clock3 size={13} />
                          )}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {activities.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {item.type === "Deposit" ? (
                          <ArrowDownToLine
                            size={16}
                            className="text-green-600"
                          />
                        ) : (
                          <ArrowUpFromLine
                            size={16}
                            className="text-orange-600"
                          />
                        )}
                        <span className="text-sm font-semibold text-slate-900">
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(item.date)} · {item.method}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status === "Completed" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Clock3 size={12} />
                      )}
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-bold text-slate-900">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
