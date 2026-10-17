
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
import { useEffect, useState } from "react";

import {
  createWithdrawalRequest,
  getMyFunds,
  getMyBankKyc,
} from "../services/api";

export default function Withdrawal() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [bank, setBank] = useState(null);
  const [bankLoading, setBankLoading] = useState(true);

  const withdrawableAmount = Math.min(availableBalance, 125000);
  const bankApproved = bank?.status === "approved";

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  // Actual wallet balance load karo.
  useEffect(() => {
    let active = true;

    const loadFunds = async () => {
      setBalanceLoading(true);

      try {
        const funds = await getMyFunds();

        if (active) {
          setAvailableBalance(Number(funds.walletBalance) || 0);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Wallet balance load nahi ho saka.");
        }
      } finally {
        if (active) {
          setBalanceLoading(false);
        }
      }
    };

    loadFunds();

    return () => {
      active = false;
    };
  }, []);

  // Actual Bank KYC backend se load karo.
  useEffect(() => {
    let active = true;

    const loadBankInfo = async () => {
      setBankLoading(true);

      try {
        const bankInfo = await getMyBankKyc();

        if (active) {
          setBank(bankInfo);
        }
      } catch (err) {
        if (active) {
          setBank(null);
          setError(
            err.message || "Bank details load nahi ho sake."
          );
        }
      } finally {
        if (active) {
          setBankLoading(false);
        }
      }
    };

    loadBankInfo();

    return () => {
      active = false;
    };
  }, []);

  // Backend ko actual withdrawal request bhejo.
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const requestedAmount = Number(amount);

    if (bankLoading) {
      setError("Bank verification status load hone ka wait karein.");
      return;
    }

    if (!bankApproved) {
      setError(
        "Withdrawal se pehle apna Bank KYC submit karwa kar admin se approve karwayein."
      );
      return;
    }

    if (balanceLoading) {
      setError("Wallet balance load hone ka wait karein.");
      return;
    }

    if (!Number.isFinite(requestedAmount) || requestedAmount < 500) {
      setError("Minimum withdrawal amount ₹500 hai.");
      return;
    }

    if (requestedAmount > withdrawableAmount) {
      setError(
        `Aap maximum ${formatCurrency(withdrawableAmount)} withdraw kar sakte hain.`
      );
      return;
    }

    setLoading(true);

    try {
      const result = await createWithdrawalRequest(requestedAmount);

      setSuccessMessage(
        result.message || "Withdrawal request submit ho gayi."
      );
      setSubmitted(true);

      try {
        const funds = await getMyFunds();
        setAvailableBalance(Number(funds.walletBalance) || 0);
      } catch {
        // Request successful ho chuki hai; balance refresh alag se fail ho sakta hai.
      }
    } catch (err) {
      setError(
        err.message || "Withdrawal request submit nahi ho saki."
      );
    } finally {
      setLoading(false);
    }
  };

  const bankCardContent = (
    <>
      {bankLoading ? (
        <p className="text-sm text-slate-500">
          Bank details load ho rahi hain...
        </p>
      ) : bank?.status === "approved" ? (
        <>
          <p className="text-sm font-semibold text-slate-900">
            {bank.bankName}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {bank.accountNumberMasked}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {bank.accountHolder}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 size={15} />
            Verified
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-900">
            {bank?.bankName || "Bank account not approved"}
          </p>
          {bank?.accountNumberMasked && (
            <p className="mt-1 text-xs text-slate-500">
              {bank.accountNumberMasked}
            </p>
          )}
          <p className="mt-2 text-xs font-medium text-amber-700">
            {bank?.status === "pending"
              ? "Bank KYC admin approval ke liye pending hai."
              : bank?.status === "rejected"
                ? `Bank KYC rejected hai. ${bank.rejectionReason || "Please update your bank details."}`
                : "Pehle apna Bank KYC submit karein."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="mt-3 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            Profile mein Bank KYC check karein
          </button>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Withdraw Funds
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Withdraw available funds to your registered bank account.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Wallet size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Available Balance</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {balanceLoading ? "Loading..." : formatCurrency(availableBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <ArrowUpFromLine size={21} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Withdrawable Amount</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {balanceLoading ? "Loading..." : formatCurrency(withdrawableAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Withdrawal Request
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the amount you want to withdraw.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={30} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-green-900">
                Withdrawal Request Submitted
              </h3>

              <p className="mt-2 text-sm text-green-700">
                Your withdrawal request for{" "}
                <strong>{formatCurrency(Number(amount))}</strong>{" "}
                has been submitted.
              </p>

              <p className="mt-2 text-xs text-green-700">
                {successMessage}
              </p>

              <p className="mt-2 text-xs text-green-600">
                Request admin approval ke liye pending ho sakti hai.
                Iska matlab bank transfer complete hona nahi hai.
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
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  New Withdrawal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWithdrawal} className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="withdrawal-amount"
                    className="text-sm font-medium text-slate-700"
                  >
                    Withdrawal Amount
                  </label>

                  <button
                    type="button"
                    disabled={
                      balanceLoading ||
                      loading ||
                      withdrawableAmount < 500
                    }
                    onClick={() => {
                      setAmount(String(withdrawableAmount));
                      setError("");
                    }}
                    className="text-xs font-semibold text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    Withdraw Maximum
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ₹
                  </span>
                  <input
                    id="withdrawal-amount"
                    type="number"
                    min="500"
                    max={withdrawableAmount}
                    step="1"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                    disabled={balanceLoading || loading}
                  />
                </div>

                <div className="mt-2 flex justify-between gap-3 text-xs">
                  <span className="text-slate-500">
                    Minimum withdrawal: ₹500
                  </span>
                  <span className="text-right text-slate-500">
                    Maximum: {formatCurrency(withdrawableAmount)}
                  </span>
                </div>

                {!balanceLoading && withdrawableAmount < 500 && (
                  <p className="mt-2 text-sm text-amber-700">
                    Aapka available balance ₹500 se kam hai. Withdrawal ke
                    liye wallet balance kam se kam ₹500 hona chahiye.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Withdraw To
                </label>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-green-600">
                      <Landmark size={20} />
                    </div>
                    <div className="min-w-0">{bankCardContent}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Withdrawal Amount
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {amount ? formatCurrency(Number(amount)) : "₹0"}
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
                        {amount ? formatCurrency(Number(amount)) : "₹0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  balanceLoading ||
                  bankLoading ||
                  loading ||
                  !bankApproved ||
                  !amount ||
                  Number(amount) < 500 ||
                  Number(amount) > withdrawableAmount
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowUpFromLine size={18} />
                {loading
                  ? "Submitting..."
                  : !bankLoading && !bankApproved
                    ? "Bank KYC Approval Required"
                    : "Request Withdrawal"}
                {!loading && <ChevronRight size={17} />}
              </button>

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />
                <p className="text-xs leading-5 text-slate-500">
                  Request backend par validate hogi. Request submit hone ka
                  matlab bank transfer complete hona nahi hai.
                </p>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              Registered Bank Account
            </h3>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Building2 size={19} />
              </div>
              <div className="min-w-0">{bankCardContent}</div>
            </div>
          </div>

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
                  Withdrawal requests may require admin verification before
                  processing.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Processing Fee
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Displayed processing fee: ₹0.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Security
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Withdrawal ke liye approved bank KYC aur backend approval
                  zaroori hai.
                </p>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
}
