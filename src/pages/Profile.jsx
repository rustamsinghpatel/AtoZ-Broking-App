
import { useState } from "react";

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
import { getUser } from "../services/api";

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

function KycSection({ clientId }) {
  const toast = useToast();

  const kycKey = clientId
    ? `a2z_kyc_demo_${clientId}`
    : null;

  const [kyc, setKyc] = useState(() => {
    if (!clientId) return null;

    try {
      const saved = localStorage.getItem(
        `a2z_kyc_demo_${clientId}`
      );

      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [errors, setErrors] = useState({});

  const status = kyc?.status || "Not Submitted";

  const statusTone =
    status === "Approved"
      ? "green"
      : status === "Rejected"
        ? "red"
        : "yellow";

  const submitKyc = (e) => {
    e.preventDefault();

    const nextErrors = {};
    const cleanPan = pan.trim().toUpperCase();
    const cleanAadhaar = aadhaar.replace(/\s/g, "");

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
      nextErrors.pan =
        "Enter a valid PAN format, e.g. ABCDE1234F.";
    }

    if (!/^[0-9]{12}$/.test(cleanAadhaar)) {
      nextErrors.aadhaar =
        "Enter a 12-digit Aadhaar number.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    if (!kycKey) {
      toast("Client ID is not available.");
      return;
    }

    /*
      Demo only:
      Save masked identifiers and status, not full ID numbers.
      This localStorage record is not sent to the admin.
    */
    const record = {
      panMasked:
        `${cleanPan.slice(0, 2)}******${cleanPan.slice(-2)}`,
      aadhaarLast4: cleanAadhaar.slice(-4),
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(kycKey, JSON.stringify(record));
      setKyc(record);
      setPan("");
      setAadhaar("");
      setErrors({});
      toast("KYC demo submitted. Status: Pending.");
    } catch {
      toast("Could not save KYC demo. Please try again.");
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
              Submit your details for review. Admin approval
              will be connected to the backend in the next phase.
            </p>
          </div>

          <Badge tone={statusTone}>{status}</Badge>
        </div>

        {kyc && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              {status === "Approved" ? (
                <ShieldCheck
                  size={19}
                  className="text-green-600"
                />
              ) : status === "Rejected" ? (
                <IdCard
                  size={19}
                  className="text-red-600"
                />
              ) : (
                <Clock
                  size={19}
                  className="text-amber-600"
                />
              )}

              <p className="text-sm font-semibold text-slate-800">
                KYC submission status
              </p>
            </div>

            <InfoGrid
              items={[
                ["PAN", kyc.panMasked || "Submitted"],
                [
                  "Aadhaar",
                  kyc.aadhaarLast4
                    ? `XXXX-XXXX-${kyc.aadhaarLast4}`
                    : "Submitted",
                ],
                [
                  "Submitted on",
                  kyc.submittedAt
                    ? new Date(
                        kyc.submittedAt
                      ).toLocaleDateString("en-IN")
                    : "-",
                ],
                ["Review status", status],
              ]}
            />

            {status === "Pending" && (
              <p className="mt-3 text-xs text-slate-500">
                Your demo submission is awaiting review.
              </p>
            )}
          </div>
        )}

        {status !== "Approved" && (
          <form
            onSubmit={submitKyc}
            className="space-y-4"
            noValidate
          >
            <div>
              <label
                htmlFor="kyc-pan"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                PAN number
              </label>

              <Input
                id="kyc-pan"
                value={pan}
                placeholder="ABCDE1234F"
                onChange={(e) => {
                  setPan(e.target.value.toUpperCase());
                  setErrors((prev) => ({
                    ...prev,
                    pan: "",
                  }));
                }}
                error={errors.pan}
                maxLength={10}
                autoComplete="off"
              />

              <p className="mt-1 text-xs text-slate-500">
                Enter the PAN format printed on your card.
              </p>
            </div>

            <div>
              <label
                htmlFor="kyc-aadhaar"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Aadhaar number
              </label>

              <Input
                id="kyc-aadhaar"
                type="password"
                value={aadhaar}
                placeholder="Enter 12-digit Aadhaar"
                onChange={(e) => {
                  setAadhaar(
                    e.target.value.replace(/\D/g, "").slice(0, 12)
                  );

                  setErrors((prev) => ({
                    ...prev,
                    aadhaar: "",
                  }));
                }}
                error={errors.aadhaar}
                maxLength={12}
                autoComplete="off"
              />

              <p className="mt-1 text-xs text-slate-500">
                Your number is hidden while typing.
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              Demo mode: only masked PAN details, the last four
              Aadhaar digits and the status are saved in this
              browser. No document is uploaded, and the admin
              cannot see or approve this demo submission yet.
              Do not enter real identity details until secure
              backend storage is implemented.
            </div>

            <Button type="submit" block>
              <FileCheck size={16} />
              {kyc ? "Submit KYC Again" : "Submit for Review"}
            </Button>
          </form>
        )}

        {status === "Approved" && (
          <p className="text-sm text-green-700">
            Your KYC is marked approved.
          </p>
        )}
      </div>
    </ProfileSection>
  );
}

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
            <h2 className="text-lg font-semibold">
              {fullName}
            </h2>

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
        <ProfileSection
          title="Personal Information"
          icon={User}
        >
          <InfoGrid
            items={[
              ["Full name", u?.fullName || "-"],
              ["Email", u?.email || "-"],
              ["Mobile", u?.mobile || "-"],
            ]}
          />
        </ProfileSection>

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

        <ProfileSection
          title="Bank Information"
          icon={Landmark}
        >
          <InfoGrid
            items={[
              ["Bank name", u?.bank?.name || "-"],
              ["Account number", u?.bank?.account || "-"],
              ["IFSC", u?.bank?.ifsc || "-"],
            ]}
          />
        </ProfileSection>

        {/* Security */}
        <ProfileSection
          title="Security"
          icon={ShieldCheck}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  Password
                </p>

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

      {/* KYC replaces Login Activity */}
      <KycSection clientId={u?.clientId} />

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
