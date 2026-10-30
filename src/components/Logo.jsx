import { Link } from "react-router-dom";

// ONE logo for the whole application: the exact image the landing page uses.
// Every place that shows the brand (landing, login, signup, client portal,
// admin panel, footer) imports from this file, so the asset can only be
// changed in one spot.
export const LOGO_SRC = "/images/atoz-logo.jpg";

// Fixed square boxes. The artwork is wide, so object-cover keeps its
// proportions (it is cropped to the square, never stretched), exactly as the
// landing page header has always shown it.
const BOX = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-12 w-12 rounded-xl",
  lg: "h-16 w-16 rounded-2xl",
  // Smaller on phones, full size from the sm breakpoint up.
  responsive: "h-12 w-12 rounded-xl sm:h-16 sm:w-16 sm:rounded-2xl",
};

const NAME_TEXT = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  responsive: "text-base sm:text-xl",
};

export function LogoImage({ size = "md", className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt="AtoZ Broking logo"
      width={64}
      height={64}
      className={`shrink-0 object-cover ${BOX[size] || BOX.md} ${className}`}
    />
  );
}

// Logo + brand name.
//   size      sm | md | lg | responsive
//   dark      true on dark backgrounds (footer, login hero)
//   subtitle  small line under the name; pass null to hide it
//   to        when given, the whole logo is a link
export function Logo({
  size = "md",
  dark = false,
  subtitle = "Client Investment Portal",
  to,
  className = "",
}) {
  const content = (
    <>
      <LogoImage size={size} />

      <div className="min-w-0">
        <p
          className={`truncate font-bold tracking-tight ${NAME_TEXT[size] || NAME_TEXT.md} ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          A To Z{" "}
          <span className={dark ? "text-green-400" : "text-green-600"}>
            Broking
          </span>
        </p>

        {subtitle && (
          <p
            className={`truncate text-xs ${
              dark ? "text-green-200" : "text-slate-500"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </>
  );

  const classes = `flex min-w-0 items-center gap-3 ${className}`;

  return to ? (
    <Link to={to} className={classes} aria-label="AtoZ Broking home">
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export default Logo;
