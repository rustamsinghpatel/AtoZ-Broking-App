
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ArrowLeftRight,
  Bell,
  Briefcase,
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  PieChart,
  Search,
  User,
  Wallet,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

import { cx, Button, Modal } from "../common";
import useAsync from "../../hooks/useAsync";
import { getNotifications, getUser } from "../../services/api";

// Green ATOZ logo — matching the Landing page
function BrandMark({ size = "normal" }) {
  const small = size === "small";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-green-700 font-bold text-white shadow-sm ${
        small ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm"
      }`}
    >
      ATOZ
    </div>
  );
}

// Reusable logo for Login and other pages
export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />

      <div>
        <p className="text-lg font-bold tracking-tight text-slate-900">
          A TO Z <span className="text-green-600">Broking</span>
        </p>
        <p className="text-xs text-slate-500">
          Client Investment Portal
        </p>
      </div>
    </div>
  );
}

// Profile photo — reads the existing Profile page localStorage key
function ProfileAvatar({ user, size = "normal" }) {
  const clientId = user?.clientId;
  const [photo, setPhoto] = useState("");

  const dimensions =
    size === "large"
      ? "h-14 w-14 text-xl"
      : size === "small"
        ? "h-9 w-9 text-sm"
        : "h-10 w-10 text-base";

  useEffect(() => {
    const loadPhoto = () => {
      if (!clientId) {
        setPhoto("");
        return;
      }

      try {
        const savedPhoto = localStorage.getItem(
          `a2z_profile_photo_${clientId}`
        );
        setPhoto(savedPhoto || "");
      } catch {
        setPhoto("");
      }
    };

    loadPhoto();

    window.addEventListener("a2z-profile-photo-updated", loadPhoto);
    window.addEventListener("storage", loadPhoto);

    return () => {
      window.removeEventListener("a2z-profile-photo-updated", loadPhoto);
      window.removeEventListener("storage", loadPhoto);
    };
  }, [clientId]);

  const initial = (user?.name || "Client").charAt(0).toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 font-semibold text-green-800 ring-1 ring-green-200 ${dimensions}`}
    >
      {photo ? (
        <img
          src={photo}
          alt={`${user?.name || "Client"} profile`}
          className="h-full w-full rounded-full object-cover"
          onError={() => setPhoto("")}
        />
      ) : (
        initial
      )}
    </div>
  );
}

// Main navigation links
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/holdings", label: "Holdings", icon: Briefcase },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

// Desktop sidebar
export function Sidebar({ onLogout }) {
  const location = useLocation();
  const { data: user } = useAsync(getUser);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <BrandMark size="small" />

        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            A TO Z <span className="text-green-600">Broking</span>
          </h1>
          <p className="text-xs text-slate-500">Client Portal</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active =
              location.pathname === to ||
              location.pathname.startsWith(`${to}/`);

            return (
              <NavLink
                key={to}
                to={to}
                className={cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-green-50 text-green-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <p className="mb-3 mt-7 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Account
        </p>

        <nav className="space-y-1">
          <NavLink
            to="/funds"
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50"
              )
            }
          >
            <Wallet size={19} />
            <span>Funds Overview</span>
          </NavLink>

          <NavLink
            to="/deposit"
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50"
              )
            }
          >
            <PlusCircle size={19} />
            <span>Deposit</span>
          </NavLink>

          <NavLink
            to="/withdrawal"
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50"
              )
            }
          >
            <MinusCircle size={19} />
            <span>Withdrawal</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50"
              )
            }
          >
            <User size={19} />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <ProfileAvatar user={user} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name || "Client"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.clientId || user?.email || "Client Account"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// Top header
export function TopHeader({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { data: user } = useAsync(getUser);
  const { data: notifications } = useAsync(getNotifications);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((item) => !item.read).length
    : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3 lg:hidden">
          <BrandMark size="small" />
          <span className="font-bold text-slate-900">
            A TO Z <span className="text-green-600">Broking</span>
          </span>
        </div>

        <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:flex lg:ml-0">
          <Search size={17} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <NavLink
            to="/notifications"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Bell size={21} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </NavLink>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
              aria-expanded={menuOpen}
              aria-label="Open account menu"
            >
              <ProfileAvatar user={user} size="small" />

              <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 sm:block">
                {user?.name || "Client"}
              </span>

              <ChevronDown size={16} className="text-slate-500" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close account menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />

                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {user?.name || "Client"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email || user?.clientId || ""}
                    </p>
                  </div>

                  <NavLink
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User size={17} />
                    <span>My Profile</span>
                  </NavLink>

                  <NavLink
                    to="/funds"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Wallet size={17} />
                    <span>Funds</span>
                  </NavLink>

                  <NavLink
                    to="/deposit"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <PlusCircle size={17} />
                    <span>Deposit</span>
                  </NavLink>

                  <NavLink
                    to="/withdrawal"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <MinusCircle size={17} />
                    <span>Withdrawal</span>
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Mobile bottom navigation
export function MobileBottomNav({ onLogout }) {
  const [more, setMore] = useState(false);

  const main = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/portfolio", label: "Portfolio", icon: PieChart },
    { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  ];

  const extra = [
    ...NAV_ITEMS.filter((item) =>
      ["/holdings", "/reports", "/notifications"].includes(item.to)
    ),
    { to: "/funds", label: "Funds", icon: Wallet },
    { to: "/deposit", label: "Deposit", icon: PlusCircle },
    { to: "/withdrawal", label: "Withdrawal", icon: MinusCircle },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white lg:hidden">
        <div className="grid grid-cols-4">
          {main.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cx(
                  "flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors",
                  isActive
                    ? "text-green-700"
                    : "text-slate-500 hover:text-slate-800"
                )
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setMore(true)}
            className="flex flex-col items-center justify-center gap-1 py-3 text-xs text-slate-500 hover:text-slate-800"
          >
            <MoreHorizontal size={20} />
            <span>More</span>
          </button>
        </div>
      </nav>

      <Modal
        open={more}
        onClose={() => setMore(false)}
        title="More Options"
      >
        <div className="space-y-1">
          {extra.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMore(false)}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-green-50 font-medium text-green-700"
                    : "text-slate-600 hover:bg-slate-50"
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => {
              setMore(false);
              onLogout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </Modal>
    </>
  );
}

// Logout confirmation modal
export function LogoutModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Logout">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Are you sure you want to log out of your AtoZ Broking account?
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={onConfirm}>
            <LogOut size={16} className="mr-2 inline" />
            Logout
          </Button>
        </div>
      </div>
    </Modal>
  );
}
