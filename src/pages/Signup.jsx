import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { Button, Input } from "../components/common";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm({
      ...form,
      [key]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    const next = {};

    // Validation
    if (!form.fullName.trim()) {
      next.fullName = "Please enter your full name.";
    }

    if (!form.email.trim()) {
      next.email = "Please enter your email.";
    }

    if (!form.mobile.trim()) {
      next.mobile = "Please enter your mobile number.";
    }

    if (!form.password) {
      next.password = "Please enter a password.";
    } else if (form.password.length < 4) {
      next.password = "Password must be at least 4 characters.";
    }

    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);

    if (Object.keys(next).length) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      // Check backend response in browser console
      console.log("REGISTER RESPONSE:", result);

      if (!response.ok) {
        setErrors({
          form: result.message || "Registration failed.",
        });

        setLoading(false);
        return;
      }

      setLoading(false);

      // Safely get Client ID
      const clientId = result?.data?.user?.clientId;

      if (clientId) {
        alert(
          `Account created successfully!\n\nYour Client ID is: ${clientId}`
        );
      } else {
        alert(
          "Account created successfully!\n\nClient ID was not received from the server."
        );
      }

      // Go to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);

      setLoading(false);

      setErrors({
        form: "Unable to connect to server.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-sm font-bold text-white">
            A2Z
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Create your account
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Register for your A2Z Broking client portal.
          </p>
        </div>

        {/* Server Error */}
        {errors.form && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {errors.form}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={submit} noValidate className="space-y-4">
          {/* Full Name */}
          <Input
            id="fullName"
            label="Full Name"
            icon={User}
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={set("fullName")}
            error={errors.fullName}
          />

          {/* Email */}
          <Input
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
          />

          {/* Mobile */}
          <Input
            id="mobile"
            label="Mobile Number"
            icon={Phone}
            placeholder="Enter your mobile number"
            value={form.mobile}
            onChange={set("mobile")}
            error={errors.mobile}
          />

          {/* Password */}
          <Input
            id="password"
            label="Password"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            right={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="rounded p-1.5 text-slate-500 hover:text-slate-800"
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            }
          />

          {/* Confirm Password */}
          <Input
            id="confirmPassword"
            label="Confirm Password"
            icon={Lock}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            error={errors.confirmPassword}
            right={
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="rounded p-1.5 text-slate-500 hover:text-slate-800"
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            }
          />

          {/* Submit */}
          <Button
            type="submit"
            loading={loading}
            className="w-full !py-3"
          >
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-green-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}