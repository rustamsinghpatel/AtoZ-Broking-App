import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  TrendingUp,
  Banknote,
  ChevronRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


export default function Funds() {
  const navigate = useNavigate();

  const fundSummary = {
    available: 250000,
    invested: 850000,
    withdrawable: 125000,
    portfolio: 921500,
  };

  const activities = [
    {
      date: "08 Oct 2026",
      type: "Deposit",
      method: "Bank Transfer",
      amount: 50000,
      status: "Completed",
    },
    {
      date: "05 Oct 2026",
      type: "Withdrawal",
      method: "Bank Account",
      amount: 25000,
      status: "Completed",
    },
    {
      date: "28 Sep 2026",
      type: "Deposit",
      method: "UPI",
      amount: 100000,
      status: "Completed",
    },
    {
      date: "20 Sep 2026",
      type: "Deposit",
      method: "Bank Transfer",
      amount: 75000,
      status: "Pending",
    },
  ];


  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };


  return (
    <div className="space-y-6">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Funds Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your funds, deposits and withdrawals.
        </p>
      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


        {/* Available Balance */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Wallet size={21} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Available Balance
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(fundSummary.available)}
              </p>
            </div>

          </div>

        </div>


        {/* Invested */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp size={21} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Invested Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(fundSummary.invested)}
              </p>
            </div>

          </div>

        </div>


        {/* Withdrawable */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Banknote size={21} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Withdrawable Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(fundSummary.withdrawable)}
              </p>
            </div>

          </div>

        </div>


        {/* Portfolio */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp size={21} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Total Portfolio
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(fundSummary.portfolio)}
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-2">


        {/* Deposit */}

        <button
          onClick={() => navigate("/deposit")}
          className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-green-300 hover:shadow-md"
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ArrowDownToLine size={23} />
              </div>

              <div>

                <h3 className="font-semibold text-slate-900">
                  Add Funds
                </h3>

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


        {/* Withdrawal */}

        <button
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


      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

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


        {/* Desktop Table */}

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

              {activities.map((item, index) => (

                <tr
                  key={index}
                  className="border-b border-slate-100 last:border-0"
                >

                  <td className="px-5 py-4 text-slate-600">
                    {item.date}
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
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.status === "Completed"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
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


        {/* Mobile Cards */}

        <div className="space-y-3 p-4 md:hidden">

          {activities.map((item, index) => (

            <div
              key={index}
              className="rounded-lg border border-slate-200 p-4"
            >

              <div className="flex items-start justify-between">

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
                    {item.date} · {item.method}
                  </p>

                </div>


                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    item.status === "Completed"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
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

      </div>


      {/* =====================================================
          DEMO NOTICE
      ===================================================== */}

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

        <p className="text-sm font-semibold text-blue-900">
          Demo Mode
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Fund balances and activity shown here are demo values for the client presentation. Real fund transactions can be connected to the backend later.
        </p>

      </div>

    </div>
  );
}