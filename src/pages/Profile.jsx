import { useState } from "react";

import {
  Camera,
  Landmark,
  Lock,
  ShieldCheck,
  User,
  UserCheck,
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
    setF({
      current: "",
      next: "",
      confirm: "",
    });

    setErr({});
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();

    const n = {};

    if (!f.current) {
      n.current = "Enter your current password.";
    }

    if (f.next.length < 6) {
      n.next = "New password must be at least 6 characters.";
    }

    if (f.confirm !== f.next) {
      n.confirm = "Passwords do not match.";
    }

    setErr(n);

    if (Object.keys(n).length) return;

    close();
    toast("Password updated (demo).");
  };

  const field = (k, label) => (
    <Input
      id={`pw-${k}`}
      label={label}
      type="password"
      value={f[k]}
      error={err[k]}
      onChange={(e) =>
        setF({
          ...f,
          [k]: e.target.value,
        })
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

          <Button type="submit">
            Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ProfileView({ u }) {
  const toast = useToast();

  const [twoFa, setTwoFa] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  /*
    IMPORTANT:
    Profile photo is now stored separately for every client.
    
    Example:
    a2z_profile_photo_A2Z1001
    a2z_profile_photo_A2Z1002
  */
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

  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please select an image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast("Image should be smaller than 2 MB.");
      return;
    }

    if (!photoKey) {
      toast("Client ID not available.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;

      /*
        Save photo using the logged-in user's Client ID.
      */
      localStorage.setItem(photoKey, image);

      /*
        Update Profile page immediately.
      */
      setPhoto(image);

      /*
        Tell Sidebar and TopHeader
        that the profile photo has changed.
      */
      window.dispatchEvent(
        new Event("a2z-profile-photo-updated")
      );

      toast("Profile photo updated.");
    };

    reader.readAsDataURL(file);

    /*
      Allows selecting the same image again later.
    */
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
              Client ID: {u?.clientId || "-"}
            </p>

            <div className="mt-1">
              <Badge tone="green">
                {u?.status || "Active"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Information */}
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
              ["Client ID", u?.clientId || "-"],
              ["Account status", u?.status || "Active"],
              [
                "Registered on",
                u?.createdAt
                  ? new Date(
                      u.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
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
              [
                "Account number",
                u?.bank?.account || "-",
              ],
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
                role="switch"
                aria-checked={twoFa}
                aria-label="Two-factor authentication"
                onClick={() => {
                  setTwoFa(!twoFa);

                  toast(
                    `Two-factor authentication ${
                      twoFa
                        ? "disabled"
                        : "enabled"
                    } (demo).`
                  );
                }}
                className={cx(
                  "relative h-6 w-11 shrink-0 rounded-full transition",
                  twoFa
                    ? "bg-green-600"
                    : "bg-slate-300"
                )}
              >
                <span
                  className={cx(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                    twoFa
                      ? "left-[22px]"
                      : "left-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </ProfileSection>
      </div>

      {/* Login Activity */}
      <Card>
        <h2 className="mb-3 font-semibold">
          Login Activity
        </h2>

        <div className="py-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">
                Current browser
              </p>

              <p className="text-xs text-slate-500">
                Web application
              </p>
            </div>

            <Badge tone="green">
              This device
            </Badge>
          </div>
        </div>
      </Card>

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
        subtitle="Manage your personal, account and security details."
      />

      <Async state={state}>
        {(u) => <ProfileView u={u} />}
      </Async>
    </>
  );
}