import {
  ArrowUpFromLine,
  Building2,
  CheckCircle2,
  ChevronRight,
  Landmark,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useState } from "react";


export default function Withdrawal() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);


  /* =====================================================
     DEMO DATA
  ===================================================== */

  const availableBalance = 250000;

  const withdrawableAmount = 125000;

  const bank = {
    name: "HDFC Bank",
    account: "XXXX XXXX 4582",
  };


  /* =====================================================
     FORMAT CURRENCY
  ===================================================== */

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };


  /* =====================================================
     WITHDRAWAL SUBMIT
  ===================================================== */

  const handleWithdrawal = (e) => {
    e.preventDefault();

    const requestedAmount = Number(amount);

    if (!requestedAmount || requestedAmount <= 0) {
      return;
    }

    if (requestedAmount > withdrawableAmount) {
      return;
    }

    setSubmitted(true);
  };


  return (
    <div className="space-y-6">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Withdraw Funds
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Withdraw available funds to your registered bank account.
        </p>

      </div>


      {/* =================================================
          BALANCE CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2">


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
                {formatCurrency(availableBalance)}
              </p>

            </div>

          </div>

        </div>


        {/* Withdrawable */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <ArrowUpFromLine size={21} />
            </div>

            <div>

              <p className="text-xs text-slate-500">
                Withdrawable Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(withdrawableAmount)}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-3">


        {/* =================================================
            WITHDRAWAL FORM
        ================================================= */}

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Withdrawal Request
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the amount you want to withdraw.
            </p>

          </div>


          {submitted ? (

            /* =================================================
                SUCCESS
            ================================================= */

            <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">

                <CheckCircle2 size={30} />

              </div>


              <h3 className="mt-4 text-lg font-semibold text-green-900">
                Withdrawal Request Submitted
              </h3>


              <p className="mt-2 text-sm text-green-700">

                Your withdrawal request for{" "}

                <strong>
                  {formatCurrency(Number(amount))}
                </strong>{" "}

                has been submitted successfully.

              </p>


              <p className="mt-2 text-xs text-green-600">
                The amount will be transferred to your registered bank account after verification.
              </p>


              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">

                <button
                  onClick={() => navigate("/funds")}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  View Funds
                </button>


                <button
                  onClick={() => {
                    setSubmitted(false);
                    setAmount("");
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  New Withdrawal
                </button>

              </div>

            </div>

          ) : (

            <form
              onSubmit={handleWithdrawal}
              className="space-y-6"
            >


              {/* =================================================
                  AMOUNT
              ================================================= */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-medium text-slate-700">
                    Withdrawal Amount
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setAmount(
                        String(withdrawableAmount)
                      )
                    }
                    className="text-xs font-semibold text-green-600 hover:text-green-700"
                  >
                    Withdraw Maximum
                  </button>

                </div>


                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="500"
                    max={withdrawableAmount}
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />

                </div>


                <div className="mt-2 flex justify-between text-xs">

                  <span className="text-slate-500">
                    Minimum withdrawal: ₹500
                  </span>

                  <span className="text-slate-500">
                    Maximum: {formatCurrency(withdrawableAmount)}
                  </span>

                </div>

              </div>


              {/* =================================================
                  BANK ACCOUNT
              ================================================= */}

              <div>

                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Withdraw To
                </label>


                <div className="rounded-xl border-2 border-green-600 bg-green-50 p-4">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm">
                        <Landmark size={20} />
                      </div>


                      <div>

                        <p className="text-sm font-semibold text-slate-900">
                          {bank.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {bank.account}
                        </p>

                      </div>

                    </div>


                    <div className="flex items-center gap-1 text-xs font-medium text-green-700">

                      <CheckCircle2 size={15} />

                      Verified

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  WITHDRAWAL SUMMARY
              ================================================= */}

              <div className="rounded-xl bg-slate-50 p-4">

                <div className="space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Withdrawal Amount
                    </span>

                    <span className="text-sm font-medium text-slate-900">
                      {amount
                        ? formatCurrency(Number(amount))
                        : "₹0"}
                    </span>

                  </div>


                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Processing Fee
                    </span>

                    <span className="text-sm font-medium text-green-600">
                      ₹0
                    </span>

                  </div>


                  <div className="border-t border-slate-200 pt-3">

                    <div className="flex items-center justify-between">

                      <span className="text-sm font-semibold text-slate-700">
                        Amount to Receive
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        {amount
                          ? formatCurrency(Number(amount))
                          : "₹0"}
                      </span>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={
                  !amount ||
                  Number(amount) <= 0 ||
                  Number(amount) > withdrawableAmount
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <ArrowUpFromLine size={18} />

                Request Withdrawal

                <ChevronRight size={17} />

              </button>


              {/* SECURITY */}

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">

                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-xs leading-5 text-slate-500">
                  Withdrawals can only be processed to your registered and verified bank account. Additional verification may be required.
                </p>

              </div>

            </form>

          )}

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="space-y-4">


          {/* BANK ACCOUNT */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              Registered Bank Account
            </h3>


            <div className="mt-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Building2 size={19} />
              </div>


              <div>

                <p className="text-sm font-medium text-slate-900">
                  {bank.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {bank.account}
                </p>

              </div>

            </div>


            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-600">

              <CheckCircle2 size={14} />

              Bank account verified

            </div>

          </div>


          {/* PROCESSING INFO */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              Withdrawal Information
            </h3>


            <div className="mt-4 space-y-4">

              <div>

                <p className="text-sm font-medium text-slate-700">
                  Processing Time
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Withdrawal requests are normally processed within 1–2 business days.
                </p>

              </div>


              <div>

                <p className="text-sm font-medium text-slate-700">
                  Processing Fee
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  No withdrawal processing fee is currently shown in this demo.
                </p>

              </div>


              <div>

                <p className="text-sm font-medium text-slate-700">
                  Security
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Funds are transferred only to your verified registered bank account.
                </p>

              </div>

            </div>

          </div>


          {/* DEMO NOTICE */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

            <p className="text-sm font-semibold text-blue-900">
              Demo Mode
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              This withdrawal form is for the client presentation. No real bank transaction will be processed.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}