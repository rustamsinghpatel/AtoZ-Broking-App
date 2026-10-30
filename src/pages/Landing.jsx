
import { Link } from "react-router-dom";

import { Logo } from "../components/Logo";

import Footer from "../components/layout/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">
          <Logo to="/" size="responsive" subtitle={null} />

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#home" className="text-sm font-medium text-slate-600 transition hover:text-green-600">
              Home
            </a>

            <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-green-600">
              About
            </a>

            <a href="#services" className="text-sm font-medium text-slate-600 transition hover:text-green-600">
              Services
            </a>

            <a href="#support" className="text-sm font-medium text-slate-600 transition hover:text-green-600">
              Support
            </a>

            <Link to="/login" className="text-sm font-semibold text-slate-700 transition hover:text-green-600">
              Login
            </Link>

            <Link to="/signup" className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">
              Sign Up
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex shrink-0 items-center gap-1.5 md:hidden">
            <Link
              to="/login"
              className="whitespace-nowrap rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-700 sm:px-3 sm:text-sm"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="whitespace-nowrap rounded-lg bg-green-600 px-2.5 py-2 text-xs font-semibold text-white sm:px-3 sm:text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main id="home">
        {/* HERO */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-green-600">
              Smart Investing Made Simple
            </p>

            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
              Invest Smarter.
              <br />
              Grow With Confidence.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              A to Z Broking provides a simple and secure platform to manage
              your investments, track your portfolio and stay in control of
              your financial journey.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700">
                Get Started
              </Link>

              <Link to="/login" className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-green-600 hover:text-green-600">
                Login
              </Link>
            </div>
          </div>

          {/* Portfolio Preview */}
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Portfolio Value</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  ₹0
                </p>
              </div>

              <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                0%
              </div>
            </div>

            <div className="flex h-48 items-end gap-3">
              {[35, 50, 42, 65, 55, 75, 68, 90, 82, 100].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md bg-green-500 transition hover:bg-green-600"
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Invested</p>
                <p className="mt-1 font-bold text-slate-900">₹0</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Returns</p>
                <p className="mt-1 font-bold text-green-600">₹0</p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-green-600">
              About Us
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Your Financial Journey, Simplified
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              A To Z Broking is designed to make investment management simple,
              transparent and convenient. Track your holdings, monitor your
              portfolio and manage your financial information from one place.
            </p>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-green-600">
                Our Services
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                Everything You Need in One Place
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
                Manage your investments, monitor your portfolio and access
                important financial information through one simple platform.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-xl">
                  📊
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Portfolio Tracking
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Keep track of your investments and portfolio performance
                  from a single dashboard.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-xl">
                  💼
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Holdings Management
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  View and manage your investment holdings with an easy-to-use
                  interface.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-xl">
                  📈
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Reports &amp; Insights
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Access useful reports and information to better understand
                  your investment activity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORT */}
        <section id="support" className="border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-green-600">
                Support
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                Need Help? We’re Here for You
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
                If you have questions about your account, portfolio or
                platform, our support team is here to help.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {/* Phone */}
              <div className="rounded-xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                  📞
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Phone Support
                </h3>

                <a
                  href="tel:+918989712384"
                  className="mt-2 inline-block text-slate-600 transition hover:text-green-600"
                >
                  +91 89897 12384
                </a>
              </div>

              {/* Email */}
              <div className="rounded-xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                  ✉️
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Email Support
                </h3>

                <p className="mt-2 text-slate-600">
                  support@atozbroking.com
                </p>
              </div>

              {/* Support Hours */}
              <div className="rounded-xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                  🕐
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Support Hours
                </h3>

                <p className="mt-2 text-slate-600">
                  Mon – Sat
                  <br />
                  9:00 AM – 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="bg-green-600 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center text-white">
            <h2 className="text-3xl font-bold md:text-4xl">
              Ready to Get Started?
            </h2>

            <p className="mt-4 text-green-50">
              Create your account and start managing your investment journey.
            </p>

            <Link to="/signup" className="mt-7 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-green-700 shadow-sm transition hover:bg-green-50">
              Create Account
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
