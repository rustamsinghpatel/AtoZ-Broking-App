
import {
  ArrowDownToLine,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Copy,
  Landmark,
  QrCode,
  Smartphone,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Deposit() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Client ki asli UPI ID milne par yahan add karna.
  const upiId = "";

  // Indian currency format.
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Deposit amount validation.
  const handleDeposit = (e) => {
    e.preventDefault();

    const depositAmount = Number(amount);

    if (!Number.isFinite(depositAmount) || depositAmount < 500) {
      alert("Minimum deposit amount ₹500 hai.");
      return;
    }

    // Abhi demo mode hai. Backend request save nahi hoti.
    setSubmitted(true);
  };

  // UPI ID copy.
  const handleCopyUPI = async () => {
    if (!upiId) {
      alert("Client ki UPI ID abhi add nahi hui hai.");
      return;
    }

    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
    } catch {
      alert("UPI ID manually copy karein.");
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Deposit Funds
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add funds to your ATOZ Broking trading account.
        </p>
      </div>

      {/* AVAILABLE BALANCE - DEMO VALUE */}
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
              {formatCurrency(0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* MAIN DEPOSIT SECTION */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Add Money
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the amount and scan the QR code to pay.
            </p>
          </div>

          {submitted ? (
            /* DEMO CONFIRMATION */
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <CheckCircle2 size={30} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-amber-900">
                Deposit Pending Verification
              </h3>

              <p className="mt-2 text-sm text-amber-800">
                Deposit amount:{" "}
                <strong>{formatCurrency(Number(amount))}</strong>
              </p>

              <p className="mt-2 text-sm text-amber-800">
                Ye sirf demo confirmation hai. Payment verify nahi hui
                hai aur request backend mein save nahi hui hai.
              </p>

              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/funds")}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  View Funds
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setAmount("");
                    setCopied(false);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  New Deposit
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDeposit} className="space-y-6">
              {/* AMOUNT */}
              <div>
                <label
                  htmlFor="deposit-amount"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Deposit Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ₹
                  </span>

                  <input
                    id="deposit-amount"
                    type="number"
                    min="500"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-500">
                  Minimum deposit amount: ₹500
                </p>
              </div>

              {/* PAYMENT METHOD: QR ONLY */}
              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <div className="rounded-xl border-2 border-green-600 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-green-600">
                      <QrCode size={25} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        UPI QR Code
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Scan using a supported UPI payment app.
                      </p>
                    </div>

                    <CheckCircle2
                      size={21}
                      className="text-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* CLIENT QR IMAGE */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Scan & Pay
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Scan this QR code with your UPI app.
                  </p>
                </div>

                <div className="mt-5 flex justify-center">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <img
                      src="/images/QR.jpeg"
                      alt="Client UPI payment QR code"
                      className="h-56 w-56 object-contain"
                    />
                  </div>
                </div>

                <p className="mt-3 text-center text-xs text-slate-500">
                  Google Pay, PhonePe or another supported UPI app.
                </p>

                {/* OPTIONAL UPI ID */}
                {upiId ? (
                  <div className="mt-5 rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      UPI ID
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="break-all text-sm font-semibold text-slate-900">
                        {upiId}
                      </span>

                      <button
                        type="button"
                        onClick={handleCopyUPI}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Copy size={15} />
                        {copied ? "Copied" : "Copy UPI ID"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-xs text-slate-500">
                    UPI ID display will be available after the client
                    provides the exact ID.
                  </p>
                )}
              </div>

              {/* OTHER METHODS - COMING SOON */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Other Payment Methods
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <Building2
                      size={23}
                      className="text-slate-400"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Bank Transfer
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        NEFT / IMPS / RTGS
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">
                      Coming Soon
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <CreditCard
                      size={23}
                      className="text-slate-400"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Debit / Credit Card
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Card payments
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTINUE BUTTON */}
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

        {/* RIGHT SIDE INFORMATION */}
        <div className="space-y-4">
          {/* REGISTERED BANK */}
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

          {/* HOW IT WORKS */}
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
                  Enter the deposit amount.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  2
                </span>

                <p className="text-sm text-slate-600">
                  Scan the QR code and make the payment.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  3
                </span>

                <p className="text-sm text-slate-600">
                  Keep the payment reference for verification.
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
              QR code is displayed for presentation purposes.
              This form does not process payments, verify transactions,
              save deposit requests or update account balances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
