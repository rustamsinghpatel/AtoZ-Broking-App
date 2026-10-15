import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Camera,
  Landmark,
  Lock,
  ShieldCheck,
  User,
  UserCheck,
  IdCard,
  FileCheck,
  Clock,
  Pencil,
  Upload,
} from "lucide-react";

import {
  Async,
  Badge,
  Button,
  Card,
  cx,
  Input,
  Modal,
  PageHeader,
} from "../components/common";

import { useToast } from "../components/common/Toast";

import {
  InfoGrid,
  ProfileSection,
} from "../components/profile/ProfileSection";

import useAsync from "../hooks/useAsync";
import {
  getUser,
  updateUserProfile,
  getMyKyc,
  getMyKycDocumentBlob,
  submitUserKyc,
  getMyBankKyc,
  getMyBankKycDocumentBlob,
  submitBankKyc,
} from "../services/api";

function PasswordModal({ open, onClose }) {
  const toast = useToast();

  const [f, setF] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [err, setErr] = useState({});

  const close = () => {
    setF({ current: "", next: "", confirm: "" });
    setErr({});
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();

    const errors = {};

    if (!f.current) {
      errors.current = "Enter your current password.";
    }

    if (f.next.length < 6) {
      errors.next =
        "New password must be at least 6 characters.";
    }

    if (f.confirm !== f.next) {
      errors.confirm = "Passwords do not match.";
    }

    setErr(errors);

    if (Object.keys(errors).length) return;

    close();
    toast("Password updated (demo only).");
  };

  const field = (key, label) => (
    <Input
      id={`pw-${key}`}
      label={label}
      type="password"
      value={f[key]}
      error={err[key]}
      onChange={(e) =>
        setF({ ...f, [key]: e.target.value })
      }
    />
  );

  return (
    <Modal
      open={open}
      onClose={close}
      title="Change password"
    >
      <form
        onSubmit={submit}
        className="space-y-3"
        noValidate
      >
        {field("current", "Current password")}
        {field("next", "New password")}
        {field("confirm", "Confirm new password")}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={close}
          >
            Cancel
          </Button>

          <Button type="submit">Update</Button>
        </div>
      </form>
    </Modal>
  );
}

// --------------------------------------------------
// Address validation
// --------------------------------------------------
function validateAddress(f) {
  const errors = {};

  if (f.address.length > 200) {
    errors.address = "Address must be 200 characters or less.";
  }

  if (f.city.length > 60) {
    errors.city = "City must be 60 characters or less.";
  }

  if (f.state.length > 60) {
    errors.state = "State must be 60 characters or less.";
  }

  if (!f.country) {
    errors.country = "Country is required.";
  } else if (f.country.length > 60) {
    errors.country = "Country must be 60 characters or less.";
  }

  if (f.postalCode) {
    const isIndia = f.country.trim().toLowerCase() === "india";

    if (isIndia) {
      if (!/^[1-9][0-9]{5}$/.test(f.postalCode)) {
        errors.postalCode = "Enter a valid 6-digit PIN code.";
      }
    } else if (!/^[A-Za-z0-9 -]{3,10}$/.test(f.postalCode)) {
      errors.postalCode =
        "Enter a valid postal code (3 to 10 letters or numbers).";
    }
  }

  return errors;
}

// --------------------------------------------------
// Personal Information
// Existing backend-connected address editing
// --------------------------------------------------
function PersonalInfoSection({ u }) {
  const toast = useToast();

  const initial = {
    address: u?.address || "",
    city: u?.city || "",
    state: u?.state || "",
    postalCode: u?.postalCode || "",
    country: u?.country || "India",
  };

  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const startEdit = () => {
    setDraft(saved);
    setErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    if (saving) return;
    setDraft(saved);
    setErrors({});
    setEditing(false);
  };

  const change = (key) => (e) => {
    const value = e.target.value;

    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const save = async (e) => {
    e.preventDefault();

    if (saving) return;

    const clean = {
      address: draft.address.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      postalCode: draft.postalCode.trim(),
      country: draft.country.trim(),
    };

    const nextErrors = validateAddress(clean);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setSaving(true);

    try {
      const user = await updateUserProfile(clean);

      setSaved({
        address: user?.address ?? clean.address,
        city: user?.city ?? clean.city,
        state: user?.state ?? clean.state,
        postalCode: user?.postalCode ?? clean.postalCode,
        country: user?.country ?? clean.country,
      });

      setEditing(false);
      toast("Address updated successfully.");
    } catch (err) {
      toast(err.message || "Could not save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileSection title="Personal Information" icon={User}>
      {editing ? (
        <form onSubmit={save} className="space-y-3" noValidate>
          <InfoGrid
            items={[
              ["Full name", u?.fullName || "-"],
              ["Email", u?.email || "-"],
              ["Mobile", u?.mobile || "-"],
            ]}
          />

          <Input
            id="profile-address"
            label="Address"
            value={draft.address}
            error={errors.address}
            onChange={change("address")}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              id="profile-city"
              label="City"
              value={draft.city}
              error={errors.city}
              onChange={change("city")}
            />

            <Input
              id="profile-state"
              label="State"
              value={draft.state}
              error={errors.state}
              onChange={change("state")}
            />

            <Input
              id="profile-postal"
              label="PIN / Postal code"
              value={draft.postalCode}
              error={errors.postalCode}
              onChange={change("postalCode")}
            />

            <Input
              id="profile-country"
              label="Country"
              value={draft.country}
              error={errors.country}
              onChange={change("country")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <InfoGrid
            items={[
              ["Full name", u?.fullName || "-"],
              ["Email", u?.email || "-"],
              ["Mobile", u?.mobile || "-"],
              ["Address", saved.address || "-"],
              ["City", saved.city || "-"],
              ["State", saved.state || "-"],
              ["PIN / Postal code", saved.postalCode || "-"],
              ["Country", saved.country || "-"],
            ]}
          />

          <div className="flex justify-end">
            <Button variant="outline" onClick={startEdit}>
              <Pencil size={14} />
              Edit address
            </Button>
          </div>
        </div>
      )}
    </ProfileSection>
  );
}

// --------------------------------------------------
// Shared KYC helpers (PAN, Aadhaar and Bank use these)
// --------------------------------------------------
const MAX_KYC_SIZE = 2 * 1024 * 1024;
const KYC_TYPES = ["image/jpeg", "image/png", "image/webp"];

const KYC_STATUS = {
  not_submitted: { label: "Not Submitted", tone: "yellow" },
  pending: { label: "Pending", tone: "yellow" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

// Server par saved PAN / Aadhaar image ka preview (token ke saath mangwakar).
function useKycPreview(type, stamp) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!stamp) {
      setUrl("");
      return undefined;
    }

    let cancelled = false;
    let created = "";

    getMyKycDocumentBlob(type)
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setUrl(created);
      })
      .catch(() => {
        if (!cancelled) setUrl("");
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [type, stamp]);

  return url;
}

// Server par saved bank proof image ka preview.
function useBankPreview(stamp) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!stamp) {
      setUrl("");
      return undefined;
    }

    let cancelled = false;
    let created = "";

    getMyBankKycDocumentBlob()
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setUrl(created);
      })
      .catch(() => {
        if (!cancelled) setUrl("");
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [stamp]);

  return url;
}

function KycDocumentField({
  id,
  label,
  file,
  serverUrl,
  uploaded,
  error,
  locked,
  disabled,
  onSelect,
}) {
  const [localUrl, setLocalUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setLocalUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setLocalUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const previewUrl = localUrl || serverUrl;
  const hasImage = Boolean(file) || uploaded;

  const handleChange = (e) => {
    const chosen = e.target.files?.[0];
    e.target.value = "";

    if (chosen) onSelect(chosen);
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">{label}</p>

        <span className="text-xs text-slate-500">
          {file
            ? "New image selected (not submitted yet)"
            : uploaded
              ? "Uploaded"
              : "Not uploaded"}
        </span>
      </div>

      <div className="flex h-44 items-center justify-center overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-200">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${label} preview`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="px-3 text-center text-xs text-slate-400">
            {uploaded ? "Loading preview..." : "No image selected"}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {!locked && (
        <div className="mt-3">
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled}
            onChange={handleChange}
          />

          <label
            htmlFor={id}
            className={cx(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <Upload size={14} />
            {hasImage ? "Replace image" : "Choose image"}
          </label>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// Bank Information (backend connected: details + proof image)
// --------------------------------------------------
function BankInformationSection({ u }) {
  const toast = useToast();

  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [draft, setDraft] = useState({
    holder: u?.fullName || "",
    name: "",
    account: "",
    confirm: "",
    ifsc: "",
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadBank = useCallback(async () => {
    setLoadError("");

    try {
      setBank(await getMyBankKyc());
    } catch (err) {
      setLoadError(err.message || "Could not load bank KYC status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBank();
  }, [loadBank]);

  const statusKey = bank?.status || "not_submitted";
  const statusInfo = KYC_STATUS[statusKey] || KYC_STATUS.not_submitted;
  const canEdit = statusKey === "not_submitted" || statusKey === "rejected";
  const uploaded = Boolean(bank?.documentUploaded);

  const proofUrl = useBankPreview(
    uploaded ? String(bank.documentUploadedAt || "1") : ""
  );

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const selectFile = (chosen) => {
    let message = "";

    if (!KYC_TYPES.includes(chosen.type)) {
      message = "Only JPG, PNG or WEBP images are allowed.";
    } else if (chosen.size > MAX_KYC_SIZE) {
      message = "Image must be 2 MB or smaller.";
    }

    setErrors((prev) => ({ ...prev, file: message }));

    if (message) return;

    setFile(chosen);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const clean = {
      holder: draft.holder.trim(),
      name: draft.name.trim(),
      account: draft.account.trim(),
      confirm: draft.confirm.trim(),
      ifsc: draft.ifsc.trim().toUpperCase(),
    };

    const next = {};

    if (clean.holder.length < 2 || clean.holder.length > 100) {
      next.holder = "Account holder name must be 2 to 100 characters.";
    }

    if (!clean.name) {
      next.name = "Bank name is required.";
    } else if (clean.name.length > 100) {
      next.name = "Bank name must be 100 characters or less.";
    }

    if (!/^[0-9]{6,20}$/.test(clean.account)) {
      next.account = "Enter an account number containing 6–20 digits.";
    }

    if (clean.confirm !== clean.account) {
      next.confirm = "Account numbers do not match.";
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean.ifsc)) {
      next.ifsc = "Enter a valid 11-character IFSC code.";
    }

    // Backend har submit par naya proof maangta hai.
    if (!file) {
      next.file = "Please upload your bank proof image.";
    }

    setErrors(next);

    if (Object.keys(next).length) return;

    const formData = new FormData();

    formData.append("accountHolder", clean.holder);
    formData.append("bankName", clean.name);
    formData.append("accountNumber", clean.account);
    formData.append("ifsc", clean.ifsc);
    formData.append("bank", file);

    setSubmitting(true);

    try {
      await submitBankKyc(formData);

      setDraft((prev) => ({ ...prev, account: "", confirm: "" }));
      setFile(null);
      setErrors({});
      toast("Bank details submitted. Status: Pending.");

      await loadBank();
    } catch (err) {
      toast(err.message || "Could not submit bank details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileSection title="Bank Information" icon={Landmark}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs leading-5 text-slate-500">
            Enter your bank details exactly as in your bank records and
            upload a clear bank proof (cancelled cheque or passbook first
            page). Only the last 4 digits of the account number are shown
            after submission.
          </p>

          <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Loading bank details...</p>
        )}

        {!loading && loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{loadError}</p>

            <div className="mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setLoading(true);
                  loadBank();
                }}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {!loading && !loadError && bank && (
          <>
            {statusKey !== "not_submitted" && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <InfoGrid
                  items={[
                    ["Account holder", bank.accountHolder || "-"],
                    ["Bank name", bank.bankName || "-"],
                    ["Account number", bank.accountNumberMasked || "-"],
                    ["IFSC", bank.ifsc || "-"],
                    ["Submitted on", formatDate(bank.submittedAt)],
                    ["Reviewed on", formatDate(bank.reviewedAt)],
                  ]}
                />

                {statusKey === "pending" && (
                  <p className="mt-3 text-xs text-slate-500">
                    Your bank details are awaiting admin review.
                  </p>
                )}

                {statusKey === "approved" && (
                  <p className="mt-3 text-sm text-green-700">
                    Your bank details have been approved.
                  </p>
                )}

                {statusKey === "rejected" && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-medium">Your bank KYC was rejected.</p>

                    {bank.rejectionReason && (
                      <p className="mt-1">Reason: {bank.rejectionReason}</p>
                    )}

                    <p className="mt-1 text-xs">
                      Please enter the details again, upload a new proof
                      image and submit again.
                    </p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4" noValidate>
              {canEdit && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    id="bank-holder"
                    label="Account holder name"
                    value={draft.holder}
                    error={errors.holder}
                    autoComplete="name"
                    onChange={(e) => setField("holder", e.target.value)}
                  />

                  <Input
                    id="bank-name"
                    label="Bank name"
                    value={draft.name}
                    error={errors.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />

                  <Input
                    id="bank-account"
                    label="Account number"
                    type="password"
                    value={draft.account}
                    error={errors.account}
                    autoComplete="off"
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 20);

                      setDraft((prev) => ({ ...prev, account: value }));
                      setErrors((prev) => ({
                        ...prev,
                        account: "",
                        confirm: "",
                      }));
                    }}
                  />

                  <Input
                    id="bank-confirm"
                    label="Confirm account number"
                    type="password"
                    value={draft.confirm}
                    error={errors.confirm}
                    autoComplete="off"
                    onChange={(e) =>
                      setField(
                        "confirm",
                        e.target.value.replace(/\D/g, "").slice(0, 20)
                      )
                    }
                  />

                  <Input
                    id="bank-ifsc"
                    label="IFSC code"
                    value={draft.ifsc}
                    error={errors.ifsc}
                    maxLength={11}
                    autoComplete="off"
                    placeholder="ABCD0123456"
                    onChange={(e) =>
                      setField(
                        "ifsc",
                        e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 11)
                      )
                    }
                  />
                </div>
              )}

              <KycDocumentField
                id="bank-proof-file"
                label="Bank proof"
                file={file}
                serverUrl={proofUrl}
                uploaded={uploaded}
                error={errors.file}
                locked={!canEdit}
                disabled={submitting}
                onSelect={selectFile}
              />

              {canEdit && (
                <>
                  <p className="text-xs text-slate-500">
                    Allowed: JPG, PNG or WEBP, up to 2 MB.
                  </p>

                  <Button type="submit" block disabled={submitting}>
                    <Landmark size={16} />
                    {submitting
                      ? "Submitting..."
                      : statusKey === "rejected"
                        ? "Submit Bank Details Again"
                        : "Submit for Review"}
                  </Button>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </ProfileSection>
  );
}

// --------------------------------------------------
// KYC (PAN + Aadhaar number and image upload, backend connected)
// --------------------------------------------------
function KycSection() {
  const toast = useToast();

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [panNumber, setPanNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");

  const [files, setFiles] = useState({ pan: null, aadhaar: null });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadKyc = useCallback(async () => {
    setLoadError("");

    try {
      const data = await getMyKyc();
      setKyc(data);
    } catch (err) {
      setLoadError(err.message || "Could not load KYC status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKyc();
  }, [loadKyc]);

  const panDoc = kyc?.documents?.pan;
  const aadhaarDoc = kyc?.documents?.aadhaar;

  const panUploaded = Boolean(panDoc?.uploaded);
  const aadhaarUploaded = Boolean(aadhaarDoc?.uploaded);

  const panUrl = useKycPreview(
    "pan",
    panUploaded ? String(panDoc.uploadedAt || "1") : ""
  );

  const aadhaarUrl = useKycPreview(
    "aadhaar",
    aadhaarUploaded ? String(aadhaarDoc.uploadedAt || "1") : ""
  );

  const statusKey = kyc?.kycStatus || "not_submitted";
  const statusInfo = KYC_STATUS[statusKey] || KYC_STATUS.not_submitted;

  const canEdit =
    statusKey === "not_submitted" || statusKey === "rejected";

  const selectFile = (type) => (file) => {
    let message = "";

    if (!KYC_TYPES.includes(file.type)) {
      message = "Only JPG, PNG or WEBP images are allowed.";
    } else if (file.size > MAX_KYC_SIZE) {
      message = "Image must be 2 MB or smaller.";
    }

    setErrors((prev) => ({ ...prev, [type]: message }));

    if (message) return;

    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const cleanPan = panNumber.trim().toUpperCase();
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, "");

    const nextErrors = {};

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
      nextErrors.panNumber = "Enter a valid PAN, e.g. ABCDE1234F.";
    }

    if (!/^[0-9]{12}$/.test(cleanAadhaar)) {
      nextErrors.aadhaarNumber = "Enter a 12-digit Aadhaar number.";
    }

    if (!files.pan && !panUploaded) {
      nextErrors.pan = "Please upload your PAN card image.";
    }

    if (!files.aadhaar && !aadhaarUploaded) {
      nextErrors.aadhaar = "Please upload your Aadhaar card image.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    const maskedPan = `${cleanPan.slice(0, 2)}******${cleanPan.slice(-2)}`;
    const aadhaarLast4 = cleanAadhaar.slice(-4);

    const formData = new FormData();

    formData.append("kycPanMasked", maskedPan);
    formData.append("kycAadhaarLast4", aadhaarLast4);

    if (files.pan) formData.append("pan", files.pan);
    if (files.aadhaar) formData.append("aadhaar", files.aadhaar);

    setSubmitting(true);

    try {
      await submitUserKyc(formData);

      setPanNumber("");
      setAadhaarNumber("");
      setFiles({ pan: null, aadhaar: null });
      setErrors({});
      toast("KYC submitted. Status: Pending.");

      await loadKyc();
    } catch (err) {
      toast(err.message || "Could not submit KYC. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileSection title="PAN & Aadhaar KYC" icon={FileCheck}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Identity verification
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Enter your PAN and Aadhaar numbers and upload clear images
              of both cards. Documents are stored privately and can be
              viewed only by you and authorized AtoZ Broking
              administrators.
            </p>
          </div>

          <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">
            Loading KYC status...
          </p>
        )}

        {!loading && loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{loadError}</p>

            <div className="mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setLoading(true);
                  loadKyc();
                }}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {!loading && !loadError && kyc && (
          <>
            {statusKey !== "not_submitted" && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  {statusKey === "approved" ? (
                    <ShieldCheck size={19} className="text-green-600" />
                  ) : statusKey === "rejected" ? (
                    <IdCard size={19} className="text-red-600" />
                  ) : (
                    <Clock size={19} className="text-amber-600" />
                  )}

                  <p className="text-sm font-semibold text-slate-800">
                    KYC submission status
                  </p>
                </div>

                <InfoGrid
                  items={[
                    ["Review status", statusInfo.label],
                    ["PAN", kyc.kycPanMasked || "-"],
                    [
                      "Aadhaar",
                      kyc.kycAadhaarLast4
                        ? `XXXX-XXXX-${kyc.kycAadhaarLast4}`
                        : "-",
                    ],
                    ["Submitted on", formatDate(kyc.kycSubmittedAt)],
                    ["Reviewed on", formatDate(kyc.kycReviewedAt)],
                  ]}
                />

                {statusKey === "pending" && (
                  <p className="mt-3 text-xs text-slate-500">
                    Your documents are awaiting admin review.
                  </p>
                )}

                {statusKey === "approved" && (
                  <p className="mt-3 text-sm text-green-700">
                    Your KYC has been approved.
                  </p>
                )}

                {statusKey === "rejected" && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-medium">
                      Your KYC was rejected.
                    </p>

                    {kyc.kycRejectionReason && (
                      <p className="mt-1">
                        Reason: {kyc.kycRejectionReason}
                      </p>
                    )}

                    <p className="mt-1 text-xs">
                      Please enter your numbers again, replace the
                      image(s) if needed, and submit again.
                    </p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4" noValidate>
              {canEdit && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Input
                      id="kyc-pan-number"
                      label="PAN number"
                      value={panNumber}
                      placeholder="ABCDE1234F"
                      autoComplete="off"
                      error={errors.panNumber}
                      onChange={(e) => {
                        setPanNumber(
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 10)
                        );

                        setErrors((prev) => ({
                          ...prev,
                          panNumber: "",
                        }));
                      }}
                    />

                    <p className="mt-1 text-xs text-slate-500">
                      Only a masked PAN is saved.
                    </p>
                  </div>

                  <div>
                    <Input
                      id="kyc-aadhaar-number"
                      label="Aadhaar number"
                      type="password"
                      value={aadhaarNumber}
                      placeholder="12-digit Aadhaar"
                      autoComplete="off"
                      error={errors.aadhaarNumber}
                      onChange={(e) => {
                        setAadhaarNumber(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 12)
                        );

                        setErrors((prev) => ({
                          ...prev,
                          aadhaarNumber: "",
                        }));
                      }}
                    />

                    <p className="mt-1 text-xs text-slate-500">
                      Hidden while typing. Only the last 4 digits are saved.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <KycDocumentField
                  id="kyc-pan-file"
                  label="PAN Card"
                  file={files.pan}
                  serverUrl={panUrl}
                  uploaded={panUploaded}
                  error={errors.pan}
                  locked={!canEdit}
                  disabled={submitting}
                  onSelect={selectFile("pan")}
                />

                <KycDocumentField
                  id="kyc-aadhaar-file"
                  label="Aadhaar Card"
                  file={files.aadhaar}
                  serverUrl={aadhaarUrl}
                  uploaded={aadhaarUploaded}
                  error={errors.aadhaar}
                  locked={!canEdit}
                  disabled={submitting}
                  onSelect={selectFile("aadhaar")}
                />
              </div>

              {canEdit && (
                <>
                  <p className="text-xs text-slate-500">
                    Allowed: JPG, PNG or WEBP, up to 2 MB each.
                  </p>

                  <Button type="submit" block disabled={submitting}>
                    <FileCheck size={16} />
                    {submitting
                      ? "Submitting..."
                      : statusKey === "rejected"
                        ? "Submit KYC Again"
                        : "Submit for Review"}
                  </Button>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </ProfileSection>
  );
}

// --------------------------------------------------
// Main Profile View
// --------------------------------------------------
function ProfileView({ u }) {
  const toast = useToast();

  const [twoFa, setTwoFa] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const photoKey = u?.clientId
    ? `a2z_profile_photo_${u.clientId}`
    : null;

  const [photo, setPhoto] = useState(() => {
    if (!u?.clientId) return "";

    return (
      localStorage.getItem(
        `a2z_profile_photo_${u.clientId}`
      ) || ""
    );
  });

  const fullName = u?.fullName || "User";

  // Display A2Z client IDs as ATOZ without changing the backend ID.
  const displayClientId = u?.clientId
    ? u.clientId.replace(/^A2Z/i, "ATOZ")
    : "-";

  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please select an image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast("Image should be smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    if (!photoKey) {
      toast("Client ID not available.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const image = reader.result;

        localStorage.setItem(photoKey, image);
        setPhoto(image);

        window.dispatchEvent(
          new Event("a2z-profile-photo-updated")
        );

        toast("Profile photo updated.");
      } catch {
        toast("Could not save photo. Try a smaller image.");
      }
    };

    reader.onerror = () => {
      toast("Could not read this image.");
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-xl font-semibold text-white">
                {initials}
              </span>
            )}

            <label
              htmlFor="profile-photo"
              className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white shadow ring-1 ring-slate-200"
              title="Change profile photo"
            >
              <Camera size={14} />
            </label>

            <input
              id="profile-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{fullName}</h2>

            <p className="text-sm text-slate-500">
              Client ID: {displayClientId}
            </p>

            <div className="mt-1">
              <Badge tone="green">
                {u?.status || "Active"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal and account information */}
      <div className="grid gap-5 lg:grid-cols-2">
        <PersonalInfoSection u={u} />

        <ProfileSection
          title="Account Information"
          icon={UserCheck}
        >
          <InfoGrid
            items={[
              ["Client ID", displayClientId],
              ["Account status", u?.status || "Active"],
              [
                "Registered on",
                u?.createdAt
                  ? new Date(u.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "-",
              ],
            ]}
          />
        </ProfileSection>

        {/* Bank Information (backend connected) */}
        <BankInformationSection u={u} />

        {/* Security */}
        <ProfileSection
          title="Security"
          icon={ShieldCheck}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Password</p>

                <p className="text-xs text-slate-500">
                  Use a strong password you don't use elsewhere.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setPwOpen(true)}
              >
                <Lock size={14} />
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  Two-factor authentication
                </p>

                <p className="text-xs text-slate-500">
                  {twoFa
                    ? "Enabled via SMS OTP."
                    : "Add an extra layer of security."}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={twoFa}
                aria-label="Two-factor authentication"
                onClick={() => {
                  setTwoFa(!twoFa);

                  toast(
                    `Two-factor authentication ${
                      twoFa ? "disabled" : "enabled"
                    } (demo).`
                  );
                }}
                className={cx(
                  "relative h-6 w-11 shrink-0 rounded-full transition",
                  twoFa ? "bg-green-600" : "bg-slate-300"
                )}
              >
                <span
                  className={cx(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                    twoFa ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </ProfileSection>
      </div>

      {/* PAN & Aadhaar KYC */}
      <KycSection />

      <PasswordModal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
      />
    </div>
  );
}

export default function Profile() {
  const state = useAsync(getUser);

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Manage your personal, account, security and KYC details."
      />

      <Async state={state}>
        {(u) => <ProfileView u={u} />}
      </Async>
    </>
  );
}