
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">

            {/* Logo Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 font-bold text-white shadow-sm">
              ATOZ
            </div>

            {/* Brand Name */}
            <div className="text-xl font-bold tracking-tight text-slate-900">
              A TO Z <span className="text-green-600">Broking</span>
            </div>

          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 md:flex">

            <a
              href="#home"
              className="text-sm font-medium text-slate-600 transition hover:text-green-600"
            >
              Home
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-green-600"
            >
              About
            </a>

            <a
              href="#services"
              className="text-sm font-medium text-slate-600 transition hover:text-green-600"
            >
              Services
            </a>

            <a
              href="#support"
              className="text-sm font-medium text-slate-600 transition hover:text-green-600"
            >
              Support
            </a>

            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 transition hover:text-green-600"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Sign Up
            </Link>

          </nav>

          {/* Mobile Buttons */}
          <div className="flex items-center gap-2 md:hidden">

            <Link
              to="/login"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Sign Up
            </Link>

          </div>

        </div>

      </header>


      {/* ================= HERO ================= */}
      <main id="home">

        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">

          {/* Hero Content */}
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

              <Link
                to="/signup"
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                Get Started
              </Link>

              <Link
                to="/login"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-green-600 hover:text-green-600"
              >
                Login
              </Link>

            </div>

          </div>


          {/* Hero Dashboard Preview */}
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Portfolio Value
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  ₹12,45,000
                </p>
              </div>

              <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                +12.5%
              </div>

            </div>


            {/* Demo Chart */}
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


            {/* Portfolio Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Invested
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  ₹11,08,000
                </p>
              </div>


              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Returns
                </p>

                <p className="mt-1 font-bold text-green-600">
                  ₹1,37,000
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* ================= ABOUT ================= */}
        <section
          id="about"
          className="border-y border-slate-200 bg-white py-20"
        >

          <div className="mx-auto max-w-4xl px-6 text-center">

            <p className="text-sm font-bold uppercase tracking-wider text-green-600">
              About Us
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Your Financial Journey, Simplified
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              A TO Z Broking is designed to make investment management simple,
              transparent and convenient. Track your holdings, monitor your
              portfolio and manage your financial information from one place.
            </p>

          </div>

        </section>


        {/* ================= SERVICES ================= */}
        <section
          id="services"
          className="py-20"
        >

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

              {/* Service 1 */}
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


              {/* Service 2 */}
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


              {/* Service 3 */}
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">

                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-xl">
                  📈
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Reports & Insights
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Access useful reports and information to better understand
                  your investment activity.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ================= SUPPORT ================= */}
        <section
          id="support"
          className="border-y border-slate-200 bg-white py-20"
        >

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

                <p className="mt-2 text-slate-600">
                  +91 00000 00000
                </p>

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


              {/* Hours */}
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


            <p className="mt-6 text-center text-xs text-slate-400">
              Demo contact details — client support information can be
              updated before production.
            </p>

          </div>

        </section>


        {/* ================= CTA ================= */}
        <section className="bg-green-600 py-16">

          <div className="mx-auto max-w-4xl px-6 text-center text-white">

            <h2 className="text-3xl font-bold md:text-4xl">
              Ready to Get Started?
            </h2>

            <p className="mt-4 text-green-50">
              Create your account and start managing your investment journey.
            </p>

            <Link
              to="/signup"
              className="mt-7 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
            >
              Create Account
            </Link>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-300">

        <div className="mx-auto max-w-7xl px-6 py-14">

          <div className="grid gap-10 md:grid-cols-4">

            {/* Brand */}
            <div className="md:col-span-2">

              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 font-bold text-white">
                  ATOZ
                </div>

                <div className="text-xl font-bold text-white">
                  A TO Z <span className="text-green-500">Broking</span>
                </div>

              </Link>

              <p className="mt-5 max-w-md leading-7 text-slate-400">
                A simple platform designed to help you manage your
                investments, track your portfolio and stay informed about
                your financial journey.
              </p>

            </div>


            {/* Quick Links */}
            <div>

              <h3 className="font-semibold text-white">
                Quick Links
              </h3>

              <ul className="mt-4 space-y-3 text-sm">

                <li>
                  <a
                    href="#home"
                    className="transition hover:text-green-500"
                  >
                    Home
                  </a>
                </li>

                <li>
                  <a
                    href="#about"
                    className="transition hover:text-green-500"
                  >
                    About
                  </a>
                </li>

                <li>
                  <a
                    href="#services"
                    className="transition hover:text-green-500"
                  >
                    Services
                  </a>
                </li>

                <li>
                  <a
                    href="#support"
                    className="transition hover:text-green-500"
                  >
                    Support
                  </a>
                </li>

              </ul>

            </div>


            {/* Account */}
            <div>

              <h3 className="font-semibold text-white">
                Account
              </h3>

              <ul className="mt-4 space-y-3 text-sm">

                <li>
                  <Link
                    to="/login"
                    className="transition hover:text-green-500"
                  >
                    Login
                  </Link>
                </li>

                <li>
                  <Link
                    to="/signup"
                    className="transition hover:text-green-500"
                  >
                    Create Account
                  </Link>
                </li>

              </ul>

            </div>

          </div>


          {/* Bottom Footer */}
          <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

            <p>
              © {new Date().getFullYear()} A TO Z Broking. All rights reserved.
            </p>

            <div className="flex gap-6">

              <a
                href="#"
                className="transition hover:text-green-500"
              >
                Privacy Policy
              </a>

              <a
                href="#"
                className="transition hover:text-green-500"
              >
                Terms & Conditions
              </a>

            </div>

          </div>

        </div>

      </footer>

    </div>
  )
}
