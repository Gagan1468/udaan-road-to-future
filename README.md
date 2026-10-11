# Udaan TechSolutions: homepage, courses & accounts

React + Vite frontend and FastAPI + PostgreSQL backend. The site has a 3D homepage for **Udaan TechSolutions**, the existing **Road to Future** course registration, shared accounts, a protected **profile & settings** area, and a project enquiry form.

## What changed in this version

| Area | Summary |
|---|---|
| Homepage `/` | Hero with a React Three Fiber installation, **rolling-block transitions** between sections, services, work, process, products, courses, about, contact form, full footer |
| Auth | The original `AuthModal` (email + Google via `POST /api/auth/google`) is unchanged and is now opened from the navbar. Token key `udaan_user_token` and the Bearer-token contract are unchanged, so existing sessions keep working |
| Shared session | The homepage and course/registration area are the **same SPA on one origin**, so they share one session. On load the token is verified server-side with `GET /api/auth/me`; a 401 clears it |
| Profile `/profile/*` | Overview, Account, Security, Privacy, Appearance, Sessions, Account management (protected; unauthenticated visitors get the existing sign-in modal and stay on the page they asked for) |
| Backend | `PATCH /api/auth/me`, `GET /api/auth/session`, `POST /api/auth/change-password`, `POST /api/auth/sessions/revoke-others`, `GET /api/auth/me/export`, `POST /api/auth/delete-account`, `POST /api/enquiries`, `GET /api/admin/enquiries`. Tokens now carry a `tv` (token version) claim that is checked against the database |
| Routing | Added `react-router-dom`. Routes: `/`, `/courses`, `/courses/road-to-future`, `/profile/*`, `/admin` |

The original course, registration and admin components were moved **verbatim** to `frontend/src/legacy/` and `components/auth/AuthModal.jsx`. Only their router wiring changed.

## Project structure

```
frontend/
  vercel.json                 SPA rewrite (needed for deep links like /profile)
  src/
    main.jsx, styles.css (legacy), styles/site.css (design system, dark + light tokens)
    app/        App, routes, ThemeContext, SceneContext
    auth/       AuthContext (shared session), RequireAuth
    components/
      layout/   Navbar (glass), MobileMenu, Footer
      sections/ Hero, Services, Work, Process, Products, Courses, About, Contact
      three/    blocks.js (modules + layouts), RollingTransition.js (engine), BlockAssembly,
                SceneLighting, HeroScene (Canvas), SceneLayer (lazy, WebGL check, fallback)
      ui/       Button, SectionHeading, ServiceVisual, LoadingState, ErrorMessage, ErrorBoundary
      auth/     AuthModal (original, moved verbatim)
    hooks/      useReducedMotion, useScrollProgress, useActiveSection, useReveal, usePageTitle
    legacy/     original course + admin components (moved verbatim)
    lib/        api.js (same contract + error.status), navigation.js, webgl.js
    data/       content.js  <- edit homepage facts here
    pages/      Home, Courses, Admin, profile/ProfileLayout + ProfileViews
    test/       vitest suites
backend/
  app/          main.py, models.py, schemas.py, security.py (extended)
  migrate_homepage_profile.sql   <- RUN BEFORE DEPLOYING
  tests/        pytest suites
```

## Local development

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env                                     # then edit
uvicorn app.main:app --reload --port 8000

# Frontend (second terminal)
cd frontend
npm install
cp .env.example .env                                     # VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID
npm run dev                                              # http://localhost:5173
```

## Tests and build

```bash
cd backend  && python -m pytest -q       # 14 tests (SQLite, no external services)
cd frontend && npm test                  # 27 tests (jsdom; network mocked)
cd frontend && npm run build             # production build -> dist/
```

## Environment variables

| Where | Variable | Notes |
|---|---|---|
| Frontend (Vercel) | `VITE_API_BASE_URL` | e.g. `https://udaan-road-to-future-api.onrender.com` |
| Frontend (Vercel) | `VITE_GOOGLE_CLIENT_ID` | public OAuth client id |
| Backend (Render) | `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `FRONTEND_ORIGIN`, `GOOGLE_CLIENT_ID` | unchanged. Never prefix secrets with `VITE_` |

## Deployment

1. **Database first.** Run `backend/migrate_homepage_profile.sql` once against the production PostgreSQL database. `create_all` adds the new `enquiries` table at startup but never alters existing tables, so the two new `users` columns need this script. Without it the API will error on every user query.
2. Deploy the backend (Render). Existing configuration is unchanged. CORS now also allows `PATCH`.
3. Deploy the frontend (Vercel). `frontend/vercel.json` rewrites all paths to `index.html` so `/profile` and `/courses/...` work on refresh. Root directory: `frontend`, build: `npm run build`, output: `dist`.

**Rolling out token versions:** tokens issued before this release have no `tv` claim and are treated as version 0, so existing users stay signed in.

## Security notes and honest limitations

- Auth is still a **Bearer token in `localStorage`** (unchanged from the original app). It is verified server-side on every protected request, and now also against the account's `token_version`, so password changes, "sign out other devices" and account deletion invalidate tokens immediately. A token in `localStorage` is readable by any script on the page (XSS), the usual trade-off of this model. Moving to HttpOnly cookies would need a backend + CORS change and is not done here.
- **Logout** removes the token locally; it does not revoke it server-side. Use "Sign out other devices" or change your password to invalidate tokens everywhere.
- **Sessions page** can show this session and revoke all others; it cannot list individual devices (tokens are stateless).
- **Email change** and **password reset by email** are not implemented: the backend has no email-sending or verification flow. The UI says so instead of faking it.
- **Privacy:** product-update preference and data export/delete are real and persisted. Profile visibility and analytics preferences are not offered because the product has neither.
- **Appearance** is stored per device. Light/dark applies to the homepage, profile and navbar; the course and admin pages keep their original dark design.
- **Enquiry spam protection:** honeypot field + 5 enquiries/hour per IP, in-process (resets on restart; per instance). Submissions are readable via `GET /api/admin/enquiries` (admin token). There is no admin UI for them yet, and no email notification is sent.
- Content: the only real work/product in this repo is the course platform. The two other work items are labelled **CONCEPT**; the second product slot says "To be announced". Edit `frontend/src/data/content.js` when real items exist. No privacy/terms links or contact details appear because no such pages/data exist.
- The 3D chunk is ~830 kB (~223 kB gzip) and is lazy-loaded after first paint.

## What runs where?

- **GitHub:** source code and version history.
- **Frontend hosting (e.g. Vercel/Netlify):** serves the React website.
- **Backend hosting (e.g. Render/Railway):** runs the FastAPI API.
- **PostgreSQL hosting (e.g. Neon/Supabase/Render):** stores registrations persistently.

GitHub alone does not run this app or provide a live PostgreSQL database. Do not commit `.env` files, passwords, API keys, or production database URLs.

## Features

- Course listing and Road to Future detail page
- Email/password account signup and login\n- Optional Google Identity Services sign-in (requires OAuth Client ID configuration)\n- User accounts stored in PostgreSQL; passwords stored as salted PBKDF2 hashes\n- Course registrations linked to signed-in users\n- Individual and school registration
- Persistent PostgreSQL storage
- Server-side maximum of 100 school registrations (transaction-safe PostgreSQL advisory lock)
- Admin login using a server-side password hash and signed session token
- Admin dashboard with stats, search, type/class filters, recent registrations
- CSV and JSON exports from the database
- Admin-only deletion with confirmation in UI
- Local development setup

## Requirements

- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ (local or hosted)

## 1. Backend setup

Open a terminal in `backend/`:

```bash
python -m venv .venv
# Windows PowerShell:
.venv\\Scripts\\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and set:
- `DATABASE_URL` to your PostgreSQL connection URL
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` to a strong password
- `SESSION_SECRET` to a long random secret (32+ characters)
- `FRONTEND_ORIGIN=http://localhost:5173`\n- `GOOGLE_CLIENT_ID` to the Google OAuth Web Client ID (leave blank to disable Google sign-in)

For hosted PostgreSQL providers, the URL may start with `postgresql://`. This project normalizes it for psycopg.

Start the backend:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The `users` table is created automatically. If you are upgrading an existing database, first start the backend once so it creates `users`, then run `backend/migrate_user_accounts.sql` once in the `udaan_courses` database to add `registrations.user_id`. Existing registrations remain unlinked. For production, use Alembic migrations.

API docs: http://127.0.0.1:8000/docs

## 2. Frontend setup

Open a second terminal in `frontend/`:

```bash
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Frontend `.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Open http://localhost:5173

## 3. First admin login

Use the username and password configured in `backend/.env`. Student accounts are separate from admin accounts. The password is checked by the backend; do not add admin credentials to frontend code.

## 4. Deploying

1. Push the project to GitHub.
2. Deploy `frontend/` to Vercel or Netlify. Set `VITE_API_BASE_URL` to the deployed backend URL.
3. Deploy `backend/` as a Python web service. Start command:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Provision PostgreSQL and set `DATABASE_URL` in backend hosting environment variables.
5. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, and `FRONTEND_ORIGIN` in backend hosting environment variables.
6. Set frontend hosting `VITE_API_BASE_URL` to the backend's HTTPS URL and set `FRONTEND_ORIGIN` to the exact frontend origin.
7. Use HTTPS for both services. Rotate the admin password and session secret before public launch. Never share the `.env` file.

Hosting providers change their free plans and limits. Check current pricing and availability before choosing a provider.

## Security notes

- The admin login is a simple single-admin starter, not an enterprise identity system.
- The signed token is stored in sessionStorage and expires after 8 hours. For stricter production security, use secure, HttpOnly cookies and add CSRF protection.
- Public registration collects personal information. Publish an appropriate privacy notice and restrict data retention before launch.
- Do not collect sensitive information. Do not commit `.env` or database backups.
- Configure database backups and monitoring for production.
