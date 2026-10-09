
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";
import { Button, Input } from "../components/common";
import { Logo } from "../components/layout/Nav";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    clientId: "",
    password: "",
    remember: true,
  });

  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm({
      ...form,
      [key]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    const next = {};

    if (!form.clientId.trim()) {
      next.clientId =
        "Please enter your Client ID, mobile or email.";
    }

    if (!form.password) {
      next.password = "Please enter your password or PIN.";
    } else if (form.password.length < 4) {
      next.password = "Password must be at least 4 characters.";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) return;

    setLoading(true);

    try {
      const res = await login(
        form.clientId.trim(),
        form.password,
        form.remember
      );

      if (res.ok) {
        // Backend se aane wale actual role ke hisaab se redirect.
        const role = res.user?.role;

        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        setErrors({
          form: res.error || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      setErrors({
        form: "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT SIDE — INTRO */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-green-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-green-700 shadow-lg">
              A2Z
            </span>
            <div>
              <p className="text-lg font-semibold">A2Z Broking</p>
              <p className="text-xs text-green-200">
                Client Investment Portal
              </p>
            </div>
          </div>

          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-green-50">
            Secure Portal
          </div>
        </div>

        <div className="relative z-10 my-10">
          <p className="mb-3 text-sm font-medium text-green-200">
            YOUR INVESTMENTS. YOUR CONTROL.
          </p>

          <h2 className="max-w-lg text-4xl font-semibold leading-tight xl:text-5xl">
            Manage your investments with confidence.
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-6 text-green-100">
            Track your portfolio, monitor performance,
            access reports and manage your investment
            account from one secure place.
          </p>

          <div className="mt-8 max-w-md rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-200">
                  Portfolio Value
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  ₹9,21,500
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="mt-5 flex items-end gap-1">
              {[35, 48, 42, 58, 52, 70, 64, 82, 76, 92].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-sm bg-white/50"
                    style={{ height: `${height}px` }}
                  />
                )
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-green-200">Total Returns</span>
              <span className="font-semibold text-white">+8.41%</span>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs text-green-50">
              <CheckCircle2 size={16} className="shrink-0 text-green-200" />
              Portfolio tracking
            </div>

            <div className="flex items-center gap-2 text-xs text-green-50">
              <CheckCircle2 size={16} className="shrink-0 text-green-200" />
              Secure reports
            </div>

            <div className="flex items-center gap-2 text-xs text-green-50">
              <CheckCircle2 size={16} className="shrink-0 text-green-200" />
              Easy support
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-xs text-green-100">
            <ShieldCheck size={15} />
            Secure client access
          </div>

          <div className="flex items-center gap-2 text-xs text-green-200">
            <Headphones size={15} />
            Relationship support
          </div>
        </div>

        <p className="relative z-10 mt-4 text-[10px] leading-4 text-green-300">
          Investments are subject to market risks. Read all
          scheme related documents carefully.
        </p>
      </div>

      {/* RIGHT SIDE — LOGIN FORM */}
      <div className="flex items-center justify-center bg-white px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-green-700">
              SECURE LOGIN
            </p>

            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to your A2Z Broking account to view and
              manage your portal.
            </p>
          </div>

          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            {errors.form && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {errors.form}
              </div>
            )}

            <Input
              id="clientId"
              label="Client ID / Mobile / Email"
              icon={User}
              autoComplete="username"
              placeholder="Enter your Client ID or email"
              value={form.clientId}
              onChange={set("clientId")}
              error={errors.clientId}
            />

            <Input
              id="password"
              label="Password / PIN"
              icon={Lock}
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              right={
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="rounded p-1.5 text-slate-500 hover:text-slate-800"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={set("remember")}
                  className="h-4 w-4 rounded border-slate-300 accent-green-600"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() =>
                  setErrors({
                    form: "Password reset is not available yet. Contact support.",
                  })
                }
                className="font-medium text-green-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full !py-3">
              {loading ? "Signing in…" : "Login"}
            </Button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-600">
              Don't have a client account?
            </p>

            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="mt-2 inline-flex items-center gap-1.5 font-semibold text-green-700 hover:text-green-800 hover:underline"
            >
              Create your account
              <ArrowUpRight size={15} />
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Need help? Contact A2Z Broking support.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={13} />
            Your account information is protected.
          </div>
        </div>
      </div>
    </div>
  );
}