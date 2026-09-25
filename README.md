# Family Book

Family Book is a private family document and photo vault. You can securely upload, store,
preview, download, and manage photos, PDFs, and personal documents. Nothing is accessible
without logging in, and every file request is checked against the logged-in user's own
files — so no one can view another user's files by guessing or changing an ID in the URL.

## Features

- Email/password auth with bcrypt hashing, JWT access + refresh tokens in HTTP-only cookies
- Register, login, logout, forgot/reset password (never reveals whether an email exists)
- Ownership-checked file access on every read/preview/download/delete (IDOR-safe)
- Drag-and-drop multi-file upload with per-file progress, retry, and MIME/extension validation
- Files stored in **MongoDB GridFS** (streamed, not buffered in memory) — metadata in MongoDB
- Photo gallery with full-screen viewer, zoom, next/prev; secure in-browser PDF viewer
- Categories (Photos / Documents / PDFs), search, sort, grid/list view
- Favorites, Trash with restore / permanent delete / empty trash
- Dashboard with storage stats and recent uploads
- Settings: change password, active sessions, login history, logout-all-devices, theme
- Rate limiting on auth routes, Helmet security headers, CORS allow-list, NoSQL-injection
  sanitization, consistent JSON error responses, no stack traces or secrets leaked to clients
- Jest + Supertest test suite covering auth, uploads, and cross-user access (IDOR) protection

## Tech Stack

- **Backend:** Node.js, Express, Mongoose, MongoDB GridFS, JWT, bcryptjs, Multer, Helmet
- **Frontend:** React + Vite, React Router, Axios, Tailwind CSS, Lucide icons
- **Database:** MongoDB Atlas (your own cluster — see setup below)

## Project Structure

```
family-book/
├── backend/
│   ├── src/
│   │   ├── config/       # env loading, MongoDB + GridFS connection
│   │   ├── controllers/  # request handlers (auth, files, trash, security)
│   │   ├── middleware/   # auth guard, rate limiting, upload validation, error handler
│   │   ├── models/       # User, File, Session, LoginHistory (Mongoose schemas)
│   │   ├── routes/       # /api/auth, /api/files, /api/favorites, /api/trash, /api/security
│   │   ├── services/     # GridFS upload/download/delete streaming
│   │   ├── utils/        # tokens, ApiError, asyncHandler
│   │   ├── app.js        # Express app (middleware + routes)
│   │   └── server.js     # connects to MongoDB, starts the HTTP server
│   ├── tests/            # Jest + Supertest (in-memory MongoDB)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios client with automatic token refresh
│   │   ├── components/   # Sidebar, FileCard, UploadModal, ImageViewer, PdfViewer, etc.
│   │   ├── context/      # Auth, Theme, Toast providers
│   │   ├── pages/        # Landing, Login, Register, Dashboard, Photos, Documents, PDFs,
│   │   │                 # Favorites, Trash, Settings, Upload
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## 1. MongoDB Atlas Setup (you own this database)

1. Go to https://cloud.mongodb.com and create a free account (or sign in).
2. Click **Create a Cluster** (the free M0 tier is enough to start).
3. Under **Database Access**, add a new database user with a username and a strong
   auto-generated password. Save these — you'll need them for the connection string.
4. Under **Network Access**, click **Add IP Address**. For local development you can allow
   your current IP, or `0.0.0.0/0` temporarily (not recommended for production — restrict
   this to your server's IP once deployed).
5. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
6. Add a database name to the path, e.g. `.../familybook?retryWrites=true...`, and paste the
   full string into `backend/.env` as `MONGODB_URI`. Replace `<username>` and `<password>`
   with the database user you created (not your Atlas login).

No third party ever holds this connection string — it lives only in your own `.env` file,
which is git-ignored and never committed.

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/familybook?retryWrites=true&w=majority
JWT_ACCESS_SECRET=<generate with the command below>
JWT_REFRESH_SECRET=<generate a different one the same way>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=26214400
COOKIE_SECURE=false
```

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Install and run:

```bash
npm install
npm run dev      # starts on http://localhost:5000 with nodemon
# or: npm start
```

Run the test suite (spins up an in-memory MongoDB, no real database needed for tests):

```bash
npm test
```

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

The Vite dev server also proxies `/api` to `http://localhost:5000`, so the app works even if
`VITE_API_URL` is left at its default during local development.

## 4. Using the App

1. Open http://localhost:5173 — you'll see the public landing page.
2. Click **Create Account**, register, then **Login**.
3. You're taken to the Dashboard. Use **Upload** to add photos, PDFs, or documents.
4. Browse by category in the sidebar, mark favorites, delete (moves to Trash), restore, or
   permanently delete. Use Settings to change your password, review login history, and manage
   active sessions.

## API Documentation

All responses follow a consistent shape:

```json
{ "success": true, "message": "…", "data": { } }
{ "success": false, "message": "…" }
```

All routes below except `/api/auth/*` and `/api/health` require a valid session
(HTTP-only `accessToken` cookie, refreshed automatically via `/api/auth/refresh`).

### Auth — `/api/auth`
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Create an account |
| POST | `/login` | Log in, sets auth cookies |
| POST | `/logout` | Revoke the current session |
| POST | `/refresh` | Issue a new access token from the refresh cookie |
| POST | `/forgot-password` | Always returns a generic success message |
| POST | `/reset-password` | Reset password with a token |
| GET | `/me` | Current authenticated user |

### Files — `/api/files`
| Method | Route | Description |
|---|---|---|
| GET | `/stats` | Dashboard totals and recent uploads |
| POST | `/upload` | Multipart upload (field name `files`, up to 10) |
| GET | `/` | List files — query: `category`, `search`, `sort`, `favorite`, `page`, `limit` |
| GET | `/:id` | File metadata (ownership-checked) |
| GET | `/:id/preview` | Streams file inline for in-browser preview |
| GET | `/:id/download` | Streams file as an attachment download |
| PATCH | `/:id` | Rename or recategorize a file |
| PATCH | `/:id/favorite` | Toggle favorite |
| DELETE | `/:id` | Soft-delete (moves to Trash) |

### Favorites — `/api/favorites`
| GET | `/` | List favorite files |

### Trash — `/api/trash`
| GET | `/` | List trashed files |
| PATCH | `/:id/restore` | Restore a file |
| DELETE | `/:id/permanent` | Permanently delete one file |
| DELETE | `/empty` | Permanently delete everything in trash |

### Security — `/api/security`
| GET | `/sessions` | Active sessions |
| POST | `/logout-all` | Revoke all sessions |
| GET | `/login-history` | Recent login attempts |
| POST | `/change-password` | Change password (revokes other sessions) |

## Security Notes

- Passwords are hashed with **bcrypt** (cost factor 12) — never stored in plain text.
- Auth uses short-lived JWT access tokens plus longer-lived refresh tokens, both delivered as
  **HTTP-only, SameSite cookies** so they aren't reachable from JavaScript (mitigates XSS token
  theft). Set `COOKIE_SECURE=true` and serve over HTTPS in production.
- **Every** file route re-verifies both authentication *and* ownership (`owner` field must
  match the logged-in user) before returning metadata, streaming a preview, streaming a
  download, or deleting — this is what prevents IDOR (accessing another user's file by
  changing the ID in the URL). See the "User A cannot access User B's files" test.
- Uploads are validated by MIME type *and* file extension against an allow-list
  (JPG/PNG/WEBP/PDF only); the server generates a random filename for storage and never trusts
  the client-supplied filename or executes anything from `uploads`.
- `express-mongo-sanitize` strips `$`/`.` from user input to block NoSQL injection; all IDs are
  validated as proper Mongo ObjectIds by Mongoose before any query runs.
- Login and registration are rate-limited to slow down brute-force attempts.
- Password-reset responses are identical whether or not the email exists, so the API never
  reveals which emails are registered.
- Error responses never include stack traces, database connection strings, or JWT secrets.

## Deployment

**Frontend (Vercel):**
1. Push this repo to GitHub.
2. Import the `frontend/` directory as a Vercel project (framework preset: Vite).
3. Set the environment variable `VITE_API_URL` to your deployed backend's URL, e.g.
   `https://api.yourdomain.com/api`.
4. Deploy.

**Backend (any Node host — Render, Railway, Fly.io, a VPS, etc.):**
1. Deploy the `backend/` directory.
2. Set environment variables from `backend/.env.example` in your host's dashboard:
   `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`,
   `JWT_REFRESH_EXPIRES_IN`, `PORT`, `NODE_ENV=production`, `CORS_ORIGIN` (your Vercel domain),
   `MAX_FILE_SIZE`, `COOKIE_SECURE=true`.
3. In MongoDB Atlas → Network Access, add your backend host's outbound IP (or, if it's
   dynamic, your host's documented IP range) instead of leaving it open to everyone.
4. Never put `JWT_*` secrets or `MONGODB_URI` in the **frontend's** environment variables —
   only `VITE_API_URL` belongs there, since anything prefixed `VITE_` is bundled into the
   public JavaScript sent to browsers.

## Testing

```bash
cd backend
npm test
```

Covers: registration, login (correct/incorrect password), unauthenticated access being
blocked, logout, file upload with type validation, and — most importantly — that **User A
cannot download, preview, or delete User B's files**, even with a valid file ID.
