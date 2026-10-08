# A2Z Broking Backend (Phase 1: Authentication)

Node.js + Express + MongoDB (Mongoose) backend for A2Z Broking.
This phase only covers **Registration, Login, JWT authentication and MongoDB user storage**.

| | URL |
|---|---|
| Backend (API) | http://localhost:5000 |
| Frontend (React + Vite) | http://localhost:5173 |

## Requirements

- Node.js 18 or newer
- A MongoDB database (local MongoDB or a free MongoDB Atlas cluster)

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Set up the `.env` file

Copy the example file and fill in real values:

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows (Command Prompt)
copy .env.example .env
```

Then edit `.env`:

| Variable | Meaning |
|---|---|
| `PORT` | Port the API runs on (default `5000`) |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Long random secret used to sign tokens |
| `CLIENT_URL` | Frontend origin allowed by CORS (`http://localhost:5173`) |
| `JWT_EXPIRES_IN` | Optional. Token lifetime, default `7d` |

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Never commit `.env`. It is already listed in `.gitignore`.

## 3. MongoDB connection

**Option A: Local MongoDB**

Install and start MongoDB, then use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/a2z_broking
```

**Option B: MongoDB Atlas**

1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user (username + password).
3. Under Network Access, allow your IP address.
4. Click Connect, then Drivers, and copy the connection string.
5. Put your password in it and add the database name `a2z_broking`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/a2z_broking
```

If the password contains special characters (`@`, `#`, `/`, `:`), URL-encode them.

The database and collections are created automatically on first use.

## 4. Run the server

```bash
npm run dev     # development, auto-restarts on changes (nodemon)
npm start       # production, plain node
```

On success you will see:

```
MongoDB connected: ...
Server running on http://localhost:5000
```

Quick check: open http://localhost:5000/api/health

## API endpoints

Base URL: `http://localhost:5000/api`

All responses are JSON. Success: `{ "success": true, "message": "...", "data": {...} }`.
Error: `{ "success": false, "message": "..." }` (validation errors also include an `errors` array).

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account, returns token + user |
| POST | `/api/auth/login` | No | Login with Client ID / email / mobile + password |
| GET | `/api/auth/me` | Bearer token | Current logged-in user |

### GET /api/health

```json
{ "success": true, "message": "A2Z Broking API is running" }
```

### POST /api/auth/register

```json
{
  "fullName": "Test User",
  "email": "test@example.com",
  "mobile": "9876543210",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

Returns `201` with `data.token` and `data.user` (includes the auto-generated `clientId`, e.g. `A2Z10001`).
Duplicate email or mobile returns `409`.

### POST /api/auth/login

`identifier` can be the Client ID, email, or mobile number:

```json
{ "identifier": "A2Z10001", "password": "secret123" }
```

Returns `200` with `data.token` and `data.user`. Wrong credentials return `401 Invalid credentials`.

### GET /api/auth/me

Header: `Authorization: Bearer <token>`

Returns `data.user`. Missing, invalid or expired token returns `401`.

## Test with curl

```bash
curl http://localhost:5000/api/health

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","mobile":"9876543210","password":"secret123","confirmPassword":"secret123"}'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"A2Z10001","password":"secret123"}'

curl http://localhost:5000/api/auth/me -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

## Folder structure

```
backend/
├── src/
│   ├── config/        db.js (MongoDB connection)
│   ├── controllers/   authController.js (register, login, me)
│   ├── middleware/    authMiddleware.js (JWT protect), errorMiddleware.js
│   ├── models/        User.js, Counter.js (Client ID sequence)
│   ├── routes/        authRoutes.js
│   ├── utils/         small helpers (validators, token, client ID, errors)
│   └── server.js      app entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Connecting the React frontend

Create `.env` in the **frontend** root (not in `backend/`):

```env
VITE_API_URL=http://localhost:5000/api
```

Then in `AuthContext`, call `POST ${VITE_API_URL}/auth/login` with `{ identifier, password }`,
store `data.token`, and send it as `Authorization: Bearer <token>` for protected calls.
Signup calls `POST ${VITE_API_URL}/auth/register` with all five fields.

## Troubleshooting

- **Missing required environment variable**: you have not created `.env`, or a variable is empty.
- **MongoDB connection failed**: check `MONGODB_URI`, that MongoDB is running, or that your IP is allowed in Atlas.
- **CORS error in the browser**: `CLIENT_URL` must exactly match the frontend origin (`http://localhost:5173`, no trailing slash). Restart the backend after editing `.env`.
- **Port already in use**: change `PORT` in `.env`.
