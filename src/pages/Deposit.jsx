import {
  ArrowDownToLine,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Landmark,
  Smartphone,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useState } from "react";


export default function Deposit() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [submitted, setSubmitted] = useState(false);


  const handleDeposit = (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      return;
    }

    setSubmitted(true);
  };


  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };


  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Deposit Funds
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add funds to your AtoZ Broking trading account.
        </p>

      </div>


      {/* BALANCE */}

      <div className="rounded-xl border border-green-100 bg-green-50 p-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
            <Landmark size={21} />
          </div>

          <div>

            <p className="text-xs font-medium text-green-700">
              Current Available Balance
            </p>

            <p className="mt-1 text-xl font-bold text-green-900">
              {formatCurrency(250000)}
            </p>

          </div>

        </div>

      </div>


      <div className="grid gap-6 lg:grid-cols-3">


        {/* DEPOSIT FORM */}

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Add Money
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the amount and select your preferred payment method.
            </p>

          </div>


          {submitted ? (

            /* SUCCESS */

            <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">

                <CheckCircle2 size={30} />

              </div>

              <h3 className="mt-4 text-lg font-semibold text-green-900">
                Deposit Request Submitted
              </h3>

              <p className="mt-2 text-sm text-green-700">
                Your deposit request for{" "}
                <strong>
                  {formatCurrency(Number(amount))}
                </strong>{" "}
                has been submitted successfully.
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
                  New Deposit
                </button>

              </div>

            </div>

          ) : (

            <form
              onSubmit={handleDeposit}
              className="space-y-6"
            >

              {/* AMOUNT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Deposit Amount
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />

                </div>

                <p className="mt-1.5 text-xs text-slate-500">
                  Minimum deposit amount: ₹500
                </p>

              </div>


              {/* PAYMENT METHOD */}

              <div>

                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>


                <div className="grid gap-3 sm:grid-cols-3">


                  {/* UPI */}

                  <button
                    type="button"
                    onClick={() => setMethod("UPI")}
                    className={
                      method === "UPI"
                        ? "rounded-xl border-2 border-green-600 bg-green-50 p-4 text-left"
                        : "rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300"
                    }
                  >

                    <Smartphone
                      size={22}
                      className={
                        method === "UPI"
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      UPI
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Google Pay, PhonePe etc.
                    </p>

                  </button>


                  {/* BANK */}

                  <button
                    type="button"
                    onClick={() => setMethod("Bank Transfer")}
                    className={
                      method === "Bank Transfer"
                        ? "rounded-xl border-2 border-green-600 bg-green-50 p-4 text-left"
                        : "rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300"
                    }
                  >

                    <Building2
                      size={22}
                      className={
                        method === "Bank Transfer"
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      Bank Transfer
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      NEFT / IMPS / RTGS
                    </p>

                  </button>


                  {/* CARD */}

                  <button
                    type="button"
                    onClick={() => setMethod("Card")}
                    className={
                      method === "Card"
                        ? "rounded-xl border-2 border-green-600 bg-green-50 p-4 text-left"
                        : "rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300"
                    }
                  >

                    <CreditCard
                      size={22}
                      className={
                        method === "Card"
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      Card
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Debit / Credit Card
                    </p>

                  </button>

                </div>

              </div>


              {/* SELECTED METHOD */}

              <div className="rounded-lg bg-slate-50 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Selected Method
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {method}
                  </span>

                </div>

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >

                <ArrowDownToLine size={18} />

                Continue to Deposit

                <ChevronRight size={17} />

              </button>

            </form>

          )}

        </div>


        {/* RIGHT SIDE INFO */}

        <div className="space-y-4">


          {/* BANK DETAILS */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              Registered Bank
            </h3>

            <div className="mt-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Landmark size={19} />
              </div>

              <div>

                <p className="text-sm font-medium text-slate-900">
                  HDFC Bank
                </p>

                <p className="text-xs text-slate-500">
                  XXXX XXXX 4582
                </p>

              </div>

            </div>

          </div>


          {/* STEPS */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              How it works
            </h3>

            <div className="mt-4 space-y-4">

              <div className="flex gap-3">

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  1
                </span>

                <p className="text-sm text-slate-600">
                  Enter the amount you want to add.
                </p>

              </div>

              <div className="flex gap-3">

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  2
                </span>

                <p className="text-sm text-slate-600">
                  Select your preferred payment method.
                </p>

              </div>

              <div className="flex gap-3">

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  3
                </span>

                <p className="text-sm text-slate-600">
                  Complete the payment to add funds.
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
              This deposit form is for the client presentation. No real payment will be processed.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}