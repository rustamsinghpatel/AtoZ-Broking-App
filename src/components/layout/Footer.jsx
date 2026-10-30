import { Link } from "react-router-dom";
import { Clock, Mail, Phone } from "lucide-react";

import { Logo } from "../Logo";

// Public website footer. Every link and contact detail here already exists
// elsewhere on the site (landing page sections, /login, /signup, /terms and
// the support details in the Support section) - nothing is invented.
// "/#about" style links also work from other pages (they go to the landing page).

const QUICK_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Support", href: "/#support" },
];

const linkClass = "transition hover:text-green-400";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Logo to="/" size="lg" dark subtitle={null} />

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              A simple platform designed to help you manage your investments,
              track your portfolio and stay informed about your financial
              journey.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links" className="lg:col-span-2">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account */}
          <nav aria-label="Account" className="lg:col-span-2">
            <h3 className="font-semibold text-white">Account</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link to="/login" className={linkClass}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className={linkClass}>
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/terms" className={linkClass}>
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-green-500" />
                <a href="tel:+918989712384" className={linkClass}>
                  +91 89897 12384
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-green-500" />
                <a
                  href="mailto:support@atozbroking.com"
                  className={`${linkClass} break-all`}
                >
                  support@atozbroking.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-green-500" />
                <span>Mon – Sat, 9:00 AM – 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} A To Z Broking. All rights reserved.</p>
          <Link to="/terms" className={linkClass}>
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
