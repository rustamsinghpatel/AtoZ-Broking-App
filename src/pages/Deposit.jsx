
import {
  ArrowDownToLine,
  Building2,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  Landmark,
  QrCode,
} from "lucide-react";

import { useState } from "react";
import { apiRequest } from "../services/api";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [submittedDeposit, setSubmittedDeposit] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bankDetails = {
    name: "RBL BANK",
    accountNumber: "309031070256",
    ifsc: "RATN0000571",
  };

  // Client se verified UPI ID milne par yahan add karna.
  const upiId = "";

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  // Real backend par deposit request save karta hai.
  const handleDeposit = async (e) => {
    e.preventDefault();
    setError("");

    const depositAmount = Number(amount);

    if (!Number.isFinite(depositAmount) || depositAmount < 1) {
      setError("Minimum deposit amount ₹1 hai.");
      return;
    }

    if (!Number.isInteger(depositAmount)) {
      setError("Amount poore rupees mein enter karein.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest("/api/funds/deposit", {
        method: "POST",
        body: JSON.stringify({
          amount: depositAmount,
          method,
          referenceNumber: referenceNumber.trim(),
        }),
      });

      if (!result?.success || !result?.data?.deposit) {
        throw new Error(
          result?.message || "Deposit request save nahi ho saki."
        );
      }

      // Confirmation tabhi jab backend request save kar de.
      setSubmittedDeposit(result.data.deposit);
    } catch (err) {
      setError(
        err.message ||
          "Server se connect nahi ho paya. Please dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value, field) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
    } catch {
      alert(`${field} manually copy karein: ${value}`);
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

      {/* BALANCE: abhi backend se live balance nahi aa raha */}
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
            <p className="mt-1 text-xs text-green-700">
              Balance abhi demo value hai.
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
              Amount aur payment method select karein.
            </p>
          </div>

          {submittedDeposit ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                <CheckCircle2 size={30} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-green-900">
                Deposit Request Submitted
              </h3>

              <p className="mt-2 text-sm text-green-800">
                Amount:{" "}
                <strong>
                  {formatCurrency(submittedDeposit.amount)}
                </strong>
              </p>

              <p className="mt-1 text-sm text-green-800">
                Status:{" "}
                <strong>
                  {submittedDeposit.status || "pending"}
                </strong>
              </p>

              <p className="mt-1 break-all text-xs text-green-800">
                Request ID: {submittedDeposit._id}
              </p>

              <p className="mt-3 text-sm leading-6 text-green-800">
                Request backend mein save ho gayi hai. Payment verify hone
                aur admin approval se pehle wallet balance credit nahi hoga.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSubmittedDeposit(null);
                  setAmount("");
                  setReferenceNumber("");
                  setMethod("UPI");
                  setError("");
                  setCopiedField("");
                }}
                className="mt-5 rounded-lg border border-green-300 bg-white px-5 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-100"
              >
                New Deposit
              </button>
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
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-500">
                  Minimum deposit amount: ₹1
                </p>
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("UPI");
                      setError("");
                    }}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${
                      method === "UPI"
                        ? "border-green-600 bg-green-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <QrCode
                      size={24}
                      className={
                        method === "UPI"
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    />
                    <span className="text-sm font-semibold text-slate-900">
                      UPI / QR
                    </span>
                    {method === "UPI" && (
                      <CheckCircle2
                        size={18}
                        className="ml-auto text-green-600"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod("Bank Transfer");
                      setError("");
                    }}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${
                      method === "Bank Transfer"
                        ? "border-green-600 bg-green-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <Building2
                      size={24}
                      className={
                        method === "Bank Transfer"
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    />
                    <span className="text-sm font-semibold text-slate-900">
                      Bank Transfer
                    </span>
                    {method === "Bank Transfer" && (
                      <CheckCircle2
                        size={18}
                        className="ml-auto text-green-600"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* QR CODE */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Scan &amp; Pay
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    UPI app se QR scan karke payment karein.
                  </p>
                </div>

                <div className="mt-5 flex justify-center">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <img
                      src="/images/QR.jpeg"
                      alt="UPI payment QR code"
                      className="h-56 w-56 object-contain"
                    />
                  </div>
                </div>

                <p className="mt-3 text-center text-xs text-slate-500">
                  Google Pay, PhonePe ya doosri supported UPI app use karein.
                </p>

                {upiId ? (
                  <div className="mt-5 rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">UPI ID</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="break-all text-sm font-semibold text-slate-900">
                        {upiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(upiId, "UPI ID")}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        <Copy size={15} />
                        {copiedField === "UPI ID" ? "Copied" : "Copy UPI ID"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-xs text-slate-500">
                    Verified UPI ID abhi add nahi ki gayi hai.
                  </p>
                )}
              </div>

              {/* BANK DETAILS */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    <Building2 size={23} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Bank Transfer Details
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      NEFT / IMPS / RTGS
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    {
                      label: "Bank Name",
                      value: bankDetails.name,
                      field: "Bank name",
                    },
                    {
                      label: "Account Number",
                      value: bankDetails.accountNumber,
                      field: "Account number",
                    },
                    {
                      label: "IFSC Code",
                      value: bankDetails.ifsc,
                      field: "IFSC code",
                    },
                  ].map((item) => (
                    <div
                      key={item.field}
                      className="rounded-lg bg-slate-50 p-3"
                    >
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="break-all font-semibold text-slate-900">
                          {item.value}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.value, item.field)}
                          className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Copy size={14} />
                          {copiedField === item.field ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Live use se pehle account details account holder se confirm
                  karein. Payment proof aur reference number sambhal kar rakhein.
                </p>
              </div>

              {/* PAYMENT REFERENCE */}
              <div>
                <label
                  htmlFor="payment-reference"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  UTR / Payment Reference Number
                </label>
                <input
                  id="payment-reference"
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Payment ke baad reference number enter karein"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Agar available ho, payment reference enter karein taaki admin
                  payment verify kar sake.
                </p>
              </div>

              {/* CARD: COMING SOON */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-400">
                    <CreditCard size={23} />
                  </div>
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

              {/* API ERROR */}
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowDownToLine size={18} />
                {loading ? "Submitting Request..." : "Submit Deposit Request"}
                {!loading && <ChevronRight size={17} />}
              </button>

              <p className="text-xs leading-5 text-slate-500">
                Request submit karne se payment automatically verify nahi hoti.
                Admin payment verify karke hi request approve karega.
              </p>
            </form>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">How it works</h3>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  1
                </span>
                <p className="text-sm text-slate-600">
                  Amount aur payment method select karein.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  2
                </span>
                <p className="text-sm text-slate-600">
                  Payment karein aur reference number enter karein.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  3
                </span>
                <p className="text-sm text-slate-600">
                  Admin payment verify karke request review karega.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Payment Verification
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-700">
              Deposit request backend mein save hogi. Payment verify hone se
              pehle wallet balance update nahi hona chahiye.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
