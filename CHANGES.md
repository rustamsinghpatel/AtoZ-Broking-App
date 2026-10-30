# AtoZ Broking – Change Report

## Verification status (read first)
| Check | Result |
|---|---|
| Backend unit + faked-model tests (`cd backend && npm test`) | 24/24 pass |
| Backend: every file loads, every cross-file import resolves | pass |
| Frontend: JSX syntax, import/export resolution, undefined names (static) | pass |
| `vite build` / `npm run dev` | **NOT RUN** (no npm network in the build sandbox) |
| Backend against real MongoDB / real JWT / real HTTP | **NOT RUN** |
| Browser/visual check (footer, logo, responsive layouts) | **NOT RUN** |

Run `npm ci && npm run build` (frontend) and `npm install && npm test` (backend) locally before deploying.

## Root causes and fixes
1. **Change Password** – backend `PATCH /api/auth/password` already worked; the Profile modal only showed a "demo" toast. Modal now calls it. Backend hardened: min 8 chars + letter + number, 72-byte max, wrong-password attempts limited (5 / 15 min, in-memory), returns 400 (not 401) for a wrong current password, sets `passwordChangedAt`, returns a fresh token for the current device; older tokens everywhere else stop working.
2. **Automatic logout** – (a) any 401 cleared the session, now only server-declared session-ending codes do (`AUTH_EXPIRED/INVALID/USER_GONE/MISSING/PASSWORD_CHANGED`); network errors, 5xx, 403 and non-JSON proxy pages never log out; (b) the server now enforces a minimum session of `SESSION_MIN_HOURS` (8) even if `JWT_EXPIRES_IN` on the host is set shorter, with a startup warning; (c) the frontend tracks token expiry, shows a notice on Login, and syncs tabs. **Your production `JWT_EXPIRES_IN` was not visible to me; check the host's value.** Remember-me unchecked still uses sessionStorage (ends when the tab closes) by design.
3. **Logo** – one component (`components/Logo.jsx`) using `/images/atoz-logo.jpg` (landing asset) in Landing, Login, Signup, Terms, client Nav/sidebar, Admin sidebar, footer, favicon. Old `logo.jpeg` deleted (no references remained).
4. **KYC review** – admin lists only returned `pending`. Added `GET /api/admin/kyc/records`, `GET /api/admin/bank-kyc/records`, `GET /api/admin/kyc/:id/history`; new `KycAudit` collection records submissions, approvals, rejections and document views. Viewing never changes status; documents are never deleted. Viewer supports images and PDFs (sandboxed iframe); backend sends `nosniff`, CSP `sandbox`, `no-store`.
5. **Positions** – no endpoint created positions anywhere and the admin view was read-only. Client page rewritten (summary cards, mobile cards/desktop table, loading/empty/error+retry).
6. **Admin position creation** – `POST /api/admin/positions`, `PATCH /api/admin/positions/:id`, `GET /api/admin/positions/:id/audit`. Manual entries are labelled `admin_manual` and shown to clients as "Recorded by AtoZ". Idempotency key prevents duplicates; only active clients; reason required; old/new values audited; optimistic concurrency on edits.
7. **Footer** – new `components/layout/Footer.jsx` (landing page). Only real links/contacts used. The old "Privacy Policy" link pointed at `#support` (no such page) and was removed.
8. **Extras** – frontend `.env.example`; dev server no longer defaults to the production API; removed unused `mongodb` dependency from the frontend `package.json` (it was missing from the lockfile, which breaks `npm ci`); backend `npm test` script.

## Behaviour changes to be aware of
- Default client session is now **12h** (was 7d); admin **8h**. Set `JWT_EXPIRES_IN=7d` to keep 7 days.
- Change-password rules are stricter than signup (signup still allows 6 chars).
- Changing a password signs out all other devices.
- Manual positions require an admin-entered last price; the system never fetches or invents prices, and does not move wallet balances or create transactions.

## Limitations (not implemented)
- Closing a position / realising P&L from the admin panel (the repo has no defined closed-trade accounting rule).
- No broker/market-data integration exists, so positions cannot be verified against real executions.
- Attempt limiter is per-process memory (use Redis if you run several instances).
- KYC audit starts empty; history before this release is not available. If an audit write fails, the action still succeeds and the failure is logged with full details.
- Landing logo is the wide artwork cropped to a square (as before), not the whole image.
- Terms page does not include the new footer.

## Environment variables
Backend: `JWT_EXPIRES_IN`, `ADMIN_JWT_EXPIRES_IN`, `SESSION_MIN_HOURS` (all optional). Frontend: `VITE_API_URL`.
Database migration: none required (new optional fields; a unique partial index on `Position.clientRequestId` is created automatically by Mongoose). New collections: `kycaudits`, `positionaudits`.

## Modified / new files
Backend new: `models/KycAudit.js`, `models/PositionAudit.js`, `controllers/adminPositionController.js`, `utils/{sessionPolicy,kycAudit,positionRules}.js`, `middleware/attemptLimiter.js`, `tests/*`.
Backend modified: `utils/{generateToken,ApiError}.js`, `middleware/{authMiddleware,errorMiddleware}.js`, `models/{User,Position}.js`, `controllers/{authController,adminController,bankKycController}.js`, `routes/{adminRoutes,positionRoutes}.js`, `server.js`, `package.json`, `.env.example`.
Frontend new: `components/Logo.jsx`, `components/layout/Footer.jsx`, `components/admin/{adminUi,KycRecordsPanel,BankKycRecordsPanel,PositionManager}.jsx`, `.env.example`.
Frontend modified: `services/api.js`, `context/AuthContext.jsx`, `pages/{Admin,Positions,Profile,Login,Signup,Landing,Terms}.jsx`, `components/layout/Nav.jsx`, `index.html`, `package.json`. Deleted: `public/images/logo.jpeg`.
