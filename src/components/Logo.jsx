// Reusable logo for Login and other pages
export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/atoz-logo.jpg"
        alt="AtoZ Broking Logo"
        className="h-16 w-16 object-contain"
      />

      <div>
        <p className="text-lg font-bold tracking-tight text-slate-900">
          A To Z <span className="text-green-600">Broking</span>
        </p>

        <p className="text-xs text-slate-500">
          Client Investment Portal
        </p>
      </div>
    </div>
  );
}

export default Logo;